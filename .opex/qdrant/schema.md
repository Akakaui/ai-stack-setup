# QDRANT SCHEMA

Last updated: 2025-01-25
Version: 1
Instance: Local (VPS)
Port: 6333 (default)
RAM requirement: 512MB minimum
Embeddings: Ollama nomic-embed-text (768 dimensions)

## INSTALLATION

Single binary. No JVM. No heavy dependencies.

Install:
  curl -L https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-unknown-linux-gnu.tar.gz | tar xz

Run:
  ./qdrant

## COLLECTIONS

### knowledge

Purpose: Expert frameworks, methods, insights from ingested content
Embedding model: nomic-embed-text via Ollama (local)
Vector size: 768

Payload schema:
{
  "source": "string — name of video/transcript/article",
  "source_url": "string — URL if applicable",
  "source_person": "string — whose content (Hormozi/Kallaway/etc)",
  "date_processed": "string — ISO date",
  "content_type": "string — video/transcript/article",
  "category": "string — framework/method/principle/hook/pi/insight/script",
  "skill_file": "string — which skill file this went into",
  "summary": "string — what this piece of knowledge is",
  "tags": "string[] — searchable tags",
  "version": "integer — which skill version this was added in"
}

### performance

Purpose: Post results and content performance data

Payload schema:
{
  "post_id": "string — P[number]",
  "date": "string — ISO date",
  "platform": "string",
  "format": "string — carousel/thread/post/reel/article",
  "mission": "string — authority/awareness/connection/activation/proof",
  "hook_type": "string — which hook framework used",
  "method_used": "string — Hormozi/Kallaway/own",
  "goal_id": "string — G[number]",
  "impressions": "integer",
  "engagements": "integer",
  "saves": "integer",
  "shares": "integer",
  "comments": "integer",
  "dms": "integer",
  "leads": "integer",
  "result_vs_expectation": "string — exceeded/met/missed",
  "notes": "string"
}

### goals

Purpose: Goal history and milestone records

Payload schema:
{
  "goal_id": "string — G[number]",
  "title": "string",
  "type": "string — revenue/audience/content/client/product",
  "timeframe": "string",
  "created": "string — ISO date",
  "target_date": "string — ISO date",
  "metric": "string",
  "target": "string",
  "current": "string",
  "status": "string — active/paused/completed",
  "milestones": "object[] — [{date, milestone, notes}]"
}

### hooks-pi

Purpose: Saved hooks and pattern interrupts

Payload schema:
{
  "hook_id": "string — H[number]",
  "hook_text": "string — the actual hook",
  "type": "string — contrarian/specific-number/open-loop/direct-callout/visual",
  "platform": "string — which platform it performed on",
  "performance": "string — high/medium/low",
  "source": "string — where it was extracted from",
  "tags": "string[] — searchable tags",
  "date_added": "string — ISO date"
}

### methods-log

Purpose: What methods were applied, when, and outcome

Payload schema:
{
  "entry_id": "string — M[number]",
  "method_name": "string",
  "date_applied": "string — ISO date",
  "agent": "string — which agent applied it",
  "context": "string — where/how it was used",
  "source": "string — Hormozi/Kallaway/Expert/custom",
  "input": "string — what was fed into the method",
  "output": "string — what was produced",
  "result": "string — performance or outcome data",
  "verdict": "string — effective/neutral/ineffective",
  "reuse": "boolean"
}

### skills-log

Purpose: Skill creation and update history

Payload schema:
{
  "entry_id": "string — S[number]",
  "skill_name": "string",
  "date": "string — ISO date",
  "action": "string — created/updated/merged/deprecated",
  "version": "integer",
  "changed_by": "string — agent name",
  "reason": "string — why this change was made",
  "files_affected": "string[] — list of file paths",
  "impact": "string — what this changes for the system"
}
