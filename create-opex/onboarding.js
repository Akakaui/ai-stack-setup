import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { generateOpenCodeConfig } from './config/opencode.js';

const DIRS = [
  '.opex',
  '.opex/config',
  '.opex/agents',
  '.opex/skills',
  '.opex/memory',
  '.opex/knowledge',
  '.opex/qdrant',
  '.opex/tools',
  '.opex/tools/document',
];

export function runOnboarding(answers) {
  const root = process.cwd();
  const opexDir = join(root, '.opex');

  for (const dir of DIRS) {
    const p = join(root, dir);
    if (!existsSync(p)) {
      mkdirSync(p, { recursive: true });
    }
  }

  writeUserConfig(opexDir, answers);
  writeManifest(opexDir, answers);
  writeIndex(opexDir, answers);
  writeModelsConfig(opexDir, answers);
  writeToolsConfig(opexDir, answers);
  writeGoalsMemory(opexDir, answers);
  writePerformanceMemory(opexDir, answers);
  writeSessionsMemory(opexDir);
  writeMethodsLog(opexDir);
  writeSkillsLog(opexDir);
  writeQdrantSchema(opexDir);
  writeBootstrapSkill(opexDir, answers);
  writeConfirmationSkill(opexDir);
  writeVoiceSkill(opexDir);
  writeHumanizerSkill(opexDir);
  writePsychologySkill(opexDir);
  writeAttentionSkill(opexDir);
  writeToolsSkill(opexDir);
  writeContentMissionSkill(opexDir);
  writeSalesSkill(opexDir);
  writeCleanupSkill(opexDir);
  writeSkillScannerSkill(opexDir);
  writeSkillCreatorSkill(opexDir);
  writeOpexAgent(opexDir, answers);
  writeResearchAgent(opexDir);
  writeSchedulerAgent(opexDir);
  writeContentPlannerAgent(opexDir);
  writeContentWriterAgent(opexDir);
  writeEditorialAgent(opexDir);
  writeCopyAgent(opexDir);
  writeSalesAgent(opexDir);
  writeOfferAgent(opexDir);
  writeClientAgent(opexDir);
  writeMarketingAgent(opexDir);
  writeVideoAgent(opexDir);
  writeDesignAgent(opexDir);
  writeKnowledgeIngestionAgent(opexDir);
  writeKnowledgeExperts(opexDir);
  writeDesignAgent(opexDir);
  writeDesignSkill(opexDir);
  writeDocumentSkill(opexDir);
  writeWatchSkill(opexDir);
  writeBrowserSkill(opexDir);
  writeReelsPatternsSkill(opexDir);
  writeDocumentPdfTool(opexDir);
  writeDocumentDocxTool(opexDir);
  writeDocumentHtml2PdfTool(opexDir);
  writeDocumentExampleContent(opexDir);

  generateOpenCodeConfig(answers, root);

  console.log('  ✓ .opex/ directory created');
  console.log('  ✓ User configuration generated');
  console.log('  ✓ Agent fleet created (' + countAgents(answers) + ' agents)');
  console.log('  ✓ Skills library created');
  console.log('  ✓ Tools installed');
  console.log('  ✓ Memory files initialized');
}

function countAgents(answers) {
  return answers.platforms.length > 0 ? '14' : '12';
}

function makeHandle(root, name) {
  const safe = (answers) => {
    const p = answers.platforms || [];
    const lower = name.toLowerCase();
    return p.find(pl => pl.toLowerCase().includes(lower)) ? `[your_${name}_handle]` : 'N/A';
  };
  return safe;
}

// ── CONFIG FILES ─────────────────────────────────────────────

function writeUserConfig(dir, a) {
  const platformsSection = ['Twitter/X', 'LinkedIn', 'YouTube', 'Instagram', 'TikTok', 'Blog/SEO']
    .map(p => {
      const found = a.platforms.find(pl => pl.toLowerCase().includes(p.toLowerCase().split('/')[0].toLowerCase()) || pl.toLowerCase().includes(p.toLowerCase().split(',')[0].toLowerCase()));
      const key = p.toLowerCase().replace(/[/\s]/g, '-');
      return `  ${p}: ${found ? '[your_handle]' : 'N/A'}`;
    }).join('\n');

  writeFileSync(join(dir, 'config/user.config.md'), `# USER CONFIGURATION

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

## IDENTITY

Name: ${a.name || '[set during onboarding]'}
System instance name: ${a.business ? 'AKAKA for ' + a.business : 'AKAKA'}
Business type: ${a.business || 'Personal brand — solo operator'}
Industry: ${a.industry || 'Digital business'}
Main goal: ${a.goal || 'Build audience and generate leads'}

## PLATFORMS

${platformsSection}

## BRAND IDENTITY

Background: #0A0A0A (near black)
Card background: #141414 (depth layer — containers, cards, sections)
Accent: #FF6500 (electric orange) — used sparingly, one element only
Text primary: #FFFFFF (white)
Text secondary: #A0A0A0 (cool grey)
Font primary: Montserrat Bold (headlines)
Font body: Montserrat Regular (body)
Font editorial: Playfair Display + Montserrat
Font tech: Space Grotesk + Inter

## API STACK

${a.openrouterKey ? 'LLM Router: OpenRouter (unified API for all models)' : 'LLM Router: (not configured — set OPENROUTER_API_KEY later)'}
${a.openrouterKey ? 'Image Generation: Nano Banana via OpenRouter (Google Gemini)' : 'Image Generation: (requires OpenRouter key)'}
Embeddings: ${a.installOllama ? 'Ollama (nomic-embed-text) — local, free' : '(not installed — set up later if needed)'}
Vector DB: ${a.installQdrant ? 'Qdrant (self-hosted, port 6333)' : '(not installed)'}
${a.notionKey ? 'Notion: Connected — primary content hub' : 'Notion: (not connected — set NOTION_INTEGRATION_KEY later)'}
`);
}

