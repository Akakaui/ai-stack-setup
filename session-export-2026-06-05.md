# BrowserMate & AI Stack — Session Export
**Date:** June 5, 2026
**Source:** opencode session with user `Akakaui`

---

## Table of Contents

1. [Files Reviewed](#1-files-reviewed)
2. [BrowserMate PRD — Key Design Decisions](#2-browsermate-prd--key-design-decisions)
3. [Machine Inventory](#3-machine-inventory)
4. [Running Stack Overview](#4-running-stack-overview)
5. [Content Pipeline Plan](#5-content-pipeline-plan)
6. [Media Generation MCP Research](#6-media-generation-mcp-research)
7. [VPS Recommendation](#7-vps-recommendation)
8. [BrowserMate Ship Plan](#8-browsermate-ship-plan)
9. [Machine Export Guide](#9-machine-export-guide)
10. [Open Questions](#10-open-questions)

---

## 1. Files Reviewed

### `/tmp/PRD.md` (380 lines)
First version of BrowserMate PRD. Included internal agent engine, permission queue, control modes (auto/confirm/guide/manual), session management tools, Go language.

### `/tmp/browsermate-prd.md` (517 lines)
Revised version — simplified to pure MCP tool server with no internal agent loop, delegated permissions to MCP host, cleaner human interface with status bar in assistant chat.

### `/home/codespace/Akaka/browsermate-prd.md`
Current version moved to Akaka folder. Contains PRD with async agent model, DuckDNS live view, asset fetching, PWA mobile support, standalone mode with AI CLI auto-detection.

---

## 2. BrowserMate PRD — Key Design Decisions

### Status Bar Location
- **Decision:** Status bar lives in the coding assistant UI (opencode, Cursor, Claude Code) — NOT in the browser window
- Browser window stays **clean** — no overlays, no prompts, no status bar
- Red dot on browser tab = agent is active on that tab
- Interrupt protection: warning if user tries to interact with agent's tab while busy

### Async Background Execution
- Agent runs independently in the background
- User continues coding in the same chat session — no blocking
- Agent reports back when done without forcing focus
- handoff_human pauses and notifies subtly — user handles when ready

### No internal agent loop
- BrowserMate is a pure MCP tool server
- External LLM (assistant's) is the reasoning brain
- Status updates pushed via MCP notifications (non-blocking)

### Desktop-first launch
- Desktop app + VPS web app with MCP
- Native Electron app or PWA on desktop
- Web UI for VPS/phone access
- Mobile app deferred to later launch

---

## 3. Machine Inventory

**Platform:** GitHub Codespace (Ubuntu 24.04.4 LTS)
**User:** codespace (UID 1000)
**Hostname:** codespaces-8f9ebd
**Repo:** Akakaui/test-script-

### Running Services

| Service | Port | Status |
|---------|------|--------|
| opencode (main) | 45775 | Running |
| opencode (terminal) | 4095 | Running |
| OpenChamber | 3000 | Running (public) |
| agent-browser | 9223 (stream), 4848 (dashboard) | Running |
| Chrome headless | 41755 | Running |
| Open Design (web sidecar) | 41999 | Running |
| Open Design (daemon sidecar) | 34199 | Running |

### Tmux Session: `ai-stack`
| Window | Content |
|--------|---------|
| 0 | opencode (port 4095) |
| 1 | openchamber (port 3000) |
| 2 | opendesign tools-dev |
| 3 | agent-browser daemon |
| 4 | agent-browser dashboard |

### Key Credentials
| Item | Value |
|------|-------|
| Master password | `200516` |
| OpenCode server password | `krNRi_bAytj24p8LSegqX6YskW1dvgI049mHei1KwFA` |
| Open Design API token | `7afc36878e96b79b95c517dfb6551428467271001b2dfea8121ac64d4f4400c6` |
| Port assignments | OPENCODE=4095, OPENCHAMBER=3000, OPENDESIGN=7456, BROWSER_STREAM=9223 |

---

## 4. Running Stack Overview

### opencode
- Binary: `~/.opencode/bin/opencode` (v1.15.13, 145MB)
- Config: `~/.config/opencode/opencode.json` — all permissions allowed
- Plugin: `@opencode-ai/plugin` v1.15.13

### OpenChamber (v1.12.1)
- GUI/web interface for opencode
- Running on port 3000 with password `200516`
- Config: `~/.config/openchamber/`
- Includes JWT secret, UI passkeys, settings

### Open Design (v0.9.0)
- Local-first design product monorepo
- Next.js 16, pnpm workspace
- Running in dev mode (`pnpm tools-dev`)
- Not an AI chat — no sessions bleed into opencode

### agent-browser (v0.27.1)
- Rust-based browser automation CLI
- Chrome 149.0.7827.54 headless
- Skills: `~/.agents/skills/agent-browser/SKILL.md`

---

## 5. Content Pipeline Plan

### Folder Structure (proposed)
```
/home/codespace/business/
  content/
    blog/
    videos/
    carousels/
    social/
  assets/
    logos/
    fonts/
    templates/
  scripts/
    generate-reel.mjs
    generate-carousel.mjs
    generate-blog.mjs
  config/
    brand.json      # colors, fonts, voice
    platforms.json  # Instagram, YouTube, TikTok
```

### Design approach for carousels/slides
Use HTML/CSS to design each slide as a styled web page with:
- Brand fonts (Google Fonts CDN)
- Brand colors
- Real brand logos (downloaded via browser from official sites)
- Icons from Feather/Lucide/Heroicons (free, open source)
- Screenshot via `browse_screenshot` → each slide is a PNG
- No AI "design" — just clean, hand-coded HTML/CSS

### Motivational YouTube video pipeline
1. AI writes script
2. AI picks icon/visual for each scene
3. Generate background images via Flux (Replicate, ~$0.01/gen) or Unsplash/Pexels
4. Download real assets via browser (logos, etc.)
5. Compose HTML slides with brand fonts + colors + icons + backgrounds
6. Browser screenshots each slide as PNG
7. Remotion sequences slides + transitions
8. Add TTS voiceover (ElevenLabs or free Kokoro)
9. Add background music (Mubert or free stock)
10. Render to MP4

---

## 6. Media Generation MCP Research

### Remotion-related MCPs

| MCP | What it does | Cost |
|-----|-------------|------|
| `@remotion/mcp` | Official — indexes Remotion docs so AI can write correct code | Free |
| `remotion-video-mcp` (dev-arctik) | Scaffolds projects, manages scenes, renders | Free |
| `terminalgravity-video-mcp` | Remotion + ElevenLabs + Mubert music | Free (needs API keys) |
| `mcp-use/remotion-mcp-app` | Live video preview widget in chat | Free |

### Image Generation MCPs

| MCP | What it does | Cost |
|-----|-------------|------|
| `@gongrzhe/image-gen-server` | Replicate Flux models | Free server + ~$0.01/gen |
| Gemini image gen MCP | Free via Gemini Nano Banana | Free |
| Grok Image MCP | xAI image model | API costs apply |

### Video Generation MCPs

| MCP | What it does | Cost |
|-----|-------------|------|
| `mcp-video-gen` (kevinten-ai) | 7 video providers + TTS + music in one | CogVideoX is unlimited free |
| RunwayML + Luma AI MCP | Gen-3 video, upscaling, audio | Runway/Luma credits |

### Audio MCPs
- OpenAI TTS MCP — text-to-speech
- terminalgravity has ElevenLabs + Mubert built in
- mcp-video-gen has MiniMax TTS + music + Google Lyria

### Icon/Asset sources (free, no API)
- Feather Icons — `https://feathericons.com/`
- Lucide Icons — `https://lucide.dev/`
- Heroicons — `https://heroicons.com/`
- Unsplash — free stock photos
- Pexels — free stock video + photos

### Remotion itself
- **Not an MCP** — it's a video rendering engine you install
- `npm install remotion`
- Write React components for video frames
- Renders to MP4, WebM, GIF
- Free, open source, MIT license

---

## 7. VPS Recommendation

### For running opencode + OpenChamber + Telegram bot:

| Provider | Specs | Price | Verdict |
|----------|-------|-------|---------|
| **Hetzner** | 2 vCPU, 4GB RAM, 40GB NVMe | ~$4.50/mo | **Best value** |
| DigitalOcean | 2 vCPU, 4GB RAM, 80GB SSD | $6/mo | Best docs |
| IONOS | 2 vCPU, 4GB RAM, 80GB SSD | $2/mo | Cheapest |
| Contabo | 4 vCPU, 8GB RAM, 200GB SSD | ~$4/mo | Most RAM (oversold CPU) |

**Recommended: Hetzner CX22** — 2 vCPU, 4GB RAM, 40GB NVMe, ~$4.50/mo

### What runs on it:
- opencode server
- OpenChamber web UI
- Telegram bot (`@grinev/opencode-telegram-bot`)
- (Optional) BrowserMate once built
- DuckDNS for permanent URL

---

## 8. BrowserMate Ship Plan (VPS-first, no desktop app)

### v0.1 — MVP (6-7 days)

| Step | Task | Time |
|------|------|------|
| 1 | **Go binary** — CDP driver (~500 lines), raw WebSocket control of Chrome | 2 days |
| 2 | **MCP server** — Expose browse tools (navigate, snapshot, click, fill, eval, screenshot) | 1 day |
| 3 | **MJPEG live stream** — `Page.startScreencast` → WebSocket → web UI | 1 day |
| 4 | **handoff_human/resume** — Pause action queue, notify, wait for resume | 1 day |
| 5 | **Docker image** — Package Chromium + binary | 1 day |
| 6 | **Nginx + DuckDNS + TLS** — Route subdomain to live stream + MCP | 0.5 day |

### What it ships as:
- Single binary (`browsermate`) or Docker container
- Connects to opencode/OpenChamber as MCP server on same VPS
- Live stream accessible from phone via DuckDNS URL
- No desktop app — skip for now

### Future phases:
| Phase | Content |
|-------|---------|
| v0.2 | Recorder + test exporter |
| v0.3 | Multi-tab, session replay, auth vault |
| v0.4 | Plugin system, browser profiles |

---

## 9. Machine Export Guide

### Minimal backup (copy these files)
```bash
~/.env
~/.stack-passwords
~/.gitconfig
~/.gitignore_global
~/.npmrc
~/.aider.conf.yml
~/.config/opencode/
~/.config/openchamber/
~/.gemini/
~/.agents/.skill-lock.json
~/open-design/.env
```

### Reinstall commands on new machine
```bash
# opencode
curl -fsSL https://opencode.ai/install | bash

# Global packages
npm install -g @openchamber/web agent-browser @grinev/opencode-telegram-bot

# Start stack
tmux new-session -s ai-stack
# Window 0: opencode serve --port 4095
# Window 1: openchamber serve --port 3000 --ui-password 200516
# Window 2: cd open-design && pnpm tools-dev run web
# Window 3: agent-browser start
# Window 4: agent-browser dashboard
```

### OpenCode Telegram Bot (for remote access)
```bash
npx @grinev/opencode-telegram-bot@latest
# Then configure via wizard (bot token, user ID, API URL)
```

---

## 10. Open Questions

- [ ] Should BrowserMate use Go (static binary) or Node.js (faster to prototype)?
- [ ] For async agent execution: embed internal agent loop in BrowserMate, or rely on assistant sub-tasks?
- [ ] Which icon library to use as default for content pipeline? (Feather, Lucide, Heroicons)
- [ ] Should we write export script (bundle-all.sh) for machine migration?
- [ ] Remotion rendering — local CPU on VPS or use Remotion Lambda (cloud)?

---

## Appendix: Key URLs

| Resource | URL |
|----------|-----|
| opencode | https://opencode.ai |
| OpenChamber | https://github.com/openchamber/openchamber |
| OpenCode Telegram Bot | https://github.com/grinev/opencode-telegram-bot |
| Remotion | https://remotion.dev |
| Remotion MCP | `npx @remotion/mcp@latest` |
| agent-browser | https://github.com/vercel-labs/agent-browser |
| Replicate (Flux) | https://replicate.com |
| DuckDNS | https://duckdns.org |
