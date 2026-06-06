#!/bin/bash
# ============================================================
#  ai-stack-setup.sh
#  Full setup + launcher for the AI Dev Stack
#  Stack: OpenCode + OpenChamber + Open Design +
#         Agent-Browser (Live Stream + Dashboard)
#  Targets: GitHub Codespaces + Ubuntu VPS (22.04 / 24.04)
#  Usage:
#    bash ai-stack-setup.sh                           # interactive (asks for DuckDNS)
#    bash ai-stack-setup.sh --non-interactive         # auto-password, no DuckDNS, no SSL
#    bash ai-stack-setup.sh --domain foo --token abc  # one-click with DuckDNS + SSL
#    bash ai-stack-setup.sh --skip-duckdns            # no domain prompts at all
#
#  First run  → installs everything then starts all services
#  Every restart → skips install, just starts all services
#  VPS mode   → sets up DuckDNS + Nginx + SSL automatically
#
#  Session isolation:
#    - Main stack (opencode + openchamber) shares one DB
#    - Open Design has its own XDG_DATA_HOME
#    - Nothing leaks between them
# ============================================================

set -uo pipefail

# ── Colors ───────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}[!]${NC} $1"; }
info()   { echo -e "${BLUE}[→]${NC} $1"; }
err()    { echo -e "${RED}[✗]${NC} $1"; exit 1; }
header() {
  echo -e "\n${CYAN}${BOLD}══════════════════════════════════════${NC}"
  echo -e "${CYAN}${BOLD}  $1${NC}"
  echo -e "${CYAN}${BOLD}══════════════════════════════════════${NC}"
}

# ── Detect environment ────────────────────────────────────────
IS_CODESPACE=false
IS_VPS=false

[[ -n "${CODESPACE_NAME:-}" ]] && IS_CODESPACE=true
$IS_CODESPACE || IS_VPS=true

UBUNTU_VER=$(lsb_release -rs 2>/dev/null || echo "22.04")
UBUNTU_MAJOR=$(echo "$UBUNTU_VER" | cut -d. -f1)

if $IS_CODESPACE; then
  warn "GitHub Codespaces detected — headless mode, no systemd"
  ENV_TYPE="codespace"
else
  info "VPS detected — full setup with Nginx + SSL + DuckDNS"
  ENV_TYPE="vps"
fi
info "Ubuntu $UBUNTU_VER"

# ── CLI flags ──────────────────────────────────────────────────
NON_INTERACTIVE=0
OPT_DOMAIN=""
OPT_TOKEN=""
OPT_SKIP_DUCKDNS=0
OPT_EMAIL=""

while [ $# -gt 0 ]; do
  case "$1" in
    --non-interactive) NON_INTERACTIVE=1 ;;
    --domain) shift; OPT_DOMAIN="$1" ;;
    --domain=*) OPT_DOMAIN="${1#--domain=}" ;;
    --token) shift; OPT_TOKEN="$1" ;;
    --token=*) OPT_TOKEN="${1#--token=}" ;;
    --skip-duckdns) OPT_SKIP_DUCKDNS=1 ;;
    --email) shift; OPT_EMAIL="$1" ;;
    --email=*) OPT_EMAIL="${1#--email=}" ;;
    --help|-h)
      echo "Usage: bash ai-stack-setup.sh [options]"
      echo ""
      echo "  --domain <name> [--token <t>]  DuckDNS (foo + token) OR custom domain (mystack.com)"
      echo "  --email <email>                Certbot email for SSL certificate notifications"
      echo "  --skip-duckdns                 No domain at all (local-only)"
      echo "  --non-interactive              Auto-generate password"
      echo "  --help                         Show this help"
      echo ""
      echo "Examples:"
      echo "  bash ai-stack-setup.sh --domain myproject --token abc123   # DuckDNS"
      echo "  bash ai-stack-setup.sh --domain mystack.com                # custom domain"
      echo "  bash ai-stack-setup.sh --skip-duckdns                      # no domain"
      exit 0
      ;;
    *) warn "Unknown argument: $1 (ignored)" ;;
  esac
  shift
done

# ── Ports ─────────────────────────────────────────────────────
PORT_OPENCODE=4095
PORT_OPENCHAMBER=3000
PORT_OPENDESIGN=7456
PORT_OPENDESIGN_OC=7457   # separate opencode for open design sessions
PORT_BROWSER_STREAM=9223
PORT_BROWSER_DASH=4848