function writeManifest(dir, a) {
  writeFileSync(join(dir, 'MANIFEST.md'), `# MANIFEST

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
System: ${a.business || 'AKAKA'} Business Operating System (OPEX Framework)

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
| skills/cleanup.skill.md | Session cleanup | All (auto-triggered) |
| skills/skill-scanner.skill.md | Scans arsenal, suggests additions | Orchestrator |
| skills/skill-creator.skill.md | Creates new skills and workflows | Orchestrator, knowledge |

## AGENTS (14 files)

| File | Purpose | Model |
|------|---------|-------|
| agents/AKAKA.md | Orchestrator — routes every request | gemini-2.5-pro |
| agents/research-agent.md | Goals, performance, intelligence | gemini-2.5-flash |
| agents/scheduler-agent.md | Daily briefs, sequencing | gemini-2.5-flash |
| agents/content-planner.md | What to make and why | gemini-2.5-flash |
| agents/content-writer.md | Social posts, threads, LinkedIn | claude-haiku-4-5 |
| agents/editorial-agent.md | Articles, long-form content | claude-haiku-4-5 |
| agents/copy-agent.md | Sales copy, email, funnels | claude-haiku-4-5 |
| agents/sales-agent.md | Pitches, DMs, closing | claude-haiku-4-5 |
| agents/offer-agent.md | Digital products, offers, revenue | claude-haiku-4-5 |
| agents/client-agent.md | Discovery through upsell | claude-haiku-4-5 |
| agents/marketing-agent.md | Campaigns, growth, positioning | gemini-2.5-pro / haiku |
| agents/video-agent.md | Reels, YouTube, Remotion | gemini-2.5-flash |
| agents/design-agent.md | Visuals, image gen, design | gemini-2.5-flash |
| agents/knowledge-ingestion.md | Transcripts → skills + Qdrant | deepseek-chat-v3 |

## FILES BY FOLDER

| Folder | Count | Purpose |
|--------|-------|---------|
| config/ | 3 | Identity, models, tools |
| skills/ | 12 | Behavioral instructions |
| agents/ | 14 | Agent definitions |
| memory/ | 5 | Goals, performance, logs |
| knowledge/ | 3 | Expert knowledge agents |
| qdrant/ | 1 | Vector DB schema |
`);
}

function writeIndex(dir, a) {
  writeFileSync(join(dir, 'INDEX.md'), `# AKAKA SYSTEM

Version: 1.0
Owner: ${a.name || '[User Name]'}

You are running the AKAKA Business Operating System.

Before responding to anything, read the following files
in this exact order:

1. .opex/config/user.config.md
2. .opex/agents/AKAKA.md
3. .opex/skills/confirmation.skill.md
4. .opex/skills/bootstrap.skill.md
5. .opex/memory/goals.memory.md

These files contain your complete instructions, identity,
decision logic, and active goals.

Do not respond to any user request until you have
read all five files.

After reading them, you will know:
- Who the user is and what they are building
- How to route any request to the right agent
- What confirmation is required before any action
- What their current goals are

Say exactly this when ready:

"AKAKA system initialized. [Current date].
Active goals loaded: [number of active goals].
Ready. What are we working on?"
`);
}

function writeModelsConfig(dir, a) {
  writeFileSync(join(dir, 'config/models.config.md'), `# MODEL ROUTING CONFIGURATION

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

## ROUTING RULES

Match the model to the cognitive demand of the task.
Hard thinking = expensive model.
Routine work = cheap model.
Writing quality = Claude Haiku minimum.

${a.openrouterKey ? 'All models accessed via OpenRouter unless noted otherwise.' : 'Note: No OpenRouter API key configured. Models will use whatever the AI tool provides by default.'}

## AGENT MODEL ASSIGNMENTS

| Agent | Model | Reason |
|-------|-------|--------|
| AKAKA (Orchestrator) | google/gemini-2.5-pro | Complex routing, multi-agent coordination |
| Research Agent | google/gemini-2.5-flash | Structured logic, data analysis |
| Scheduler Agent | google/gemini-2.5-flash | Sequencing and scheduling |
| Content Planner | google/gemini-2.5-flash | Strategic thinking |
| Content Writer | anthropic/claude-haiku-4-5 | Writing quality |
| Copy Agent | anthropic/claude-haiku-4-5 | Sales copy nuance |
| Sales Agent | anthropic/claude-haiku-4-5 | Persuasion and conversion |
| Marketing Agent | google/gemini-2.5-pro or haiku | Strategy or execution |
| Video Agent | google/gemini-2.5-flash | Structured output |
| Design Agent | google/gemini-2.5-flash | Design briefs, code output |
| Knowledge Agent | deepseek/deepseek-chat-v3 | Transcript processing |

${a.installOllama ? `## EMBEDDING MODEL

  Ollama — nomic-embed-text (local)
    Vector size: 768 dimensions
    Cost: Free (runs locally)` : '## EMBEDDING MODEL\n  (Not configured — install Ollama or use an API provider)'}

${a.openrouterKey ? `## COST ESTIMATE

90% of calls hit Gemini Flash or DeepSeek.
These are near-free at current volume.
Haiku fires only for writing tasks.
Pro fires only for AKAKA routing or deep strategy.
Expected monthly cost starting out: under $15 USD.` : ''}
`);
}

