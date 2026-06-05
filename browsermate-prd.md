# BrowserMate — Product Requirements Document

## 1. Executive Summary

BrowserMate is a single cross-platform binary that gives your AI a browser.

It bundles **a real browser, an internal LLM-powered agent engine, an MCP server, and a live view stream** into one package. BrowserMate has its own brain — you can use it standalone (just give it a goal) or pair it with Cursor/opencode/Claude Code for async collaboration.

**Standalone mode**: Tell BrowserMate what to do via CLI or web UI. It plans, browses, and reports back. No coding assistant needed.

**Paired mode**: Your coding assistant and BrowserMate's browser agent run as independent peers. You chat with Cursor about code; BrowserMate's agent browses the web. They exchange results without blocking each other.

BrowserMate runs **asynchronously**. Fire off a task and keep coding. The agent works in the background, drives the browser independently, and reports back when done — no interruption to your flow.

> *"Your AI finally has a browser."*

## 2. Why This Is Different From Any Other Browser

Every browser today is designed for one thing: a human looking at a screen and clicking.

| Browser | Who drives | AI controllable | Live stream | Human handoff | Async agent | Test export | MCP native |
|---------|-----------|----------------|-------------|---------------|-------------|-------------|------------|
| Chrome / Firefox / Safari | Human only | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Playwright / Puppeteer | Scripts | ❌ (no AI) | ❌ | ❌ | ❌ | ❌ | ❌ |
| agent-browser | AI CLI | ✅ CLI only | ❌ | ❌ | ❌ | ❌ | ❌ |
| BrowserStack / LambdaTest | Human remote | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Browserbase / Stagehand | AI SDK | ✅ SaaS | ✅ SaaS | ❌ | ❌ | ❌ | ❌ |
| **BrowserMate** | **AI + Human** | **✅ MCP** | **✅ self-hosted** | **✅ handoff_human** | **✅ background** | **✅ built-in** | **✅** |

**BrowserMate is the first browser with its own built-in AI brain.** Use it standalone or connect any MCP-compatible assistant. The browser agent and your coding assistant work as independent peers — they talk to each other, not through each other.

## 3. Problem Statement

Every AI assistant today hits the same wall: it cannot use a browser. It can generate text, write code, answer questions — but the moment a task requires actually opening a website, logging in, reading live content, or interacting with a UI, it stops.

The workarounds are painful:
- Copy-pasting content manually into chat
- Stitching together Playwright + agent-browser + BrowserStack + a cloud viewer
- AI silently failing when it hits a CAPTCHA, 2FA, or login wall
- The AI blocks your coding session while it works in the browser
- No way to watch what the AI is doing in the browser in real time
- No clean handoff when the AI gets stuck

BrowserMate eliminates all of this. One install. Agent runs in the background, you keep coding, it reports back when done.

## 4. What BrowserMate Can Do

The use cases are unlimited. Any task you would do in a browser, BrowserMate can handle. A few examples:

### Research & Writing
- Give it a topic — it searches Google, opens sources, reads pages, collects quotes and links, builds a bibliography, and drafts your paper or report
- Tracks every source it visited so you can verify

### SEO & Content
- Keyword research across Google Suggest, Reddit, competitor blogs, and free tools
- Finds content gaps, clusters keywords, drafts optimized outlines
- Analyzes competitor pages and reports what's working

### Profile & Listing Optimization
- Visits Fiverr, Upwork, LinkedIn, or any platform
- You log in (or it pauses for you at the login screen)
- Fills your profile fields, uploads portfolio pieces, optimizes your bio
- Calls your attention only when it hits something it can't handle

### Web Scraping & Monitoring
- Collects product prices, job listings, news articles, social posts
- Monitors pages for changes and reports back
- Handles pagination, infinite scroll, dynamic content

### Form Filling & Account Tasks
- Signs up for services, fills applications, submits forms
- Saves you from repetitive copy-paste work
- Pauses and calls you in for CAPTCHAs, 2FA, or ambiguous decisions

### Developer & QA
- Tests web apps end-to-end: sign up, login, checkout flows
- Records interactions and exports Playwright / Cypress / Selenium test scripts
- Runs generated tests and reports results
- Responsive testing across viewport sizes