# ── Session isolation: separate data directories ─────────────
STACK_DATA_DIR="$HOME/.local/share/ai-stack"
OPENDESIGN_DATA_DIR="$HOME/open-design/.data"

# ── PATH setup ────────────────────────────────────────────────
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$PNPM_HOME:$HOME/.local/bin/opencode:$PATH"

INSTALL_DONE_FLAG="$HOME/.ai-stack-installed"

# ═══════════════════════════════════════════════════════════════
#  SECTION 1: INSTALL (skipped if already done)
# ═══════════════════════════════════════════════════════════════

if [[ ! -f "$INSTALL_DONE_FLAG" ]]; then

  header "FIRST TIME SETUP"

  # ── Master password ────────────────────────────────────────
  header "MASTER PASSWORD"
  if [[ "$NON_INTERACTIVE" -eq 1 ]]; then
    MASTER_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c20)
    echo -e "  ${GREEN}Generated Master Password: ${BOLD}${MASTER_PASS}${NC}"
  else
    echo ""
    echo -e "  ${BOLD}One password protects all services.${NC}"
    echo -e "  Press ENTER to auto-generate a strong password."
    echo ""
    read -rp "  Master password: " MASTER_PASS
    if [[ -z "$MASTER_PASS" ]]; then
      MASTER_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c20)
      echo -e "  ${GREEN}Generated: ${BOLD}${MASTER_PASS}${NC}"
    fi
  fi

  # ── Domain setup (VPS only) ─────────────────────────────────
  # Three modes:
  #   1. DuckDNS: --domain foo --token abc  → foo.duckdns.org + API + cron
  #   2. Custom:  --domain mystack.com      → Nginx + SSL, no DuckDNS API
  #   3. None:    --skip-duckdns            → skip everything
  DOMAIN_NAME=""
  DOMAIN_IS_DUCKDNS=false
  CERT_EMAIL=""

  if $IS_VPS && [[ "$OPT_SKIP_DUCKDNS" -eq 0 ]]; then
    # Mode 1: DuckDNS via CLI flags
    if [[ -n "$OPT_DOMAIN" && -n "$OPT_TOKEN" ]]; then
      if [[ "$OPT_DOMAIN" == *.* ]]; then
        DOMAIN_NAME="$OPT_DOMAIN"
      else
        DOMAIN_NAME="${OPT_DOMAIN}.duckdns.org"
      fi
      DOMAIN_IS_DUCKDNS=true
      DUCKDNS_TOKEN="$OPT_TOKEN"

      info "DuckDNS domain: $DOMAIN_NAME"
      UPDATE_RESULT=$(curl -s "https://www.duckdns.org/update?domains=${OPT_DOMAIN}&token=${OPT_TOKEN}&ip=")
      if [[ "$UPDATE_RESULT" == "OK" ]]; then
        log "DuckDNS updated — $DOMAIN_NAME is live"
      else
        warn "DuckDNS update returned: $UPDATE_RESULT — check your token and subdomain"
      fi

      CRON_JOB="*/5 * * * * curl -s \"https://www.duckdns.org/update?domains=${OPT_DOMAIN}&token=${OPT_TOKEN}&ip=\" > /dev/null"
      (crontab -l 2>/dev/null | grep -v "duckdns.org"; echo "$CRON_JOB") | crontab -
      log "DuckDNS auto-update cron set (every 5 min)"

    # Mode 2: Custom domain via CLI flag (no token)
    elif [[ -n "$OPT_DOMAIN" ]]; then
      DOMAIN_NAME="$OPT_DOMAIN"
      info "Custom domain: $DOMAIN_NAME (no DuckDNS API)"

    # Non-interactive with no domain args
    elif [[ "$NON_INTERACTIVE" -eq 1 ]]; then
      warn "No --domain provided — skipping domain setup."
      warn "  DuckDNS:  bash ai-stack-setup.sh --domain foo --token abc123"
      warn "  Custom:   bash ai-stack-setup.sh --domain mystack.com"
      warn "  None:     bash ai-stack-setup.sh --skip-duckdns"

    # Interactive: ask the user
    else
      header "DOMAIN SETUP"
      echo ""
      echo -e "  ${BOLD}Three options:${NC}"
      echo -e "  1. DuckDNS  (free, e.g. myproject.duckdns.org) — get a token at ${CYAN}duckdns.org${NC}"
      echo -e "  2. Custom domain (e.g. mystack.com) — point its DNS A record to this server first"
      echo -e "  3. Skip — no public URL, local-only access"
      echo ""
      read -rp "  Domain (Enter to skip): " DOMAIN_INPUT

      if [[ -n "$DOMAIN_INPUT" ]]; then
        # Check if it looks like a DuckDNS subdomain (no dots) or a real domain
        if [[ "$DOMAIN_INPUT" == *.* ]]; then
          DOMAIN_NAME="$DOMAIN_INPUT"
          info "Custom domain: $DOMAIN_NAME"
        else
          read -rp "  DuckDNS token: " DUCKDNS_TOKEN
          if [[ -n "$DUCKDNS_TOKEN" ]]; then
            DOMAIN_NAME="${DOMAIN_INPUT}.duckdns.org"
            DOMAIN_IS_DUCKDNS=true
            UPDATE_RESULT=$(curl -s "https://www.duckdns.org/update?domains=${DOMAIN_INPUT}&token=${DUCKDNS_TOKEN}&ip=")
            if [[ "$UPDATE_RESULT" == "OK" ]]; then
              log "DuckDNS updated — $DOMAIN_NAME is live"
            else
              warn "DuckDNS update returned: $UPDATE_RESULT — check your token and subdomain"
            fi
            CRON_JOB="*/5 * * * * curl -s \"https://www.duckdns.org/update?domains=${DOMAIN_INPUT}&token=${DUCKDNS_TOKEN}&ip=\" > /dev/null"
            (crontab -l 2>/dev/null | grep -v "duckdns.org"; echo "$CRON_JOB") | crontab -
            log "DuckDNS auto-update cron set (every 5 min)"
          fi
        fi
      fi
    fi
  fi

  if $IS_VPS && [[ -n "$DOMAIN_NAME" ]]; then
    CERT_EMAIL="${OPT_EMAIL:-}"
    if [[ -z "$CERT_EMAIL" ]]; then
      if [[ "$NON_INTERACTIVE" -eq 1 ]]; then
        CERT_EMAIL="admin@${DOMAIN_NAME}"
      else
        read -rp "  Enter email for SSL certificate notifications (Enter for admin@${DOMAIN_NAME}): " CERT_EMAIL
        [[ -z "$CERT_EMAIL" ]] && CERT_EMAIL="admin@${DOMAIN_NAME}"
      fi
    fi
  fi

  # Save all config
  cat > ~/.stack-passwords << EOF