function writeToolsConfig(dir, a) {
  writeFileSync(join(dir, 'config/tools.config.md'), `# TOOLS CONFIGURATION

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

## AVAILABLE TOOLS

web_search
  When to use: Current information, research,
               competitor intel, trending topics
  How to invoke: Call web search with specific query

${a.installQdrant ? `qdrant_query
  When to use: Retrieving stored knowledge, past
               performance data, goals history
  Collections: knowledge, performance, goals
  How to invoke: Query specific collection with
                 semantic search term

qdrant_write
  When to use: Saving new knowledge, logging performance
  How to invoke: Write to collection with metadata` : '# qdrant: not installed — skip vector DB tools'}

file_read
  When to use: Loading skill files, reading memory
  How to invoke: Read file by path

file_write
  When to use: Updating skill files, writing to memory
  How to invoke: Write to file by path

image_generation
  When to use: Blog headers, social visuals, article covers
  ${a.openrouterKey ? 'Router: OpenRouter — Nano Banana models' : 'Requires: OpenRouter API key'}
  How to invoke: Craft detailed prompt, call image API

${a.notionKey ? `notion
  When to use: Daily briefs, goal updates, content calendar
  How to invoke: Notion MCP` : ''}

${a.installOllama ? `ollama
  When to use: Local embedding generation for Qdrant
  Model: nomic-embed-text
  How to invoke: Ollama API (localhost:11434)` : ''}

## TOOL DECISION LOGIC

Before reaching for any tool, ask:
1. Do I already have this information? → No tool needed
2. Need current info? → web_search
3. Need stored knowledge? → qdrant_query
4. Need to save something? → qdrant_write + file_write
5. Need to produce a visual? → image_generation
6. Missing a tool? → REQUEST_HUMAN_INPUT
`);
}

// ── MEMORY FILES ─────────────────────────────────────────────

function writeGoalsMemory(dir, a) {
  writeFileSync(join(dir, 'memory/goals.memory.md'), `# GOALS MEMORY

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

## ACTIVE GOALS

<!-- Format:
### G[number] — [Title]
  Type: revenue/audience/content/client/product
  Target: [specific metric]
  Deadline: [date]
  Status: active/paused/completed
  Progress: [current status]
  Linked agents: [which agents support this goal]
-->

### G001 — ${a.goal || 'Build and scale the business'}
  Type: revenue
  Target: $100,000 USD
  Deadline: 6 months from system launch
  Status: active
  Progress: $0 / $100,000
  Linked agents: Research Agent, Offer Agent, Sales Agent

## ARCHIVED GOALS

<!-- Completed or abandoned goals move here with completion date -->

## GOAL HISTORY

<!-- Log of goal changes: date, goal_id, what changed, why -->
`);
}

function writePerformanceMemory(dir) {
  writeFileSync(join(dir, 'memory/performance.memory.md'), `# PERFORMANCE MEMORY

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

## CONTENT PERFORMANCE

<!-- Log posts with: date, platform, type, engagement rate, notes -->

| Date | Platform | Type | Engagement | Notes |
|------|----------|------|------------|-------|
</details>
`);
}

function writeSessionsMemory(dir) {
  writeFileSync(join(dir, 'memory/sessions.memory.md'), `# SESSIONS MEMORY

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

## SESSION LOG

| Date | Focus | Agents Used | Key Decisions |
|------|-------|-------------|---------------|
</details>
`);
}

function writeMethodsLog(dir) {
  writeFileSync(join(dir, 'memory/methods-log.memory.md'), `# METHODS LOG

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

## METHOD LOG

| Date | Method | Agent | Outcome |
|------|--------|-------|---------|
</details>
`);
}

function writeSkillsLog(dir) {
  writeFileSync(join(dir, 'memory/skills-log.memory.md'), `# SKILLS LOG

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

## SKILL HISTORY

| Date | Skill | Action | Version |
|------|-------|--------|---------|
</details>
`);
}

// ── QDRANT SCHEMA ────────────────────────────────────────────

function writeQdrantSchema(dir) {
  writeFileSync(join(dir, 'qdrant/schema.md'), `# QDRANT COLLECTION SCHEMAS

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

## COLLECTIONS

### knowledge
  Vector size: 768 (nomic-embed-text)
  Distance: Cosine
  Payload: { id, title, content, source, timestamp, tags }

### goals
  Vector size: 768
  Distance: Cosine
  Payload: { id, title, description, status, deadline, progress }

### performance
  Vector size: 768
  Distance: Cosine
  Payload: { id, date, platform, metric, value, notes }
`);
}