This list is not exhaustive. If it happens in a browser, BrowserMate can do it.

## 5. Target Users

| User | Their need |
|------|-----------|
| **Student / researcher** | AI finds sources, reads papers, builds bibliography, drafts sections |
| **Blogger / SEO marketer** | AI does keyword research, analyzes competitors, drafts optimized content |
| **Freelancer / solopreneur** | AI optimizes profiles, applies to jobs/gigs, fills repetitive forms |
| **Developer** | AI tests web apps, generates test scripts, debugs UI issues |
| **Business owner** | AI monitors competitors, scrapes leads, automates repetitive web tasks |
| **Power user** | AI handles any browser task they don't want to do manually |

## 6. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  BrowserMate (single binary)                │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Chromium    │  │ MCP Server   │  │ Live Stream       │  │
│  │ (embedded   │  │ (port 8444)  │  │ Web UI (port 8443)│  │
│  │ or system)  │  │              │  │                   │  │
│  │  ┌───────┐  │  │ Tools:       │  │ - MJPEG viewport  │  │
│  │  │ CDP   │  │  │ - navigate   │  │ - Direct interact │  │
│  │  │ driver│  │  │ - snapshot   │  │   (CAPTCHA, etc.) │  │
│  │  └───────┘  │  │ - click      │  │  Red dot on tab   │  │
│  │             │  │ - fill       │  │  = agent active    │  │
│  │  ┌───────┐  │  │ - wait       │  │                   │  │
│  │  │Record-│  │  │ - eval       │  │  NO status bar    │  │
│  │  │er     │  │  │ - handoff_   │  │  NO prompts       │  │
│  │  └───────┘  │  │   human      │  │  NO overlays      │  │
│  └─────────────┘  │ - record     │  │  Clean browser    │  │
│                   │ - export_    │  └───────────────────┘  │
│                   │   test       │                          │
│                   └──────────────┘                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Skill Files — teach any AI assistant what it can do │   │
│  │  and how to use BrowserMate tools for any use case   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           │                          ▲
           │ MCP protocol             │ WebSocket / HTTPS
           ▼                          │