# AI Stack config — do not delete
# Generated: $(date)
MASTER_PASS=${MASTER_PASS}
PORT_OPENCODE=${PORT_OPENCODE}
PORT_OPENCHAMBER=${PORT_OPENCHAMBER}
PORT_OPENDESIGN=${PORT_OPENDESIGN}
PORT_OPENDESIGN_OC=${PORT_OPENDESIGN_OC}
PORT_BROWSER_STREAM=${PORT_BROWSER_STREAM}
PORT_BROWSER_DASH=${PORT_BROWSER_DASH}
ENV_TYPE=${ENV_TYPE}
DOMAIN_NAME=${DOMAIN_NAME}
DOMAIN_IS_DUCKDNS=${DOMAIN_IS_DUCKDNS}
CERT_EMAIL=${CERT_EMAIL}
STACK_DATA_DIR=${STACK_DATA_DIR}
OPENDESIGN_DATA_DIR=${OPENDESIGN_DATA_DIR}
EOF
  chmod 600 ~/.stack-passwords
  log "Config saved to ~/.stack-passwords"

  # ── PATH persistence ───────────────────────────────────────
  if [[ -n "${NVM_DIR:-}" || -f "$HOME/.nvm/nvm.sh" ]]; then
    info "NVM detected — skipping custom npm-global prefix to avoid conflicts"
    mkdir -p "$PNPM_HOME"
  else
    mkdir -p "$PNPM_HOME" "$HOME/.npm-global"
    npm config set prefix "$HOME/.npm-global" 2>/dev/null || true
  fi
  for line in \
    'export PNPM_HOME="$HOME/.local/share/pnpm"' \
    'export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$PNPM_HOME:$HOME/.local/bin/opencode:$PATH"'; do
    grep -qxF "$line" ~/.bashrc 2>/dev/null || echo "$line" >> ~/.bashrc
  done

  # ── System packages ────────────────────────────────────────
  header "SYSTEM PACKAGES"
  info "Updating apt..."
  sudo apt-get update -qq

  [[ "$UBUNTU_MAJOR" -ge 24 ]] && LIBASOUND="libasound2t64" || LIBASOUND="libasound2"

  COMMON_PACKAGES="curl wget git unzip build-essential tmux htop jq \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 \
    $LIBASOUND libpangocairo-1.0-0 libgtk-3-0 \
    ca-certificates gnupg python3-pip"

  VPS_PACKAGES="nginx certbot python3-certbot-nginx ufw"

  if $IS_VPS; then
    sudo apt-get install -y -qq $COMMON_PACKAGES $VPS_PACKAGES || true
  else
    sudo apt-get install -y -qq $COMMON_PACKAGES || true
  fi
  log "System packages installed"

  # ── Firewall (VPS only) ────────────────────────────────────
  if $IS_VPS; then
    header "FIREWALL"
    sudo ufw allow OpenSSH 2>/dev/null || true
    sudo ufw allow 'Nginx Full' 2>/dev/null || true
    sudo ufw --force enable 2>/dev/null || true
    log "Firewall configured — SSH + HTTP/HTTPS open"
  fi

  # ── Node.js ────────────────────────────────────────────────
  header "NODE.JS"
  NODE_VER=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo "0")
  if [[ "$NODE_VER" -lt 20 ]]; then
    info "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - -q
    sudo apt-get install -y -qq nodejs
  fi
  log "Node.js $(node -v) ready"

  # ── OpenCode ───────────────────────────────────────────────
  header "OPENCODE"
  if ! command -v opencode &>/dev/null; then
    info "Installing OpenCode..."
    curl -fsSL https://opencode.ai/install | bash 2>/dev/null || true
    export PATH="$HOME/.local/bin/opencode:$PATH"
  fi
  mkdir -p ~/.config/opencode
  cat > ~/.config/opencode/opencode.json << EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "server": {
    "port": ${PORT_OPENCODE},
    "hostname": "127.0.0.1"
  },
  "permission": {
    "bash": "allow",
    "edit": "allow",
    "webfetch": "allow",
    "read": "allow"
  }
}
EOF
  log "OpenCode installed and configured"

  # Ensure pnpm is installed globally in user-space
  if ! command -v pnpm &>/dev/null; then
    info "Installing pnpm..."
    npm install -g pnpm --quiet 2>/dev/null || true
  fi

  # ── Agent-Browser ──────────────────────────────────────────
  header "AGENT-BROWSER"
  if ! command -v agent-browser &>/dev/null; then
    info "Installing agent-browser..."
    npm install -g agent-browser --quiet 2>/dev/null || true
  fi
  info "Installing Chrome for agent-browser..."
  agent-browser install --with-deps 2>/dev/null || true
  info "Installing agent-browser skill for OpenCode..."
  npx skills add vercel-labs/agent-browser 2>/dev/null || true
  log "Agent-browser installed"

  # ── OpenChamber ────────────────────────────────────────────
  header "OPENCHAMBER"
  if ! command -v openchamber &>/dev/null; then
    info "Installing OpenChamber..."
    npm install -g @openchamber/web --quiet 2>/dev/null || true
  fi
  log "OpenChamber installed"

  # ── Open Design ────────────────────────────────────────────
  header "OPEN DESIGN"
  if [[ ! -d ~/open-design ]]; then
    info "Cloning Open Design..."
    git clone --depth=1 https://github.com/nexu-io/open-design.git ~/open-design
  fi
  if [[ ! -d ~/open-design/node_modules ]]; then
    info "Installing Open Design dependencies (2-3 min)..."
    cd ~/open-design
    corepack enable 2>/dev/null || true
    pnpm install --silent 2>/dev/null || true
    info "Building Open Design..."
    pnpm build 2>/dev/null || true
    cd ~
  fi
  OD_API_TOKEN=$(openssl rand -hex 32)
  echo "OD_API_TOKEN=${OD_API_TOKEN}" > ~/open-design/.env

  # ── Create separate data dir for open-design contex ────────
  mkdir -p "$OPENDESIGN_DATA_DIR"
  log "Open Design ready (isolated data dir: $OPENDESIGN_DATA_DIR)"

  # ── Nginx + SSL (VPS only, requires domain) ────────────────
  if $IS_VPS && [[ -n "$DOMAIN_NAME" ]] && [[ "$OPT_SKIP_DUCKDNS" -eq 0 ]]; then
    header "NGINX + SSL"

    # Write Nginx config
    sudo tee /etc/nginx/sites-available/ai-stack > /dev/null << NGINX