// ── SKILL FILES ──────────────────────────────────────────────

function writeBootstrapSkill(dir, a) {
  writeFileSync(join(dir, 'skills/bootstrap.skill.md'), `# BOOTSTRAP SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: ALL AGENT TOOLS — startup orientation

## PURPOSE

You are operating inside the AKAKA Business Operating System
for ${a.name || 'the user'} (${a.business || 'creator/coach'}).

## STARTUP SEQUENCE

Execute these steps in order before responding to any request:

Step 1 — Load user identity
Read: .opex/config/user.config.md

Step 2 — Load your decision logic
Read: .opex/agents/AKAKA.md

Step 3 — Load active goals
Read: .opex/memory/goals.memory.md

Step 4 — Load recent performance
Read: .opex/memory/performance.memory.md

Step 5 — Identify the task
Only after reading the above four files, respond to
the user's request using AKAKA's decision logic.

## FOLDER MAP

.opex/
  agents/     all agent instruction files
  skills/     all skill files
  memory/     all memory and log files
  config/     user configuration
  qdrant/     vector database schemas
  knowledge/  expert knowledge agents
`);
}

function writeConfirmationSkill(dir) {
  writeFileSync(join(dir, 'skills/confirmation.skill.md'), `# CONFIRMATION SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: ALL AGENTS — mandatory and non-negotiable

## THE RULE

No agent takes any irreversible action without explicit user confirmation.

## WHAT REQUIRES CONFIRMATION

- Writing to any file (skill update, memory update, log entry)
- Calling any external API (image generation, Notion)
- Sending or scheduling any content
- Deleting any file or data
- Making any purchase or API call that costs money
- Running any bash command that modifies the system
- Querying Qdrant with a write operation
- Spawning a subagent for a task

## WHAT DOES NOT REQUIRE CONFIRMATION

- Reading files, reading Qdrant, drafting content, presenting plans,
  asking clarifying questions, web searches

## THE CONFIRMATION FORMAT

PLAN — [Agent Name]

Task: [what this agent is about to do]
Method: [how it will do it]
Files affected: [which files will be written or modified]
Tools to be called: [which tools will fire]
Output: [what will be produced]
Reversible: [yes / no]

Waiting for your approval before proceeding.
`);
}

function writeVoiceSkill(dir) {
  writeFileSync(join(dir, 'skills/voice.skill.md'), `# VOICE SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: Content agents

## TONE

- Direct, confident, no fluff
- Short sentences. Punchy.
- Speaks to one person (you)
- No corporate jargon, no padding
- Contractions are fine (it's, you're, don't)
- Period at the end of every sentence. No exceptions.
- No emojis in body copy (use sparingly in social)

## RULES

- Never start with "In today's digital landscape" or similar
- Never use "delve", "unlock", "game-changer", "revolutionize"
- One idea per sentence
- Every paragraph under 3 lines
- Say what you mean. Mean what you say.
`);
}

function writeHumanizerSkill(dir) {
  writeFileSync(join(dir, 'skills/humanizer.skill.md'), `# HUMANIZER SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: All content agents

## STRIP PATTERNS

Remove these AI tells from every output:

- "In today's [noun]" openings
- "It's worth noting that"
- "Let's dive in"
- "In conclusion"
- Overuse of "however", "moreover", "furthermore"
- Generic transition phrases
- Lists of exactly 3 items unless intentional
- Perfect paragraph symmetry
`);
}

function writePsychologySkill(dir) {
  writeFileSync(join(dir, 'skills/psychology.skill.md'), `# PSYCHOLOGY SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: Content, copy, sales agents

## PRINCIPLES

1. Loss Aversion — people fear loss more than they value gain
2. Social Proof — people follow what others are doing
3. Authority — people trust experts
4. Reciprocity — give value before asking for it
5. Scarcity — limited time/availability increases desire
6. Commitment — small yes leads to big yes
7. Liking — people buy from people they like
`);
}

function writeAttentionSkill(dir) {
  writeFileSync(join(dir, 'skills/attention.skill.md'), `# ATTENTION SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: Content, copy, editorial

## HOOK FRAMEWORKS

1. The Contrarian — "Everyone says X. They're wrong."
2. The Specific Number — "I made $47k with this one change."
3. The Question — "Why do 90% of creators fail in year one?"
4. The Story Opener — "I almost quit my business last Tuesday."
5. The Bold Statement — "Your content strategy is burning money."
6. The Curiosity Gap — "The one metric no one tracks (but should)."
`);
}

function writeToolsSkill(dir) {
  writeFileSync(join(dir, 'skills/tools.skill.md'), `# TOOLS SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: All agents

## AVAILABLE ACTIONS

- web_search: current information, research
- file_read: load any file from .opex/
- file_write: write to any file in .opex/
- image_generation: create visuals

## REQUEST_HUMAN_INPUT

When blocked or missing a tool, use this format:

BLOCKED — [Agent Name]
Task: [what you were trying to do]
Missing: [exactly what is needed]
Why: [why the task cannot proceed without it]
`);
}

