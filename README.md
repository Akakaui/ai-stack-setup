# AI Stack Setup

One-click install script for a complete AI development stack: **OpenCode + OpenChamber + Open Design + Agent-Browser**.

Works on GitHub Codespaces and Ubuntu VPS (22.04 / 24.04).

---

## What's Included

| Service | Purpose | Default Port |
|---------|---------|-------------|
| **OpenCode** | AI coding assistant server | 4095 |
| **OpenChamber** | Web UI for OpenCode | 3000 |
| **Open Design** | Local-first design product (Next.js 16) | 7456 |
| **OpenCode (isolated)** | Separate session DB for Open Design context | 7457 |
| **Agent-Browser** | Browser automation daemon | 9223 |
| **Agent-Browser Dashboard** | Live browser view + controls | 4848 |
| **Nginx + SSL** | Reverse proxy + Let's Encrypt (VPS only) | 80/443 |

---

## Quick Start

### DuckDNS (free, e.g. `myproject.duckdns.org`)

```bash
bash ai-stack-setup.sh --domain myproject --token abc123def456
```
Get a free token at [duckdns.org](https://duckdns.org). The script registers the domain, sets up auto-renewal (cron every 5 min), Nginx, and Let's Encrypt SSL.

### Custom domain (e.g. `mystack.com`)

```bash
bash ai-stack-setup.sh --domain mystack.com
```
No `--token` needed. Point your domain's DNS A record to the VPS IP first. The script configures Nginx and Let's Encrypt SSL automatically.

### No domain (local-only / LAN)

```bash
bash ai-stack-setup.sh --skip-duckdns
```
No public domain needed. Access your stack via:
- `http://localhost:3000` — OpenChamber (from the VPS itself)
- `http://<VPS_IP>:3000` — OpenChamber (from any device on the network)

All services run locally. No DNS, no Nginx, no SSL.

### Codespace

```bash
bash ai-stack-setup.sh --skip-duckdns
```
Auto-detects Codespace environment. No systemd, no Nginx, no SSL. Just the services on their ports.

### Interactive setup

```bash
bash ai-stack-setup.sh
```
Walks you through domain selection with prompts.

### Restart existing stack (after reboot)

```bash
bash ai-stack-setup.sh
```
Detects `.ai-stack-installed` flag and skips straight to launch.

---

## Usage Reference

### CLI Flags

| Flag | Description |
|------|-------------|
| `--domain <name>` | DuckDNS subdomain OR custom domain |
| `--token <token>` | DuckDNS API token (omit for custom domains) |
| `--skip-duckdns` | No domain at all (local-only) |
| `--non-interactive` | Auto-generate master password |
| `--help` | Show help |

### Examples

```bash
# DuckDNS (free domain)
bash ai-stack-setup.sh --domain myproject --token abc123

# Custom domain (point DNS A record first)
bash ai-stack-setup.sh --domain mystack.com

# No domain, local-only
bash ai-stack-setup.sh --skip-duckdns

# Interactive
bash ai-stack-setup.sh

# Just restart (install already done)
bash ai-stack-setup.sh
```

---

## Architecture

### Session Isolation

The stack runs **two OpenCode servers** for session isolation:

```
┌─────────────────────────────────────────────────────────┐
│                   ai-stack (tmux)                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ opencode     │  │ openchamber  │  │ opencode (OD)  │ │
│  │ port 4095    │  │ port 3000    │  │ port 7457      │ │
│  │ DB: ai-stack │◄─┤ Web UI      │  │ DB: open-design│ │
│  └──────────────┘  └──────────────┘  └────────────────┘ │
│         │                                  │             │
│         ▼                                  ▼             │
│  ~/.local/share/ai-stack/          ~/open-design/.data/  │
│  opencode/opencode.db              opencode/opencode.db  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ open design  │  │ agent-       │  │ agent-browser  │ │
│  │ port 7456    │  │ browser      │  │ dashboard      │ │
│  │ (Next.js 16) │  │ port 9223    │  │ port 4848      │ │
│  └──────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Why two OpenCode servers?**
- The **main server** (port 4095) shares its database with OpenChamber. Sessions created via the web UI live here.
- The **isolated server** (port 7457) uses a separate SQLite database in `~/open-design/.data/`. Sessions created while working on Open Design content never appear in OpenChamber.
- No cross-contamination between "coding" context and "design" context.

### Data Directories

| Path | Contents |
|------|----------|
| `~/.local/share/ai-stack/opencode/opencode.db` | Main stack sessions |
| `~/open-design/.data/opencode/opencode.db` | Open Design isolated sessions |
| `~/.stack-passwords` | Auto-generated config (master password, ports, DuckDNS) |
| `~/open-design/.env` | Open Design API token |

### tmux Layout

```
Window 0: opencode serve --port 4095         (main stack DB)
Window 1: openchamber serve --port 3000      (web UI)
Window 2: opendesign pnpm tools-dev run web   (design app)
Window 3: opencode-od serve --port 7457      (isolated OD DB)
Window 4: agent-browser open                  (browser daemon)
Window 5: agent-browser dashboard             (live view)
```

Attach: `tmux attach -t ai-stack`  
Navigate: `Ctrl+B` then window number (0-5)

### VPS Network Layout

```
Internet ──► DuckDNS ──► Nginx (443 SSL) ──► /chamber  → OpenChamber :3000
                                              /design   → Open Design :7456
                                              /agent    → Agent Dashboard :4848
                                              /stream   → Agent Stream :9223 (WS)
```

---

## Screenshots

### OpenChamber Session View
![OpenChamber Session](assets/openchamber-session.png)
*OpenChamber web UI showing the active session management interface.*

### Open Design Files View
![Open Design Files](assets/opendesign-files.png)
*Open Design workspace showing the files browser and design artifacts.*

---

## Debugging Guide

### Services aren't starting

Check tmux windows to see what failed:

```bash
tmux attach -t ai-stack
```
Navigate to each window (Ctrl+B + number) to see the logs.

### Port conflicts

If a service fails to start, check what's using the port:

```bash
sudo ss -tlnp | grep -E '4095|3000|7456|7457|9223|4848'
```

Common conflicts:
- Port 3000: another web app
- Port 4095: another opencode instance

### Open Design won't start

```bash
# Check the Open Design directory
ls -la ~/open-design/
cat ~/open-design/.env

# Rebuild node_modules
cd ~/open-design && pnpm install

# Start manually to see errors
cd ~/open-design && OD_API_TOKEN=$(cat .env | grep OD_API_TOKEN | cut -d= -f2) pnpm tools-dev run web
```

### OpenCode won't start

```bash
# Check if binary exists
which opencode

# Check the config
cat ~/.config/opencode/opencode.json

# Check the database
ls -la ~/.local/share/ai-stack/opencode/opencode.db

# Run manually
XDG_DATA_HOME=~/.local/share/ai-stack opencode serve --port 4095
```

### OpenChamber won't start

```bash
# Check if installed
which openchamber

# Run manually with verbose output
OPENCODE_HOST=http://localhost:4095 openchamber serve --port 3000 --host 0.0.0.0 --foreground
```

### Agent-Browser issues

```bash
# Check Chrome installation
agent-browser install --with-deps

# Close any stale instance
agent-browser close

# Start manually
AGENT_BROWSER_STREAM_PORT=9223 agent-browser open 'about:blank'
```

### DuckDNS not resolving

```bash
# Manually update
curl -s "https://www.duckdns.org/update?domains=YOUR_DOMAIN&token=YOUR_TOKEN&ip="

# Check cron
crontab -l | grep duckdns
```

### SSL certificate issues

```bash
# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Database corruption

If sessions are missing or queries fail:

```bash
# Check database integrity
sqlite3 ~/.local/share/ai-stack/opencode/opencode.db "PRAGMA integrity_check;"

# Check isolated DB
sqlite3 ~/open-design/.data/opencode/opencode.db "PRAGMA integrity_check;"

# List all sessions
sqlite3 -header ~/.local/share/ai-stack/opencode/opencode.db "SELECT id, title, time_created, time_archived FROM session;"
```

### Reset everything

```bash
# Stop all services
tmux kill-session -t ai-stack 2>/dev/null
pkill -f "opencode serve" 2>/dev/null
pkill -f "openchamber serve" 2>/dev/null
pkill -f "tools-dev run web" 2>/dev/null

# Delete install flag to force reinstall
rm -f ~/.ai-stack-installed

# Delete config to start fresh
rm -f ~/.stack-passwords

# Re-run
bash ai-stack-setup.sh
```

---

## Port Reference

| Port | Service | Config Variable | VPS Nginx Path |
|------|---------|----------------|----------------|
| 4095 | OpenCode (main) | `PORT_OPENCODE` | internal |
| 3000 | OpenChamber | `PORT_OPENCHAMBER` | `/chamber`, `/` |
| 7456 | Open Design web | `PORT_OPENDESIGN` | `/design` |
| 7457 | OpenCode (OD isolated) | `PORT_OPENDESIGN_OC` | internal |
| 9223 | Agent-Browser stream | `PORT_BROWSER_STREAM` | `/stream` (WS) |
| 4848 | Agent-Browser dashboard | `PORT_BROWSER_DASH` | `/agent` |

---

## Files

| File | Purpose |
|------|---------|
| `ai-stack-setup.sh` | One-click install + launch script |
| `session-export-2026-06-05.md` | First session export |
| `session-export-2026-06-05-v2.md` | Updated session export with OD isolated DB |
| `fullstack-production-skill.md` | Production deployment checklist skill |
| `browsermate-prd.md` | BrowserMate product requirements |
| `assets/` | Screenshots |

---

## License

MIT
