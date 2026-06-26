# MANIFEST

Last updated: 2025-01-25
Version: 1
System: OPEX Business Operating System (OPEX Framework)
Total files: 53

## CONFIG (3 files)

| File | Purpose |
|------|---------|
| config/user.config.md | Personal configuration — identity, platforms, brand, goals |
| config/models.config.md | Model routing — which model runs which agent |
| config/tools.config.md | Tools and MCPs — what tools are available and when |

## SKILLS (15 files)

| File | Purpose | Scope |
|------|---------|-------|
| skills/confirmation.skill.md | Mandatory confirmation protocol | All agents |
| skills/bootstrap.skill.md | Startup orientation sequence | All tools |
| skills/tools.skill.md | Tool awareness and selection | All agents |
| skills/voice.skill.md | Writing voice and tone rules | Content agents |
| skills/humanizer.skill.md | Strip AI patterns from output | All content agents |
| skills/psychology.skill.md | Persuasion principles | Content, copy, sales |
| skills/attention.skill.md | Hook frameworks | Content, copy, editorial |
| skills/content-mission.skill.md | Mission assignment framework | Content planner, writer |
| skills/sales.skill.md | Sales frameworks | Sales, copy, client |
| skills/reels-patterns.skill.md | Reel pattern library | Video agent, writer |
| skills/carousel.skill.md | Carousel production system | Design agent, writer |
| skills/watch.skill.md | Video analysis capability | Knowledge, video, research |
| skills/cleanup.skill.md | Session cleanup and push to Notion | All (auto-triggered) |
| skills/skill-scanner.skill.md | Scans arsenal, suggests additions | Orchestrator |
| skills/skill-creator.skill.md | Creates new skills and workflows | Orchestrator, knowledge |

## AGENTS (14 files)

| File | Purpose | Mode | Model |
|------|---------|------|-------|
| agents/OPEX.md | Orchestrator — routes every request | primary | gemini-2.5-pro |
| agents/research-agent.md | Goals, performance, intelligence | primary | gemini-2.5-flash |
| agents/scheduler-agent.md | Daily briefs, sequencing | primary | gemini-2.5-flash |
| agents/content-planner.md | What to make and why | all | gemini-2.5-flash |
| agents/content-writer.md | Social posts, threads, LinkedIn | all | claude-haiku-4-5 |
| agents/editorial-agent.md | Medium articles, long-form | all | claude-haiku-4-5 |
| agents/copy-agent.md | Sales copy, email, funnels | all | claude-haiku-4-5 |
| agents/sales-agent.md | Pitches, DMs, closing, VSLs | all | claude-haiku-4-5 |
| agents/offer-agent.md | Digital products, offers, revenue stack | all | claude-haiku-4-5 |
| agents/client-agent.md | Discovery through upsell | all | claude-haiku-4-5 |
| agents/marketing-agent.md | Campaigns, growth, positioning | all | gemini-2.5-pro / haiku |
| agents/video-agent.md | Reels, YouTube, Remotion | all | gemini-2.5-flash |
| agents/design-agent.md | Visuals, image gen, design | subagent | gemini-2.5-flash |
| agents/knowledge-ingestion.md | Transcripts + video → skills + Qdrant | subagent | deepseek-chat-v3 |

## KNOWLEDGE (3 files)

| File | Purpose | Model |
|------|---------|-------|
| knowledge/hormozi-agent.md | Alex Hormozi frameworks | deepseek-chat-v3 |
| knowledge/kallaway-agent.md | Kallaway social + monetization | deepseek-chat-v3 |
| knowledge/expert-agent.md | Expandable expert template | deepseek-chat-v3 |

## MEMORY (5 files)

| File | Purpose |
|------|---------|
| memory/goals.memory.md | All active and archived goals |
| memory/performance.memory.md | Post results and content patterns |
| memory/methods-log.memory.md | Methods used, when, outcome |
| memory/skills-log.memory.md | Skill creation and update history |
| memory/sessions.memory.md | Session summaries and key decisions |

## SYSTEM (2 files)

| File | Purpose |
|------|---------|
| INDEX.md | Bootstrap pointer for no-config tools |
| MANIFEST.md | This file — complete system inventory |

## QDRANT (1 file)

| File | Purpose |
|------|---------|
| qdrant/schema.md | All 6 collection definitions with payload schemas |

## VIDEO ENGINE (6 files)

| File | Purpose |
|------|---------|
| video-engine/README.md | Video engine setup and usage |
| video-engine/components/motion.md | Spring animations, easing specs |
| video-engine/components/typography.md | Kinetic text components |
| video-engine/components/transitions.md | Scene transition library |
| video-engine/components/overlays.md | Lower thirds, captions, CTAs |

## DESIGN AGENT (6 files)

| File | Purpose |
|------|---------|
| design-agent/knowledge-bank.json | Self-updating rules and lessons |
| design-agent/references/carousel.md | Carousel style guide |
| design-agent/references/poster.md | Poster style guide |
| design-agent/references/social-post.md | Social graphic guide |
| design-agent/references/cover-banner.md | Cover and banner guide |
| design-agent/scripts/export.py | Playwright export script |

## TOTAL: 53 FILES

## API STACK (Updated from original)

| Service | Provider | Purpose |
|---------|----------|---------|
| LLM Router | OpenRouter | Unified API for all models |
| Image Gen | Nano Banana via OpenRouter | Google Gemini image generation |
| Embeddings | Ollama (nomic-embed-text) | Local, free vector embeddings |
| Vector DB | Qdrant (self-hosted) | Structured memory |
| Transcription | Groq Whisper | Video/audio transcription |
| Content Hub | Notion | Daily briefs, posts, calendar |
| Backup | Google Drive | Weekly memory backups |
| Automation | Zapier | Cross-platform triggers |