function writeContentMissionSkill(dir) {
  writeFileSync(join(dir, 'skills/content-mission.skill.md'), `# CONTENT MISSION SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: Content planner, writer

## MISSION FORMAT

Every piece of content gets a mission:

Mission: [what this content achieves]
Platform: [where it goes]
Target: [who it reaches]
Hook: [how it grabs attention]
Goal connection: [which G00 it supports]
`);
}

function writeSalesSkill(dir) {
  writeFileSync(join(dir, 'skills/sales.skill.md'), `# SALES SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: Sales, copy, client agents

## FRAMEWORKS

PAS: Problem → Agitate → Solve
AIDA: Attention → Interest → Desire → Action
4Ps: Picture → Promise → Proof → Push

## OBJECTION HANDLING

1. Listen fully
2. Validate the concern
3. Reframe around value
4. Offer evidence
5. Ask for the close
`);
}

function writeCleanupSkill(dir) {
  writeFileSync(join(dir, 'skills/cleanup.skill.md'), `# CLEANUP SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: All (auto-triggered)

At end of every session:
1. Log key decisions to sessions.memory.md
2. Update relevant memory files
3. Flag any skills that need updating
`);
}

function writeSkillScannerSkill(dir) {
  writeFileSync(join(dir, 'skills/skill-scanner.skill.md'), `# SKILL SCANNER

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

Periodically scan the .opex/ directory and suggest:
- Missing skills for current goals
- Outdated skill files
- Gaps in agent coverage
- New tools that should be integrated
`);
}

function writeSkillCreatorSkill(dir) {
  writeFileSync(join(dir, 'skills/skill-creator.skill.md'), `# SKILL CREATOR

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

When a new skill or workflow is needed:
1. Define the purpose and scope
2. Create the skill file in skills/
3. Update AKAKA.md to reference it
4. Log creation in skills-log.memory.md
`);

// ── AGENT FILES ──────────────────────────────────────────────
}

function writeOpexAgent(dir, a) {
  const agentName = a.name || 'opex';
  const displayName = agentName.charAt(0).toUpperCase() + agentName.slice(1);
  writeFileSync(join(dir, `agents/${agentName}.md`), `# ${displayName.toUpperCase()} — ORCHESTRATOR

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: primary
Model: google/gemini-2.5-pro

## IDENTITY

You are ${displayName}, the orchestrator of the ${a.business || agentName} Business
Operating System. You route every request to the right agent,
coordinate multi-agent tasks, and ensure the system operates
as a cohesive unit. You do NOT do the work yourself. You delegate.

## SKILLS TO LOAD

1. confirmation.skill.md — mandatory for every action
2. bootstrap.skill.md — startup sequence
3. tools.skill.md — tool awareness
4. voice.skill.md — writing quality standards

## DECISION LOGIC

When a request comes in, follow this flow:

### Step 1: Classify the Request

  CONTENT request → Content Planner → Content Writer
  SALES request → Sales Agent
  CLIENT request → Client Agent
  DESIGN request → Design Agent
  VIDEO request → Video Agent
  RESEARCH request → Research Agent
  STRATEGY request → Marketing Agent
  PRODUCT request → Offer Agent
  SCHEDULE request → Scheduler Agent
  KNOWLEDGE request → Knowledge Ingestion Agent
  SYSTEM request → Handle directly

### Step 2: Load Context
  - goals.memory.md
  - performance.memory.md
  - Relevant skill files

### Step 3: Delegate with Brief
  - What needs to be done
  - Which goal it supports
  - Constraints (platform, tone, format)
  - Expected output

### Step 4: Confirm Before Execution
  Use the PLAN format from confirmation.skill.md

### Step 5: Review and Route
  - Review output against quality standards
  - Run humanizer check
  - Route to appropriate destination
  - Log to memory files

## ROUTING TABLE

| Request type | Agent | Skills loaded |
|-------------|-------|---------------|
| Write a post | Content Writer | voice, humanizer, attention |
| Plan my week | Content Planner | content-mission |
| Write sales copy | Copy Agent | sales, humanizer |
| Analyze competitor | Research Agent | tools |
| Create a design | Design Agent | design, document |
| Edit a video | Video Agent | — |
| Goal progress | Research Agent | tools |
| Write an article | Editorial Agent | voice, humanizer |
| Daily brief | Scheduler Agent | tools |
| Ingest transcript | Knowledge Agent | tools |
| Close a deal | Sales Agent | sales |
| Create offers | Offer Agent | psychology |
| Marketing campaign | Marketing Agent | psychology |
| Help with client | Client Agent | sales, voice |

## ERROR HANDLING

BLOCKED → raise to user with full context
UNCLEAR → ask clarifying question
PARTIAL → identify missing piece, re-brief
FAILED → log, adjust, retry once
`);
}

function writeResearchAgent(dir) {
  writeFileSync(join(dir, 'agents/research-agent.md'), `# RESEARCH AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: primary
Model: google/gemini-2.5-flash

## IDENTITY

You track goals, analyze performance data, and gather intelligence.
You are the system's analytical engine.

## RESPONSIBILITIES

- Track goal progress across all active goals
- Analyze content performance data
- Research competitors and market trends
- Generate performance reports
- Identify patterns and opportunities

## SKILLS TO LOAD

1. tools.skill.md
`);
}

