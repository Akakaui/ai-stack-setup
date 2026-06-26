# MODEL ROUTING CONFIGURATION

Last updated: 2025-01-25
Version: 1

## ROUTING RULES

Match the model to the cognitive demand of the task.
Hard thinking = expensive model.
Routine work = cheap model.
Writing quality = Claude Haiku minimum.

All models accessed via OpenRouter unless noted otherwise.

## AGENT MODEL ASSIGNMENTS

OPEX (Orchestrator)
  Model: google/gemini-2.5-pro
  Reason: Complex routing logic, multi-agent coordination,
           highest reasoning demand in the system

Research Agent
  Model: google/gemini-2.5-flash
  Reason: Structured logic, data analysis, goal tracking.
           Fast and cheap for session-start work.

Scheduler Agent
  Model: google/gemini-2.5-flash
  Reason: Sequencing and scheduling logic only.

Content Planner
  Model: google/gemini-2.5-flash
  Reason: Strategic thinking but not creative writing.

Content Writer
  Model: anthropic/claude-haiku-4-5
  Reason: Writing quality matters. Haiku is the lowest
           Claude price point where writing stays sharp.

Editorial Agent
  Model: anthropic/claude-haiku-4-5
  Reason: Long form writing demands quality.

Copy Agent
  Model: anthropic/claude-haiku-4-5
  Reason: Sales copy nuance requires Claude quality.

Sales Agent
  Model: anthropic/claude-haiku-4-5
  Reason: Persuasion and conversion copy needs Claude.

Client Agent
  Model: anthropic/claude-haiku-4-5
  Reason: Client communication nuance. Cannot afford
           a dumb model on client-facing work.

Marketing Agent
  Model: google/gemini-2.5-pro OR anthropic/claude-haiku-4-5
  Reason: Rotate based on task. Strategy = Pro.
           Copy execution = Haiku.

Video Agent
  Model: google/gemini-2.5-flash
  Reason: Structured output, scene planning. No deep
           creativity needed here.

Design Agent
  Model: google/gemini-2.5-flash
  Reason: Structured design briefs and code output.

Knowledge Ingestion Agent
  Model: deepseek/deepseek-chat-v3
  Reason: Long transcript processing. Excellent at
           extraction. Extremely cheap per token.

Hormozi Agent
  Model: deepseek/deepseek-chat-v3
  Reason: Retrieval and pattern matching only.

Kallaway Agent
  Model: deepseek/deepseek-chat-v3
  Reason: Same as above.

Expert Agent
  Model: deepseek/deepseek-chat-v3
  Reason: Same as above.

## IMAGE GENERATION MODELS

Via OpenRouter → Google Gemini:

  Nano Banana 2 (gemini-3.1-flash-image)
    Use for: Draft images, high-volume generation, quick iterations
    Speed: Fast
    Cost: Low

  Nano Banana Pro (gemini-3-pro-image)
    Use for: Final production images, high-fidelity visuals
    Speed: Slower
    Cost: Higher
    Max resolution: 4K

## EMBEDDING MODEL

  Ollama — nomic-embed-text (local)
    Vector size: 768 dimensions
    Cost: Free (runs on VPS)
    Use for: All Qdrant vectorization

## COST ESTIMATE

90% of calls hit Gemini Flash or DeepSeek.
These are near-free at current volume.
Haiku fires only for writing tasks.
Pro fires only for OPEX routing or deep strategy.
Nano Banana 2 for drafts, Nano Banana Pro for finals.
Expected monthly cost starting out: under $15 USD.
