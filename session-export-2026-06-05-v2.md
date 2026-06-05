# Open Design Session Export — June 5, 2026
**Source:** Open Design isolated opencode session DB

---

## 1. Open Design Isolated DB — Active Session

**DB location:** `~/open-design/.data/opencode/opencode.db`

| Field | Value |
|-------|-------|
| **Title** | Separate open design chat from openchamber |
| **Slug** | kind-river |
| **Directory** | `/home/codespace` |
| **Agent** | build |
| **Model** | big-pickle |
| **Tokens input** | 90,653 |
| **Tokens output** | 10,625 |
| **Tokens reasoning** | 7,976 |
| **Cache reads** | 1,588,864 |
| **Created** | ~June 5, 2026 |
| **Messages** | (none stored) |

This session set up the session isolation between Open Design and the main stack (OpenChamber).

---

## 2. Main opencode DB — Archived Sessions from `/home/codespace/open-design`

**DB location:** `~/.local/share/opencode/opencode.db`

16 archived sessions found. Key ones:

| # | Title | Created (UTC) | Status |
|---|-------|--------------|--------|
| 1 | New session | 2026-06-05 02:10:04 | Archived |
| 2 | New session | 2026-06-05 02:09:37 | Archived |
| 3 | New session | 2026-06-05 02:09:26 | Archived |
| 4 | Quick brief — 30 seconds | 2026-06-05 02:08:58 | Archived |
| 5 | New session | 2026-06-05 02:08:29 | Archived |
| 6 | Instagram carousel (1080×1350 portrait) design | 2026-06-05 02:05:22 | Archived |
| 7 | Seamless Instagram carousel design | 2026-06-05 01:57:32 | Archived |
| 8 | Remotion question | 2026-06-05 01:55:59 | Archived |
| 9 | Capabilities and identity | 2026-06-05 01:53:41 | Archived |
| ... | (8 more brief sessions) | various | Archived |

---

## 3. Verdict: Were Sessions Moved to Open Design?

**No.** The 16 archived sessions remain in the main opencode DB (`~/.local/share/opencode/opencode.db`) as archived. They were never moved to the isolated Open Design DB.

The isolated DB only contains the 1 session that configured the isolation itself. The isolation (via `ai-stack-setup.sh`) was set up *after* those sessions were created.

---

## 4. Current Active Session (this export)

| Field | Value |
|-------|-------|
| **Title** | Export session from design db to open code |
| **Slug** | kind-lagoon |
| **Directory** | `/home/codespace/Akaka` |
| **Agent** | build |
| **Model** | big-pickle |
| **Created** | ~June 5, 2026 (current) |