function writeSchedulerAgent(dir) {
  writeFileSync(join(dir, 'agents/scheduler-agent.md'), `# SCHEDULER AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: primary
Model: google/gemini-2.5-flash

## IDENTITY

You manage the daily brief, content calendar, and sequencing.
You ensure nothing falls through the cracks.

## RESPONSIBILITIES

- Generate daily briefs
- Sequence content production pipeline
- Track deadlines and upcoming commitments
- Balance workload across goals
`);
}

function writeContentPlannerAgent(dir) {
  writeFileSync(join(dir, 'agents/content-planner.md'), `# CONTENT PLANNER

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: all
Model: google/gemini-2.5-flash

## IDENTITY

You decide WHAT to create and WHY. You do not write the
content — you plan it.

## SKILLS TO LOAD

1. content-mission.skill.md
2. attention.skill.md
3. voice.skill.md
`);
}

function writeContentWriterAgent(dir) {
  writeFileSync(join(dir, 'agents/content-writer.md'), `# CONTENT WRITER

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: all
Model: anthropic/claude-haiku-4-5

## IDENTITY

You write content that people stop scrolling for. You take
a mission from the Content Planner and turn it into a post,
thread, or piece of copy.

## SKILLS TO LOAD

1. voice.skill.md
2. humanizer.skill.md
3. attention.skill.md
`);
}

function writeEditorialAgent(dir) {
  writeFileSync(join(dir, 'agents/editorial-agent.md'), `# EDITORIAL AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: all
Model: anthropic/claude-haiku-4-5

## IDENTITY

You write long-form content — articles, newsletters, essays.
Depth over breadth. Value over volume.

## SKILLS TO LOAD

1. voice.skill.md
2. humanizer.skill.md
`);
}

function writeCopyAgent(dir) {
  writeFileSync(join(dir, 'agents/copy-agent.md'), `# COPY AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: all
Model: anthropic/claude-haiku-4-5

## IDENTITY

You write copy that converts. Sales emails, landing pages,
funnel copy, offers. Every word earns its place.

## SKILLS TO LOAD

1. sales.skill.md
2. humanizer.skill.md
3. psychology.skill.md
`);
}

function writeSalesAgent(dir) {
  writeFileSync(join(dir, 'agents/sales-agent.md'), `# SALES AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: all
Model: anthropic/claude-haiku-4-5

## IDENTITY

You close deals. Pitches, DMs, discovery calls, follow-ups,
objection handling. You move people from interested to sold.

## SKILLS TO LOAD

1. sales.skill.md
2. psychology.skill.md
`);
}

function writeOfferAgent(dir) {
  writeFileSync(join(dir, 'agents/offer-agent.md'), `# OFFER AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: all
Model: anthropic/claude-haiku-4-5

## IDENTITY

You design offers that people can't refuse. You find the gap
between what the market needs and what competitors provide.
`);
}

function writeClientAgent(dir) {
  writeFileSync(join(dir, 'agents/client-agent.md'), `# CLIENT AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: all
Model: anthropic/claude-haiku-4-5

## IDENTITY

You manage client relationships from discovery through upsell.
Professional, warm, thorough. Every client feels like the only client.
`);
}

function writeMarketingAgent(dir) {
  writeFileSync(join(dir, 'agents/marketing-agent.md'), `# MARKETING AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: all
Model: google/gemini-2.5-pro / anthropic/claude-haiku-4-5

## IDENTITY

You plan and execute marketing campaigns. Strategy = Pro model.
Copy execution = Haiku model. You own the growth numbers.
`);
}

function writeVideoAgent(dir) {
  writeFileSync(join(dir, 'agents/video-agent.md'), `# VIDEO AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: all
Model: google/gemini-2.5-flash

## IDENTITY

You plan, script, and produce video content. Reels, YouTube,
shorts. You think visually and write for the ear, not the eye.
`);
}

function writeDesignAgent(dir) {
  writeFileSync(join(dir, 'agents/design-agent.md'), `# DESIGN AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: subagent
Model: google/gemini-2.5-flash

## IDENTITY

You create visuals — social graphics, carousels, posters,
banners, covers. You use Open Design or direct code output.
`);
}

function writeKnowledgeIngestionAgent(dir) {
  writeFileSync(join(dir, 'agents/knowledge-ingestion.md'), `# KNOWLEDGE INGESTION AGENT

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Mode: subagent
Model: deepseek/deepseek-chat-v3

## IDENTITY

You process transcripts, videos, and documents into structured
knowledge. Extract frameworks, methods, hooks, and insights.

## WORKFLOW

1. Receive source material (transcript, video, document)
2. Extract: frameworks, methods, hooks, key insights
3. Write extracted knowledge to skill files
4. If Qdrant is available, write to knowledge collection
5. Log creation to skills-log.memory.md
`);
}

function writeKnowledgeExperts(dir) {
  writeFileSync(join(dir, 'knowledge/hormozi-agent.md'), `# HORMOZI FRAMEWORKS

Knowledge base: Alex Hormozi business and scaling frameworks.
- $100M Leads
- $100M Offers
- The Game of Business
- The Brain Audit principles
`);
  writeFileSync(join(dir, 'knowledge/kallaway-agent.md'), `# KALLAWAY FRAMEWORKS

Knowledge base: Kallaway social media and monetization.
- Twitter growth patterns
- Content repurposing systems
- Audience building frameworks
`);
  writeFileSync(join(dir, 'knowledge/expert-agent.md'), `# EXPERT AGENT — TEMPLATE

Knowledge base: [Expert name]
- Core frameworks: [list]
- Key insights: [list]
- Application: [how to use this knowledge]
`);
}