┌──────────────────────────────────┐ ┌────────────────────────┐
│  AI Assistant Chat               │ │  Live Browser View     │
│  (opencode, Cursor, Claude Code, │ │  (passive viewer)      │
│   Gemini CLI, etc.)              │ │                        │
│                                  │ │  - Clean viewport only │
│  ┌────────────────────────┐      │ │  - Red dot on agent's  │
│  │ 🤖 Working 4/12       │      │ │    active tab          │
│  │ Collecting sources...  │      │ │  - Click in view to    │
│  │ [⏸] [⏹] [✋]          │      │ │    interact (CAPTCHA,  │
│  └────────────────────────┘      │ │    2FA, login)         │
│                                  │ │  - Warns if you try to │
│  Agent runs in background ┄┄┄┄┄┄│ │    touch agent's tab   │
│  You code freely, agent          │ │                        │
│  reports back when done          │ │                        │
│                                  │ │                        │
│  - Tool approvals surface here   │ │                        │
│  - handoff_human appears here    │ │                        │
│  - Resume / Deny / Approve       │ │                        │
└──────────────────────────────────┘ └────────────────────────┘
```

### 6.1 Components

| Component | Role |
|-----------|------|
| **Chromium** | The actual browser. Embedded (downloads on first run) or uses system Chrome. Controlled via CDP. |
| **CDP Driver** | Raw WebSocket interface to Chrome: navigate, click, fill, snapshot accessibility tree, eval JS, wait, screenshot. No high-level chromedp API — raw CDP for full control. |
| **Recorder** | Logs every action with timestamps, selectors, screenshots. Stores in session file. |
| **Test Exporter** | Converts recordings into Playwright, Cypress, or Selenium test scripts. |
| **MCP Server** | Exposes all tools to any MCP-compatible assistant. BrowserMate has NO internal agent loop — the external LLM is the reasoning brain. |
| **Live Stream UI** | MJPEG stream of browser viewport. No status bar, no permission prompts — just a clean browser view. Direct interaction for CAPTCHAs and 2FA. |
| **Skill Files** | Per-use-case markdown files that teach the AI assistant exactly how to use BrowserMate for a given task. |

### 6.2 Key Design Decision: No Internal Agent

BrowserMate is a **pure MCP tool server**. It does not have its own LLM, decision loop, or agent logic. The external AI assistant (Claude, opencode, Cursor, Gemini) is the brain. BrowserMate just executes:

- Assistant says: "navigate to X"
- BrowserMate does it, returns the snapshot
- Assistant says: "click @e3"
- BrowserMate clicks it, returns new snapshot
- Assistant says: "handoff_human — CAPTCHA detected"
- BrowserMate pauses the action queue, notifies assistant

This keeps BrowserMate simple (~500 lines for CDP driver), fast (no LLM overhead), and assistant-agnostic.

## 7. Permission Model

BrowserMate delegates all permissions to the MCP host natively. There is no custom mode system, no permission queue, no confirmation modes built into BrowserMate.

When the AI calls any BrowserMate tool, the MCP client (Claude.ai, opencode, Cursor, Cline) surfaces the tool call with approve / deny / always-allow controls — exactly like any other MCP connector. The human configures this once per tool in their MCP client settings.

| Tool | Suggested default | Why |
|------|------------------|-----|
| `browse_navigate` | Always allow | Safe read operation |
| `browse_snapshot` | Always allow | Read-only |
| `browse_screenshot` | Always allow | Read-only |
| `browse_click` | Always allow | Low risk |
| `browse_fill` | Always allow | Low risk |
| `browse_eval` | Ask | Executes arbitrary JS |
| `handoff_human` | Ask | AI is stuck, needs human attention |
| `test_export` | Always allow | File generation |
| `session_close` | Ask | Destructive |

The only BrowserMate-level interruption is `handoff_human` — called when the AI hits something it genuinely cannot handle (CAPTCHA, 2FA, unexpected popup, ambiguous decision). Everything else flows through the MCP host's native tool approval UI.

## 8. MCP Tools (the API surface)

### 8.1 Browser Control

| Tool | Parameters | Description |
|------|-----------|-------------|
| `browse_navigate` | `url: string` | Navigate to a URL |
| `browse_snapshot` | `format?: "compact" \| "full"` | Get accessibility tree snapshot |
| `browse_click` | `ref?: string, selector?: string, text?: string` | Click element by ref, CSS selector, or text match |
| `browse_fill` | `ref/selector: string, value: string` | Clear and type into input |
| `browse_type` | `ref/selector: string, value: string` | Type without clearing |
| `browse_select` | `ref/selector: string, values: string[]` | Select dropdown options |
| `browse_hover` | `ref/selector: string` | Hover over element |
| `browse_scroll` | `direction: "up" \| "down", amount: number` | Scroll the page |
| `browse_press_key` | `key: string` | Press a keyboard key |
| `browse_wait` | `type: "element" \| "text" \| "url" \| "network" \| "ms", value?: string` | Wait for condition |
| `browse_eval` | `code: string` | Execute JavaScript in page context |
| `browse_screenshot` | `full_page?: boolean` | Take screenshot, returns image data |
| `browse_get_text` | `ref/selector: string` | Get visible text content |
| `browse_get_url` | — | Get current page URL |
| `browse_get_title` | — | Get page title |

### 8.2 Handoff

| Tool | Parameters | Description |
|------|-----------|-------------|
| `handoff_human` | `reason: string, instructions?: string` | AI requests human intervention. Pauses until human signals done. Use for: CAPTCHA, 2FA, login walls, ambiguous decisions, unexpected popups. |
| `handoff_resume` | — | Human signals issue is resolved. AI re-snapshots and continues. |

### 8.3 Recording & Testing

| Tool | Parameters | Description |
|------|-----------|-------------|
| `test_start_recording` | `name: string` | Begin recording all browser actions |
| `test_stop_recording` | — | Stop recording, return session log |
| `test_export` | `format: "playwright" \| "cypress" \| "selenium"` | Export recorded session as test script |
| `test_run` | `file: string, framework: string` | Execute a test file, return results |
| `test_suggest` | `url: string` | AI analyzes page and suggests test scenarios |
| `test_resize_viewport` | `width: number, height: number` | Resize for responsive testing |
| `test_assert_visible` | `selector: string` | Assert element is visible |
| `test_assert_text` | `selector: string, text: string` | Assert element contains text |
| `test_assert_url` | `pattern: string` | Assert current URL matches pattern |

### 8.4 Session

| Tool | Parameters | Description |
|------|-----------|-------------|
| `session_status` | — | Current state: URL, active tab, tabs list, recording status |
| `session_tabs` | — | List all open tabs with IDs. Returns which tab the AI is active on (for red dot display). |
| `session_switch_tab` | `tab_id: string` | Switch to a different tab |
| `session_new_tab` | `url?: string` | Open a new tab |
| `session_close` | — | Close the browser session |

## 9. Human Interface

BrowserMate is designed for **async human-AI collaboration**. You give the agent a task, it works independently in the browser, and you keep doing your own work in your coding session. No popups, no context switches, no interruptions.

### 9.1 Async Agent Model

```
┌─────────────────────────────────────────────────────────────┐
│  Your Coding Session (opencode, Cursor, Claude Code)        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ You: implement the payment flow                     │    │
│  │ You: [writing code...]                               │    │
│  │                                                      │    │
│  │ Agent (background): "Research done! Found 12         │    │
│  │ sources. Here's the bibliography and outline."       │    │
│  │ [View report] [Continue researching]                  │    │
│  │                                                      │    │
│  │ You: [reads report, continues coding]                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Status Bar (always visible in assistant UI)          │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ 🤖 Working  │  scholar.google.com               │ │    │
│  │ │ 📋 Collecting sources — 4 of 12 found      33%  │ │    │
│  │ │ [⏸ Pause]  [⏹ Stop]  [✋ Take Over]             │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