server {
    listen 80;
    server_name ${DOMAIN_NAME};

    # OpenChamber (subpath redirection & routing)
    location /chamber/ {
        proxy_pass http://localhost:${PORT_OPENCHAMBER}/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    location /chamber {
        return 301 \$scheme://\$http_host\$request_uri/;
    }

    # Open Design
    location /design/ {
        proxy_pass http://localhost:${PORT_OPENDESIGN}/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    location /design {
        return 301 \$scheme://\$http_host\$request_uri/;
    }

    # Agent-Browser Dashboard
    location /agent/ {
        proxy_pass http://localhost:${PORT_BROWSER_DASH}/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    location /agent {
        return 301 \$scheme://\$http_host\$request_uri/;
    }

    # Agent-Browser Stream (WebSocket)
    location /stream {
        proxy_pass http://localhost:${PORT_BROWSER_STREAM}/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }

    # Root → OpenChamber
    location / {
        proxy_pass http://localhost:${PORT_OPENCHAMBER};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

    sudo ln -sf /etc/nginx/sites-available/ai-stack /etc/nginx/sites-enabled/ai-stack
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx
    log "Nginx configured"

    # SSL via Let's Encrypt
    info "Getting SSL certificate for $DOMAIN_NAME..."
    sudo certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos \
      --email "$CERT_EMAIL" --redirect 2>/dev/null || \
      warn "SSL cert failed — run: sudo certbot --nginx -d $DOMAIN_NAME"
    log "SSL configured"
  fi

  # ── Mark install complete ──────────────────────────────────
  touch "$INSTALL_DONE_FLAG"
  header "INSTALL COMPLETE"
  log "All tools installed. Starting stack now..."
  sleep 1

else
  info "Install already done — skipping to launch"
fi

# ═══════════════════════════════════════════════════════════════
#  SECTION 2: LAUNCH (runs every time)
# ═══════════════════════════════════════════════════════════════

source ~/.stack-passwords 2>/dev/null || \
  err "~/.stack-passwords missing — delete ~/.ai-stack-installed and re-run"

source ~/open-design/.env 2>/dev/null || true
if [[ -z "${OD_API_TOKEN:-}" ]]; then
  OD_API_TOKEN=$(openssl rand -hex 32)
  echo "OD_API_TOKEN=${OD_API_TOKEN}" > ~/open-design/.env
fi

header "LAUNCHING AI STACK"

# Kill existing cleanly
info "Stopping any existing services..."
tmux kill-session -t ai-stack 2>/dev/null || true
agent-browser close 2>/dev/null || true
pkill -f "opencode serve" 2>/dev/null || true
pkill -f "openchamber serve" 2>/dev/null || true
pkill -f "tools-dev run web" 2>/dev/null || true

# VPS: restart Nginx
if [[ "${ENV_TYPE:-}" == "vps" ]]; then
  sudo systemctl restart nginx 2>/dev/null || true
fi

info "Waiting for ports to clear..."
for port in "$PORT_OPENCODE" "$PORT_OPENCHAMBER" "$PORT_OPENDESIGN" "$PORT_OPENDESIGN_OC" "$PORT_BROWSER_STREAM" "$PORT_BROWSER_DASH"; do
  for i in {1..10}; do
    if ! ss -tln | grep -q -E ":$port( |$)"; then
      break
    fi
    sleep 1
  done
done

# Start tmux session
tmux new-session -d -s ai-stack -n 'opencode'

# ── Window 0: Main OpenCode server (stack data dir) ──────────
# This server shares its DB with OpenChamber. Sessions created
# here (via openchamber) stay in STACK_DATA_DIR.
tmux send-keys -t ai-stack:0 \
  "mkdir -p ${STACK_DATA_DIR} && XDG_DATA_HOME=${STACK_DATA_DIR} OPENCODE_SERVER_PASSWORD=${MASTER_PASS} opencode serve --port ${PORT_OPENCODE}" Enter

# Wait for OpenCode server to initialize completely
info "Waiting for OpenCode to start..."
sleep 8

# ── Window 1: OpenChamber (connects to stack opencode) ──────
tmux new-window -t ai-stack:1 -n 'openchamber'
tmux send-keys -t ai-stack:1 \
  "OPENCODE_HOST=http://localhost:${PORT_OPENCODE} openchamber serve --port ${PORT_OPENCHAMBER} --host 0.0.0.0 --ui-password ${MASTER_PASS} --foreground" Enter

# ── Window 2: Open Design web app ────────────────────────────
tmux new-window -t ai-stack:2 -n 'opendesign'
tmux send-keys -t ai-stack:2 \
  "cd ~/open-design && OD_API_TOKEN=${OD_API_TOKEN} pnpm tools-dev run web -- --port ${PORT_OPENDESIGN} --host 0.0.0.0" Enter

# ── Window 3: Open Design opencode server (ISOLATED data dir)
# This separate opencode server uses OPENDESIGN_DATA_DIR so
# any opencode sessions created in the open-design context
# NEVER appear in OpenChamber.
tmux new-window -t ai-stack:3 -n 'opencode-od'
tmux send-keys -t ai-stack:3 \
  "mkdir -p ${OPENDESIGN_DATA_DIR} && XDG_DATA_HOME=${OPENDESIGN_DATA_DIR} opencode serve --port ${PORT_OPENDESIGN_OC}" Enter

# ── Window 4: Agent-Browser ──────────────────────────────────
# Codespaces = headless only, VPS = headless by default
tmux new-window -t ai-stack:4 -n 'browser'
tmux send-keys -t ai-stack:4 \
  "agent-browser close 2>/dev/null || true && sleep 1 && AGENT_BROWSER_STREAM_PORT=${PORT_BROWSER_STREAM} AGENT_BROWSER_ARGS='--no-sandbox,--disable-setuid-sandbox,--headless=new' agent-browser open 'about:blank'" Enter

# ── Window 5: Agent-Browser Dashboard ───────────────────────
tmux new-window -t ai-stack:5 -n 'browser-dash'
tmux send-keys -t ai-stack:5 \
  "sleep 5 && agent-browser dashboard start --port ${PORT_BROWSER_DASH}" Enter

# ── Print access links ────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}${BOLD}  AI STACK IS LIVE                            ${NC}"
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════${NC}"
echo ""

if [[ "${ENV_TYPE:-}" == "vps" && -n "${DOMAIN_NAME:-}" ]]; then
  echo -e "  ${BOLD}OpenChamber${NC}    → https://${DOMAIN_NAME}/chamber"
  echo -e "  ${BOLD}Open Design${NC}    → https://${DOMAIN_NAME}/design"
  echo -e "  ${BOLD}Agent-Browser${NC}  → https://${DOMAIN_NAME}/agent"
  echo -e "  ${BOLD}Stream${NC}         → wss://${DOMAIN_NAME}/stream"
  echo ""
  echo -e "  ${YELLOW}Save these links — they never change${NC}"
else
  echo -e "  ${BOLD}OpenChamber${NC}    → http://localhost:${PORT_OPENCHAMBER}"
  echo -e "  ${BOLD}Open Design${NC}    → http://localhost:${PORT_OPENDESIGN}"
  echo -e "  ${BOLD}Agent-Browser${NC}  → http://localhost:${PORT_BROWSER_DASH}"
  echo -e "  ${BOLD}Stream${NC}         → ws://localhost:${PORT_BROWSER_STREAM}"
fi

echo ""
echo -e "  ${BOLD}Password:${NC}      ${MASTER_PASS}"
echo ""
echo -e "  ${BOLD}Session isolation:${NC}"
echo -e "  - Main stack (code+chamber) → ${STACK_DATA_DIR}/opencode/opencode.db"
echo -e "  - Open Design context       → ${OPENDESIGN_DATA_DIR}/opencode/opencode.db"
echo ""
  echo -e "  ${YELLOW}To use opencode CLI in open-design (isolated):${NC}"
  echo -e "  XDG_DATA_HOME=${OPENDESIGN_DATA_DIR} opencode ~/open-design"

if [[ "${DOMAIN_IS_DUCKDNS:-}" == "true" ]]; then
  echo -e "  ${YELLOW}DuckDNS auto-update cron set (every 5 min)${NC}"
fi
echo ""
echo -e "  ${BOLD}Attach tmux:${NC}   tmux attach -t ai-stack"
echo -e "  ${BOLD}Windows:${NC}       Ctrl+B then 0=opencode 1=openchamber"
echo -e "                         2=opendesign 3=opencode-od 4=browser 5=browser-dash"
echo ""
