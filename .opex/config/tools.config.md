# TOOLS CONFIGURATION

Last updated: 2025-01-25
Version: 1

## AVAILABLE TOOLS

web_search
  When to use: Current information, research,
               competitor intel, trending topics,
               anything that could have changed recently
  How to invoke: Call web search with specific query

qdrant_query
  When to use: Retrieving stored knowledge, past
               performance data, method logs, goals history
  Collections: knowledge, performance, goals,
               hooks-pi, methods-log, skills-log
  How to invoke: Query specific collection with
                 semantic search term

qdrant_write
  When to use: Saving new knowledge, logging performance,
               recording method usage, updating goal status
  How to invoke: Write to specific collection with
                 full metadata including timestamp

file_read
  When to use: Loading a skill file, reading memory,
               checking agent instructions
  How to invoke: Read file by path

file_write
  When to use: Updating a skill file, writing to memory,
               logging a session, saving output
  How to invoke: Write to file by path, always include
                 version increment and timestamp

image_generation
  When to use: Blog headers, social visuals,
               article covers, poster art, video assets
  Router: OpenRouter
  Models available:
    Nano Banana 2 (gemini-3.1-flash-image) — drafts, fast, cheap
    Nano Banana Pro (gemini-3-pro-image) — finals, highest quality
  How to invoke: Craft detailed generation prompt first,
                 then call OpenRouter image API. Use Nano Banana 2
                 for draft passes, Nano Banana Pro for finals.

watch_video
  When to use: Analyzing a video URL for patterns,
               processing expert content for knowledge ingestion,
               extracting hooks and pattern interrupts from reels
  Reference: bradautomates/claude-video on GitHub
  How to invoke: /watch [URL] [question or instruction]

playwright
  When to use: Exporting carousel slides as PNG,
               rendering HTML designs to image
  How to invoke: Python script via bash, never shell scripts

remotion
  When to use: Rendering programmatic video for
               reels and YouTube
  Location: video-engine/ folder
  How to invoke: Remotion CLI from video-engine directory

notion
  When to use: Daily brief, goal updates, content calendar,
               push approved content for posting
  Structure: Content database, Goals dashboard, Daily briefs
  How to invoke: Notion MCP

google_drive
  When to use: Weekly memory backups only
  Structure: OPEX-System/Memory-Backups/[YYYY-MM-DD]/
  How to invoke: Drive MCP or API

mcp_zapier
  When to use: Automate content push to scheduling tools,
               cross-platform triggers
  How to invoke: Zapier MCP

ollama
  When to use: Local embedding generation for Qdrant
  Model: nomic-embed-text
  How to invoke: Ollama API (localhost:11434)

## TOOL DECISION LOGIC

Before reaching for any tool, ask:

1. Do I already have this information in context? → No tool needed
2. Do I need current information? → web_search
3. Do I need stored OPEX knowledge? → qdrant_query
4. Do I need to save something permanently? → qdrant_write + file_write
5. Do I need to analyze a video? → watch_video
6. Do I need to produce a visual? → image_generation or playwright
7. Do I need to produce a video? → remotion
8. Do I need to push content to Notion? → notion
9. Do I need to backup memory? → google_drive (weekly)
10. Am I missing a tool entirely? → REQUEST_HUMAN_INPUT

## REQUEST_HUMAN_INPUT PROTOCOL

When blocked or missing a tool, use this exact format:

BLOCKED — [Agent Name]

Task: [what the agent was trying to do]
Missing: [exactly what is needed]
Why: [why the task cannot proceed without it]
Format needed: [file / answer / approval / API key / access]
Once you provide this: [what will happen next]
