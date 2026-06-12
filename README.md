# AI Stack Setup

One-click install script for a complete AI development stack: **OpenCode + OpenChamber + Open Design + Agent-Browser**.

Works on GitHub Codespaces and Ubuntu VPS (22.04 / 24.04).

---

## How to Install

### Clone the repo

```bash
git clone https://github.com/Akakaui/ai-stack-setup.git
cd ai-stack-setup
bash ai-stack-setup.sh --skip-duckdns
```

### Or download just the script

```bash
curl -O https://raw.githubusercontent.com/Akakaui/ai-stack-setup/main/ai-stack-setup.sh
bash ai-stack-setup.sh --skip-duckdns
```

See [Quick Start](#quick-start) for all options (DuckDNS, custom domain, etc).

---

## What's Included

| Service | Purpose | Default Port |
|---------|---------|-------------|
| **OpenCode** | AI coding assistant server | 4095 |
| **OpenChamber** | Web UI for OpenCode | 3000 |
| **Open Design** | Local-first design product (Next.js 16) | 7456 |
| **Agent-Browser** | Browser automation daemon | 9223 |
| **Agent-Browser Dashboard** | Live browser view + controls | 4848 |
| **Nginx + SSL** | Reverse proxy + Let's Encrypt (VPS only) | 80/443 |
| **Skills** | 50+ agent skills (marketing, design, video, writing, etc.) | `~/.agents/skills/` |

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
Walks you through domain selection with prompts. **You will be asked to choose a master password** — this single password protects all services (OpenChamber, OpenCode). Minimum 8 characters, must be confirmed.


### Restart existing stack (after reboot)

```bash
bash ai-stack-setup.sh
```
Detects `.ai-stack-installed` flag and skips straight to launch.

---

## Usage Reference

### CLI Flags

| Flag | Description |
|------|--------------|
| `--domain <name>` | DuckDNS subdomain OR custom domain |
| `--token <token>` | DuckDNS API token (omit for custom domains) |
| `--email <email>` | Email address for SSL certificate notifications (Let's Encrypt) |
| `--skip-duckdns` | No domain at all (local-only) |
| `--non-interactive` | **Auto-generate** master password (skips password prompt — for CI/CD only) |
| `--password <password>` | **Set a specific** master password instead of prompting or auto-generating |
| `--help` | Show help |

### Examples

```bash
# DuckDNS with a custom password (fully non-interactive!)
bash ai-stack-setup.sh --domain favourakaka.duckdns.org --token abc123def456 --email you@example.com --password mysecretpass

# DuckDNS (free domain) — you will be prompted to enter and confirm your password
bash ai-stack-setup.sh --domain myproject --token abc123 --email you@example.com

# DuckDNS non-interactive (CI/CD only — auto-generates password, prints it once)
bash ai-stack-setup.sh --domain myproject --token abc123 --email you@example.com --non-interactive

# Custom domain (point DNS A record first) — password prompt required
bash ai-stack-setup.sh --domain mystack.com --email you@example.com

# No domain, local-only — password prompt required
bash ai-stack-setup.sh --skip-duckdns

# Interactive (prompts for domain, token, email, and password)
bash ai-stack-setup.sh

# Just restart (install already done — skips straight to launch)
bash ai-stack-setup.sh
```

> **Note:** By default you will always be asked to **choose your own master password** and confirm it, unless you specify `--password` to set one directly or `--non-interactive` to auto-generate one.


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
- **Next.js & Daemon Isolation:** The Open Design Next.js/daemon application runs with `XDG_DATA_HOME` and `OD_DATA_DIR` set to `~/open-design/.data/`. Any `opencode` CLI tasks spawned directly by the Open Design UI will run in this isolated context, preventing design sessions from leaking into OpenChamber or your main database.
- No cross-contamination between "coding" context and "design" context.

### Data Directories

| Path | Contents |
|------|----------|
| `~/.local/share/ai-stack/opencode/opencode.db` | Main stack sessions |
| `~/open-design/.data/opencode/opencode.db` | Open Design isolated sessions |
| `~/.stack-passwords` | Config storage (master password, ports, DuckDNS) |
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
| 9223 | Agent-Browser stream | `PORT_BROWSER_STREAM` | `/stream` (WS) |
| 4848 | Agent-Browser dashboard | `PORT_BROWSER_DASH` | `/agent` |

---

## Files

| File | Purpose |
|------|---------|
| `ai-stack-setup.sh` | One-click install + launch script |
| `README.md` | Documentation |
| `.gitignore` | Git ignore rules |
| `assets/` | Screenshots |

### 1. Unified PC Desktop App (Windows / macOS / Linux)

#### How to run/test locally from source:
1. Open your terminal and navigate to the `desktop` folder:
   ```bash
   cd desktop
   ```
2. Install the developer dependencies (Electron & build tools) and local packages:
   ```bash
   npm install
   ```
3. Start the application in development mode:
   ```bash
   npm start
   ```

#### How to package into a standalone installer (`.exe`):
To generate a double-clickable standalone Windows installer (`.exe`) compiled with the official OpenChamber logo icon and setup with options to create a desktop shortcut icon:
1. From the `desktop` directory, run the distribution script:
   ```bash
   npm run dist
   ```
2. Once the build completes, find your compiled installer under the `desktop/dist/` folder (e.g. `AI Stack Setup.exe`).
3. You can copy this `.exe` file or distribute it to users. When run, the installer:
   - Asks the user if they want to create a desktop shortcut icon.
   - Installs the app to their system.
   - Runs both OpenCode and OpenChamber in the background automatically.

#### How to run via npm/npx (after publishing):
Once you publish your package to the npm registry, users can run it instantly:
- **No install (npx):**
  ```bash
  npx -y your-package-name
  ```
- **Global install:**
  ```bash
  npm install -g your-package-name
  ai-stack
  ```

---

### 2. Unified VPS Web App (Docker Deploy)

The Docker packaging runs both services together in a single container. This is ideal for VPS deployments and accessing the stack on-the-go from your phone.

#### How to build & push your own Docker image:
1. Navigate to the `docker` directory of your repository.
2. Build the Docker image:
   ```bash
   docker build -t yourusername/ai-stack:latest .
   ```
3. Push the image to a container registry (Docker Hub, GitHub Container Registry, etc.):
   ```bash
   docker push yourusername/ai-stack:latest
   ```

#### How to deploy on a VPS (for you and your users):
To run the unified stack, create a `docker-compose.yml` on the VPS pointing to your image:

```yaml
version: '3.8'

services:
  ai-stack:
    image: yourusername/ai-stack:latest
    container_name: ai-stack
    restart: always
    ports:
      - "3000:3000"   # OpenChamber web UI (open in browser)
      - "4095:4095"   # OpenCode backend (internal use)
    environment:
      - STACK_DATA_DIR=/data
      # - MASTER_PASS=your_custom_password # Uncomment and set a password to lock it down
    volumes:
      - ai-stack-data:/data
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

  watchtower:
    image: containrrr/watchtower
    container_name: ai-stack-watchtower
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 3600 --cleanup --label-enable

volumes:
  ai-stack-data:
    driver: local
```

Deploy it using a single command:
```bash
docker compose up -d
```
Then open `http://<your-vps-ip>:3000` in any browser on your computer, tablet, or phone.

---

### How Updates Work & Upstream Safety

*   **PC Desktop (npx/npm):** The Electron app references `opencode-ai` and `@openchamber/web` as dependencies with the `"latest"` version constraint. Running `npx` pulls the newest packages from the registry automatically.
*   **VPS / Docker:** The `docker-compose.yml` includes **Watchtower**. When you build and push a new Docker image containing the latest OpenCode/OpenChamber versions, Watchtower detects it, pulls it, and restarts the stack seamlessly in the background.
*   **Upstream Safety:** The wrapper launcher calls standard startup commands like `opencode serve` and `openchamber serve` as separate processes. It does not interface with their internal code/API. Therefore, updates and new features added to OpenCode or OpenChamber are picked up automatically on startup without breaking the wrapper app.

---

## License

MIT