- Agent runs in the **background** — you write code, browse files, run commands
- When done, agent **reports back** in the chat without forcing focus
- If the agent needs input (handoff_human), a subtle badge/notification appears — deal with it when ready
- Your flow is never interrupted

### 9.2 Desktop

- BrowserMate opens a **real Chromium window** — the browser is **clean**: no status bar, no prompts, no overlays
- A **red dot** on the browser tab shows which tab the agent is currently active on
- If you try to click/type in the agent's tab, a warning appears: *"Agent is busy on this tab — pause or stop first"*
- Open other tabs freely — the agent only touches its assigned tab
- The **status bar lives exclusively in your coding assistant** (opencode, Cursor, Claude Code)

### 9.3 VPS / Phone / Any Device

- BrowserMate serves a web UI at `https://your-vps:8443`
- Clean MJPEG stream of the browser viewport — just the browser, nothing else
- **Red dot** on the web UI shows which tab the agent is active on
- Click/interact directly in the live view for CAPTCHAs, 2FA, login walls
- Status bar, tool approvals, and handoff all surface in your coding assistant — not in the web UI
- The web UI is a **passive viewer with emergency interrupt** capability

### 9.4 Status Bar States

| State | Meaning |
|-------|---------|
| **Idle** | Waiting for instructions |
| **Working** | Agent is actively browsing (shows current action + progress) |
| **Stuck** | Agent called `handoff_human` — needs your input to continue |
| **Done** | Agent completed the task — report is ready |
| **Paused** | You hit pause — agent is suspended |
| **Human Control** | You are driving manually — agent observes only |

## 10. Skill Files

Skill files are markdown documents that teach an AI assistant how to use BrowserMate for a specific task. BrowserMate ships with a base skill file plus use-case-specific ones. Users can write their own.

### 10.1 Base Skill