function writeDesignSkill(dir) {
  writeFileSync(join(dir, 'skills/design.skill.md'), `# DESIGN SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: Design Agent, Content Writer

## PURPOSE

Complete production system for all visual design outputs.
From brief to exported PNGs, ready to post or print.
Covers social media, marketing, print, and web design.

## BRAND SPECS

Colors:
  Background: #0A0A0A (near black)
  Card: #141414 (containers, code blocks)
  Text primary: #FFFFFF
  Text secondary: #A0A0A0
  Accent: #FF6500 (ONE element max per design)

Typography:
  Font: Montserrat (all weights)
  Headline: Bold, 48-64px, #FFFFFF
  Body: Regular, 24-32px, #FFFFFF
  Secondary: Regular, 18-24px, #A0A0A0
  Accent: Bold, 24-32px, #FF6500

## FORMAT SPECS

Instagram Post (Square): 1080x1080px
Instagram Post (Portrait): 1080x1350px
Instagram Story / Reel Cover: 1080x1920px
LinkedIn Post: 1200x627px
LinkedIn Banner: 1584x396px
Twitter/X Post: 1200x675px
Twitter/X Header: 1500x500px
Facebook Post: 1200x630px
Facebook Cover: 820x312px
YouTube Thumbnail: 1280x720px
YouTube Banner: 2560x1440px
TikTok Cover: 1080x1920px
Blog Hero: 1200x630px
OG Image: 1200x630px
Poster (A4): 2480x3508px (300 DPI)
Business Card: 1050x600px (300 DPI)
Email Header: 600x200px

## PRODUCTION FLOW

1. Content Writer provides design brief copy
2. Design Agent writes HTML/CSS for each format
3. Export via Playwright at target resolution
4. Quality check: readability, brand alignment
5. Deliver PNGs in order
`);
}

function writeDocumentSkill(dir) {
  writeFileSync(join(dir, 'skills/document.skill.md'), `# DOCUMENT SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: Design Agent, Content Writer, All Agents

## PURPOSE

Production system for creating professional documents:
PDFs, Word docs (.docx), presentations, and print-ready files.
From content to exported files, ready to share or print.

## DOCUMENT TYPES

PDF:
  - Reports and proposals
  - Invoices and receipts
  - Ebooks and guides
  - Whitepapers

Word (.docx):
  - Editable templates
  - Client deliverables
  - Contracts and agreements

Presentations:
  - Slide decks
  - Pitch decks
  - Training materials

## TOOLS

Location: ~/.opex/tools/document/
  - pdf.js — PDF generation from structured content
  - docx.js — Word document generation
  - html2pdf.js — HTML to PDF via Playwright

## BRAND SPECS

Colors:
  Background: #0A0A0A (dark mode) or #FFFFFF (print)
  Text: #000000 (print) / #FFFFFF (dark)
  Accent: #FF6500 (headers, key points)

Typography:
  Headings: Montserrat Bold
  Body: Inter or Montserrat Regular
  Code: Fira Code or Courier

## PRODUCTION FLOW

1. Write content as JSON or HTML
2. Use appropriate tool to generate output
3. Quality check: formatting, brand alignment
4. Deliver file to user
`);
}

function writeWatchSkill(dir) {
  writeFileSync(join(dir, 'skills/watch.skill.md'), `# WATCH SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: All agents

## PURPOSE

Analyze YouTube videos and extract knowledge for training skills.
Downloads subtitles/transcripts without downloading video.

## TOOLS

yt-dlp — subtitle extraction
ffmpeg — audio processing (if needed)
Groq Whisper — transcription fallback

## USAGE

Extract subtitles:
  yt-dlp --write-auto-sub --sub-lang en --skip-download --sub-format vtt -o "%(title)s.%(ext)s" <url>

Clean transcript:
  - Remove timestamps
  - Remove filler words
  - Format as knowledge

## TRAINING WORKFLOW

1. User provides YouTube URL(s)
2. Extract subtitles via yt-dlp
3. Clean and format transcript
4. Inject into skill knowledge base
5. Update memory files
`);
}

function writeBrowserSkill(dir) {
  writeFileSync(join(dir, 'skills/browser.skill.md'), `# BROWSER SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: Browser Agent

## PURPOSE

On-demand browser automation for web tasks.
Only runs when explicitly requested.

## CAPABILITIES

- Navigate websites
- Fill forms
- Click buttons
- Take screenshots
- Extract data
- Test web apps

## USAGE

Agent: browser
Mode: subagent
Model: google/gemini-2.5-flash

Launch: Only on-demand, not auto-start
`);
}

function writeReelsPatternsSkill(dir) {
  writeFileSync(join(dir, 'skills/reels-patterns.skill.md'), `# REELS PATTERNS SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1
Scope: Content Writer, Video Agent

## PURPOSE

Patterns and frameworks for creating viral Instagram Reels
and short-form video content.

## HOOK PATTERNS

Bold claim: "I made $X in Y days"
Question: "Why isn't your..."
Stat: "X% of people..."
Contrarian: "Stop doing..."

## CONTENT STRUCTURE

1. Hook (0-3 seconds)
2. Problem (3-7 seconds)
3. Solution (7-30 seconds)
4. CTA (final 3 seconds)

## BEST PRACTICES

- Keep under 60 seconds
- Use captions for accessibility
- Trending audio when relevant
- Fast cuts, high energy
- Clear visual storytelling
`);
}

function writeDocumentPdfTool(dir) {
  writeFileSync(join(dir, 'tools/document/pdf.js'), \`#!/usr/bin/env node

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const COLORS = {
  background: '#0A0A0A',
  accent: '#FF6500',
  textPrimary: '#000000',
  textSecondary: '#666666',
  white: '#FFFFFF'
};

function createPDF(content, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: options.pageSize || 'A4',
      margins: { top: 72, bottom: 72, left: 72, right: 72 }
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    if (typeof content === 'string') {
      doc.fontSize(12).font('Helvetica').text(content);
    } else if (Array.isArray(content)) {
      for (const item of content) {
        switch (item.type) {
          case 'heading':
            doc.moveDown(1);
            doc.fontSize(item.size || 24).font('Helvetica-Bold').text(item.text);
            break;
          case 'paragraph':
            doc.moveDown(0.5);
            doc.fontSize(item.size || 12).font('Helvetica').text(item.text);
            break;
          case 'list':
            for (const li of (item.items || [])) {
              doc.fontSize(12).font('Helvetica').text(\`  • \${li}\`, { indent: 20 });
            }
            break;
        }
      }
    }

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const outputIdx = args.indexOf('--output');
  
  if (inputIdx === -1 || outputIdx === -1) {
    console.error('Usage: node pdf.js --input <content.json> --output <output.pdf>');
    process.exit(1);
  }

  const inputPath = path.resolve(args[inputIdx + 1]);
  const outputPath = path.resolve(args[outputIdx + 1]);

  const content = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  await createPDF(content, outputPath);
  console.log(\`PDF created: \${outputPath}\`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createPDF };
\`);
}

function writeDocumentDocxTool(dir) {
  writeFileSync(join(dir, 'tools/document/docx.js'), \`#!/usr/bin/env node

const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');

function createHeading(text, level = 1) {
  const headingMap = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3
  };
  return new Paragraph({
    text: text,
    heading: headingMap[level] || HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 }
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold: options.bold || false, size: 24 })],
    spacing: { after: 200 }
  });
}

async function createDocx(content, outputPath) {
  const children = [];
  
  if (typeof content === 'string') {
    children.push(createParagraph(content));
  } else if (Array.isArray(content)) {
    for (const item of content) {
      switch (item.type) {
        case 'heading':
          children.push(createHeading(item.text, item.level));
          break;
        case 'paragraph':
          children.push(createParagraph(item.text, item.options));
          break;
        case 'list':
          for (const li of (item.items || [])) {
            children.push(createParagraph(\`• \${li}\`));
          }
          break;
      }
    }
  }

  const doc = new Document({
    sections: [{ children }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

async function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const outputIdx = args.indexOf('--output');
  
  if (inputIdx === -1 || outputIdx === -1) {
    console.error('Usage: node docx.js --input <content.json> --output <output.docx>');
    process.exit(1);
  }

  const inputPath = path.resolve(args[inputIdx + 1]);
  const outputPath = path.resolve(args[outputIdx + 1]);

  const content = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  await createDocx(content, outputPath);
  console.log(\`DOCX created: \${outputPath}\`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createDocx };
\`);
}

function writeDocumentHtml2PdfTool(dir) {
  writeFileSync(join(dir, 'tools/document/html2pdf.js'), \`#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function htmlToPdf(htmlContent, outputPath, options = {}) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(options.waitMs || 3000);
  
  await page.pdf({
    path: outputPath,
    format: options.pageSize || 'A4',
    margin: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
    printBackground: true
  });
  
  await browser.close();
}

async function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const outputIdx = args.indexOf('--output');
  
  if (inputIdx === -1 || outputIdx === -1) {
    console.error('Usage: node html2pdf.js --input <content.html> --output <output.pdf>');
    process.exit(1);
  }

  const inputPath = path.resolve(args[inputIdx + 1]);
  const outputPath = path.resolve(args[outputIdx + 1]);

  const html = fs.readFileSync(inputPath, 'utf-8');
  await htmlToPdf(html, outputPath);
  console.log(\`PDF created: \${outputPath}\`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { htmlToPdf };
\`);
}

function writeDocumentExampleContent(dir) {
  writeFileSync(join(dir, 'tools/document/example-content.json'), \`[
  {
    "type": "heading",
    "level": 1,
    "text": "OPEX Business Operating System"
  },
  {
    "type": "paragraph",
    "text": "This document demonstrates the document generation capabilities."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Features"
  },
  {
    "type": "list",
    "items": [
      "PDF generation from HTML or structured content",
      "Word document creation with proper formatting",
      "Professional styling with brand colors",
      "Table support for data presentation"
    ]
  }
]
\`);
}