```markdown
# BrowserMate — Browser Agent Skill

You have access to a real browser via BrowserMate's MCP tools.
Use it whenever a task requires visiting websites, reading live
content, filling forms, or interacting with any web UI.

## Core Rules
- Always snapshot before interacting — get fresh element refs
- After any navigation or page change, re-snapshot
- For CAPTCHAs, 2FA, login walls, or anything you cannot
  handle: call handoff_human with a clear reason and instructions
- Never guess at selectors — snapshot first, act second
- Report what you found, not just what you did

## Handoff
handoff_human({
  reason: "CAPTCHA detected on signup form",
  instructions: "Solve the image CAPTCHA, then click Verify"
})
After handoff_resume: re-snapshot, then continue.

## Testing Workflows
1. test_start_recording("login-flow")
2. Navigate and interact as you normally would
3. test_stop_recording()
4. test_export("playwright") → returns .spec.ts
5. test_run("login-flow.spec.ts", "playwright")
```

### 10.2 Example: Research Skill

```markdown
# BrowserMate — Research Skill

When asked to research a topic:
1. Search Google for the topic + relevant subtopics
2. Open the top 5-10 results
3. For each: snapshot, extract key claims, quotes, author, date, URL
4. Collect all sources in a structured list
5. Identify gaps — what's missing, what's contested
6. Draft an outline or full paper based on findings
7. Include a bibliography with every URL visited

Track every source. Never fabricate citations.
If a source requires login or paywall: handoff_human.
```

### 10.3 Example: Profile Optimization Skill

```markdown
# BrowserMate — Profile Optimization Skill

When asked to optimize a profile on any platform:
1. Navigate to the platform
2. If login is required: handoff_human immediately
   ("Please log in, then call handoff_resume")
3. After resume: snapshot the profile page
4. Identify all empty or weak fields
5. Fill each field with the provided content
6. Upload any files (portfolio, avatar) — handoff_human if
   the upload UI is unclear
7. Save/submit each section
8. Take a final screenshot of the completed profile
```

## 11. Installation & Usage

### 11.1 Install

```bash
curl -fsSL https://browsermate.sh | bash
```

First run: checks for system Chrome/Chromium/Edge. If none found, downloads Chromium to `~/.browsermate/chrome`. On Linux headless (VPS), auto-spawns Xvfb for virtual display.

### 11.2 Run

```bash
# Desktop — opens Chromium window
browsermate

# VPS — prints URL, accessible from any device
browsermate --host 0.0.0.0 --port 8443

# Custom Chrome path
browsermate --chrome /usr/bin/chromium

# MCP only, no stream
browsermate --headless

# With config
browsermate --config ~/.browsermate/config.json
```

### 11.3 Connect Your AI Assistant

#### opencode
```json
{
  "mcpServers": {
    "browsermate": {
      "command": "browsermate",
      "args": ["mcp"]
    }
  }
}
```

#### Claude Code
```bash
claude --mcp "browsermate mcp"
```

#### Cursor / Cline / Any MCP host
Point to `browsermate mcp` as the MCP server command.

### 11.4 Load a Skill

```bash
# opencode
opencode skill add browsermate

# Claude Code
cp browsermate.skill.md CLAUDE.md

# Or paste the skill content into your AI's system prompt
```

## 12. How It Works On Each Platform

| Platform | Browser | Live stream | Assistant integration |
|----------|---------|-------------|----------------------|
| **Linux desktop** | Real Chromium window (clean, no UI chrome) | Not needed — you see it | Status bar in assistant UI, agent runs async |
| **macOS** | Real Chromium window (clean, no UI chrome) | Not needed | Status bar in assistant UI, agent runs async |
| **Windows** | Real Chromium window (clean, no UI chrome) | Not needed | Status bar in assistant UI, agent runs async |
| **Linux VPS (headless)** | Virtual (Xvfb) | Web UI (clean viewport) | Status bar in assistant UI on any device |
| **Any device via VPS** | Virtual (Xvfb) | Web UI (clean viewport) | Status bar in assistant UI on separate device |

## 13. Features by Version

### v0.1 — MVP (Week 1-2)

- Launch Chromium (system or auto-downloaded)
- Raw CDP driver: navigate, snapshot, click, fill, wait, eval, screenshot
- MCP server with all core browse tools
- MJPEG live stream web UI (for VPS/phone access) — clean browser view only
- `handoff_human` / `handoff_resume` tools
- Async background execution — agent works independently while user codes
- Status bar in assistant UI (not in browser window)
- Base skill file
- Cross-platform binary: Linux, macOS, Windows
- Auto Xvfb on Linux headless
- Tab indicator (red dot on agent's active tab)
- Interrupt protection (warning when touching agent's tab)

### v0.2 — Recording & Tests (Week 3-4)

- Action recorder (timestamps + screenshots per step)
- Test exporter: Playwright, Cypress, Selenium
- `test_suggest`, `test_run`, `test_resize_viewport`
- Assertion tools (visible, text, URL)

### v0.3 — Power Features (Week 5-6)

- Multi-tab: AI and human on different tabs simultaneously
- Session replay (video + action log)
- Auth vault (save credentials, auto-fill)
- Screenshot diffing (visual regression)
- Native window wrapper (v0.1 opens web UI in browser; v0.3 ships native app shell)
- Additional skill files: research, SEO, profile optimization, scraping

### v0.4 — Production (Week 7+)

- Docker image (one-command VPS deploy)
- TLS auto-cert (Let's Encrypt or self-signed)
- Session persistence across restarts
- Browser profile support (load Chrome profile with existing cookies/extensions)
- Plugin system for custom skill files and test exporters

## 14. Technical Decisions

### 14.1 Language: Go

Single static binary, cross-compile for all platforms. Excellent stdlib for HTTP/WS. Easy asset embedding (embed.FS).

### 14.2 CDP: Raw WebSocket

Use `github.com/chromedp/cdproto` for protocol types only. Drive Chrome over raw WebSocket — required for `Page.startScreencast` (MJPEG stream). Core CDP loop is ~500 lines.

### 14.3 Chromium

Check for system Chrome/Chromium/Edge first. If none found, download on first run to `~/.browsermate/chrome`. Override with `--chrome` flag. On Linux with no display: auto-spawn Xvfb on `:99`.

### 14.4 Stream: MJPEG over WebSocket

Works on all browsers and devices, no codec needed. ~200ms latency. Capture frames via `Page.startScreencast`, stream over WS. Still-frame fallback for low bandwidth.

### 14.5 MCP Server: Built-in

Port 8444 default. stdio transport for local (assistant spawns `browsermate mcp`). SSE transport for remote connections.

### 14.6 No Internal Agent Loop

BrowserMate is a pure MCP tool server. The external LLM is the reasoning brain. BrowserMate executes: snapshot, click, fill, handoff, record, export. Simple, fast, assistant-agnostic.

## 15. Success Metrics

- Install to first working session: < 30 seconds
- MCP handshake to first snapshot: < 1 second
- Binary size: < 15 MB without Chromium, < 200 MB with
- Platforms: Linux x86_64/arm64, macOS x86_64/arm64, Windows x86_64
- Works on any VPS with a single command (auto Xvfb, auto download Chrome)

## 16. Comparison: BrowserMate vs Everything Else

| | Chrome | Playwright | agent-browser | BrowserStack | Browserbase | **BrowserMate** |
|---|---|---|---|---|---|---|---|
| **Human can drive** | ✅ | ❌ | ❌ | ✅ | ❌ | **✅** |
| **AI can drive** | ❌ | ❌ | ✅ | ❌ | ✅ | **✅** |
| **Both simultaneously** | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Async background** | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Live stream view** | ❌ | ❌ | ❌ | ✅ | ✅ | **✅** |
| **Human handoff** | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Test generation** | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| **MCP native** | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Self-hosted** | ✅ | ✅ | ✅ | ❌ | ❌ | **✅** |
| **One binary** | ❌ | ❌ | ✅ | ❌ | ❌ | **✅** |
| **CAPTCHA handling** | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ handoff** |
| **Interrupt protection** | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |

## 17. Open Questions

- Should the recorder store full DOM snapshots or just action logs?
  - Decision: **Action logs + screenshots on each step**. Full DOM is too heavy.
- Should test exports include assertions automatically or require manual annotation?
  - Decision: **Auto-assert for visible elements and URL changes**. Manual annotations for custom assertions.
- Native window on desktop via WebView or just open web UI in system browser?
  - Decision: **Open web UI in system browser for v0.1**. Native wrapper in v0.3.
