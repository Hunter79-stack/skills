---
name: HyperStack — Typed Graph Memory for AI Agents
description: "Persistent typed knowledge graph memory for AI agents. Ask 'what blocks deploy?' → exact typed answer, not fuzzy similarity. Git-style memory branching: fork, experiment, diff, merge or discard. Agent identity + trust scoring. Time-travel to any past graph state. Provenance on every card: confidence, truthStratum, verifiedBy. Works in Cursor, Claude Desktop, LangGraph, any MCP client. Self-hostable. $0 per operation."
user-invocable: true
homepage: https://cascadeai.dev/hyperstack
metadata:
  openclaw:
    emoji: "🧠"
    requires:
      env:
        - HYPERSTACK_API_KEY
        - HYPERSTACK_WORKSPACE
    primaryEnv: HYPERSTACK_API_KEY
---

# HyperStack — Typed Graph Memory for AI Agents

## What this does

Gives AI agents persistent memory as a typed knowledge graph. Store knowledge as cards with explicit typed relations. Query with exact answers — not fuzzy similarity. Branch memory like Git. Track provenance on every card. Identify agents with trust scores.

**The problem it solves:**
```
# DECISIONS.md (what everyone uses today)
- 2026-02-15: Use Clerk for auth
- 2026-02-16: Migration blocks deploy
"What breaks if auth changes?" → grep → manual → fragile
```

**What you get instead:**
```
"What breaks if auth changes?"  → hs_impact use-clerk        → [auth-api, deploy-prod, billing-v2]
"What blocks deploy?"           → hs_blockers deploy-prod     → [migration-23]
"What's related to stripe?"     → hs_recommend use-stripe     → scored list
"Anything about auth?"          → hs_smart_search             → auto-routed
"Fork memory for experiment"    → hs_fork                     → branch workspace
"What changed in the branch?"   → hs_diff                     → added/changed/deleted
"Trust this agent?"             → hs_profile                  → trustScore: 0.84
```

Typed relations. Exact answers. Zero LLM cost. Works across Cursor, Claude Desktop, LangGraph, any MCP client simultaneously.

---

## Tools (14 total)

### hs_smart_search ✨ Recommended starting point
Agentic RAG — automatically routes to the best retrieval mode. Use this when unsure which tool to call.
```
hs_smart_search({ query: "what depends on the auth system?" })
→ routed to: impact
→ [auth-api] API Service — via: triggers
→ [billing-v2] Billing v2 — via: depends-on

hs_smart_search({ query: "authentication setup" })
→ routed to: search
→ Found 3 memories

# Hint a starting slug for better routing
hs_smart_search({ query: "what breaks if this changes?", slug: "use-clerk" })
```

---

### hs_store
Store or update a card. Supports pinning, TTL scratchpad, trust/provenance, and agent identity stamping.
```
# Basic store
hs_store({
  slug: "use-clerk",
  title: "Use Clerk for auth",
  body: "Better DX, lower cost, native Next.js support",
  type: "decision",
  links: "auth-api:triggers,alice:decided"
})

# With trust/provenance
hs_store({
  slug: "finding-clerk-pricing",
  title: "Clerk pricing confirmed",
  body: "Clerk free tier: 10k MAU. Verified on clerk.com/pricing",
  type: "decision",
  confidence: 0.95,
  truthStratum: "confirmed",
  verifiedBy: "tool:web_search"
})

# Pin — never pruned
hs_store({ slug: "core-arch", title: "Core Architecture", body: "...", pinned: true })

# Scratchpad with TTL — auto-deletes
hs_store({ slug: "scratch-001", title: "Working memory", body: "...",
  type: "scratchpad", ttl: "2026-02-21T10:00:00Z" })
```

**Trust/Provenance fields (all optional):**
| Field | Type | Values | Meaning |
|-------|------|--------|---------|
| `confidence` | float | 0.0–1.0 | Writer's self-reported certainty |
| `truthStratum` | string | `draft` \| `hypothesis` \| `confirmed` | Epistemic status |
| `verifiedBy` | string | any string | Who/what confirmed this |
| `verifiedAt` | datetime | — | Auto-set server-side |
| `sourceAgent` | string | — | Immutable after creation |

**Valid cardTypes:** `general`, `person`, `project`, `decision`, `preference`, `workflow`, `event`, `account`, `signal`, `scratchpad`

---

### hs_search
Hybrid semantic + keyword search across the graph.
```
hs_search({ query: "authentication setup" })
```

---

### hs_decide
Record a decision with full provenance.
```
hs_decide({
  slug: "use-clerk",
  title: "Use Clerk for auth",
  rationale: "Better DX, lower cost vs Auth0",
  affects: "auth-api,user-service",
  blocks: ""
})
```

---

### hs_commit
Commit a successful agent outcome as a permanent decision card, auto-linked via `decided` relation.
```
hs_commit({
  taskSlug: "task-auth-refactor",
  outcome: "Successfully migrated all auth middleware to Clerk. Zero regressions.",
  title: "Auth Refactor Completed",
  keywords: ["clerk", "auth", "completed"]
})
→ { committed: true, slug: "commit-task-auth-refactor-...", relation: "decided" }
```

---

### hs_prune
Remove stale cards not updated in N days that aren't referenced by other cards. Always dry-run first.
```
# Preview — safe, no deletions
hs_prune({ days: 30, dry: true })
→ { dryRun: true, wouldPrune: 3, skipped: 2, cards: [...], protected: [...] }

# Execute
hs_prune({ days: 30 })
→ { pruned: 3, skipped: 2 }
```

**Safety guarantees:** linked cards never pruned · pinned cards never pruned · TTL cards managed separately

---

### hs_blockers
Exact typed blockers for a card.
```
hs_blockers({ slug: "deploy-prod" })
→ "1 blocker: [migration-23] Auth migration to Clerk"
```

---

### hs_graph
Forward graph traversal. Supports time-travel.
```
hs_graph({ from: "auth-api", depth: 2 })
→ nodes: [auth-api, use-clerk, migration-23, alice]

# Time-travel — graph at any past moment
hs_graph({ from: "auth-api", depth: 2, at: "2026-02-15T03:00:00Z" })
```

---

### hs_impact
Reverse traversal — find everything that depends on a card.
```
hs_impact({ slug: "use-clerk" })
→ "Impact of [use-clerk]: 3 cards depend on this
   [auth-api] API Service — via: triggers
   [billing-v2] Billing v2 — via: depends-on
   [deploy-prod] Production Deploy — via: blocks"

# Filter by relation
hs_impact({ slug: "use-clerk", relation: "depends-on" })
```

---

### hs_recommend
Co-citation scoring — find topically related cards without direct links.
```
hs_recommend({ slug: "use-stripe" })
→ "[billing-v2] Billing v2 — score: 4"
```

---

### hs_fork ✨ NEW in v1.1.0
Fork a workspace into a branch for safe experimentation. All cards copied. Parent untouched.
```
hs_fork({ branchName: "experiment-v2" })
→ {
    branchWorkspaceId: "clx...",
    branchName: "experiment-v2",
    cardsCopied: 24,
    forkedAt: "2026-02-20T..."
  }
```

When to use: before risky changes, experiments, or testing new agent reasoning strategies.

---

### hs_diff ✨ NEW in v1.1.0
See exactly what changed between a branch and its parent. SQL-driven — deterministic, not fuzzy.
```
hs_diff({ branchWorkspaceId: "clx..." })
→ {
    added:   [{ slug: "new-approach", title: "..." }],
    changed: [{ slug: "use-clerk", title: "..." }],
    deleted: []
  }
```

---

### hs_merge ✨ NEW in v1.1.0
Merge branch changes back to parent. Two strategies: `ours` (branch wins) or `theirs` (parent wins).
```
# Branch wins — apply all branch changes to parent
hs_merge({ branchWorkspaceId: "clx...", strategy: "ours" })
→ { merged: 24, skipped: 0, strategy: "ours" }

# Parent wins — only copy cards that don't exist in parent
hs_merge({ branchWorkspaceId: "clx...", strategy: "theirs" })
→ { merged: 3, skipped: 21, strategy: "theirs" }
```

---

### hs_discard ✨ NEW in v1.1.0
Discard a branch entirely. Deletes all branch cards and workspace. Parent untouched.
```
hs_discard({ branchWorkspaceId: "clx..." })
→ { deleted: true, branchWorkspaceId: "clx..." }
```

---

### hs_identify ✨ NEW in v1.1.0
Register this agent with a SHA256 fingerprint. Idempotent — safe to call every session.
```
hs_identify({ agentSlug: "research-agent", displayName: "Research Agent" })
→ {
    agentSlug: "research-agent",
    fingerprint: "sha256:a3f...",
    isNew: true
  }
```

When to use: at the start of every agent session for full provenance tracking.

---

### hs_profile ✨ NEW in v1.1.0
Get an agent's trust score. Computed from verified card ratio + activity.
```
hs_profile({ agentSlug: "research-agent" })
→ {
    agentSlug: "research-agent",
    trustScore: 0.84,
    verifiedCards: 42,
    cardCount: 50,
    registeredAt: "...",
    lastActiveAt: "..."
  }
```

**Trust formula:** `(verifiedCards/totalCards) × 0.7 + min(cardCount/100, 1.0) × 0.3`

---

### hs_my_cards
List all cards created by this agent.
```
hs_my_cards()
→ "3 cards by agent researcher: [finding-clerk-pricing] [finding-auth0-limits]"
```

---

### hs_ingest
Auto-extract cards from raw text. Zero LLM cost (regex-based).
```
hs_ingest({ text: "We're using Next.js 14 and PostgreSQL. Alice decided to use Clerk for auth." })
→ "✅ Created 3 cards from 78 chars"
```

---

### hs_inbox
Check for cards directed at this agent by other agents.
```
hs_inbox({})
→ "Inbox for cursor-mcp: 1 card(s)"
```

---

### hs_stats (Pro+)
Token savings and memory usage stats.
```
hs_stats()
→ "Cards: 24 | Tokens stored: 246 | Saving: 94% — $2.07/mo"
```

---

## Git-Style Memory Branching

Branch your memory workspace like a Git repo. Experiment safely without corrupting live memory.

```
# 1. Fork before an experiment
hs_fork({ branchName: "try-new-routing" })

# 2. Make changes in the branch (all hs_store calls go to branch)
hs_store({ slug: "new-approach", title: "...", ... })

# 3. See what changed
hs_diff({ branchWorkspaceId: "clx..." })

# 4a. Merge if it worked
hs_merge({ branchWorkspaceId: "clx...", strategy: "ours" })

# 4b. Or discard if it didn't
hs_discard({ branchWorkspaceId: "clx..." })
```

**Branching requires Pro plan or above.**

---

## Agent Identity + Trust

Register agents for full provenance tracking and trust scoring.

```
# Register at session start
hs_identify({ agentSlug: "research-agent" })

# All subsequent hs_store calls auto-stamp agentIdentityId
hs_store({ slug: "finding-001", ... })  # → auto-linked to research-agent

# Check trust score
hs_profile({ agentSlug: "research-agent" })
→ trustScore: 0.84
```

**Recommended:** Set `HYPERSTACK_AGENT_SLUG` env var for zero-config auto-identification.

---

## The Eight Graph Modes

| Mode | Tool | Question answered |
|------|------|-------------------|
| Smart | `hs_smart_search` | Ask anything — auto-routes |
| Forward | `hs_graph` | What does this card connect to? |
| Impact | `hs_impact` | What depends on this? What breaks? |
| Recommend | `hs_recommend` | What's topically related? |
| Time-travel | `hs_graph` with `at=` | What did the graph look like then? |
| Prune | `hs_prune` | What stale memory is safe to remove? |
| Branch diff | `hs_diff` | What changed in this branch? |
| Trust | `hs_profile` | How trustworthy is this agent? |

---

## Trust & Provenance

Every card carries epistemic metadata.

```
# Researcher stores a finding with low confidence
hs_store({ slug: "finding-latency", body: "p99 latency ~200ms under load",
  confidence: 0.6, truthStratum: "hypothesis" })

# After human verification
hs_store({ slug: "finding-latency", confidence: 0.95,
  truthStratum: "confirmed", verifiedBy: "human:deeq" })
# → verifiedAt auto-set server-side
```

**Key rules:**
- `confidence` is self-reported — display only, never use as hard guardrail
- `confirmed` = trusted working truth for this workspace, not objective truth
- `sourceAgent` is immutable — set on creation, never changes
- `verifiedAt` is server-set — not writable by clients

---

## Full Memory Lifecycle

| Memory type | Tool | Behaviour |
|-------------|------|-----------|
| Long-term facts | `hs_store` | Permanent, searchable, graph-linked |
| Working memory | `hs_store` with `ttl=` + `type=scratchpad` | Auto-deletes after TTL |
| Outcomes / learning | `hs_commit` | Commits what worked as decided card |
| Stale cleanup | `hs_prune` | Removes unused cards, preserves graph integrity |
| Protected facts | `hs_store` with `pinned=true` | Never pruned |
| Branch experiment | `hs_fork` → `hs_diff` → `hs_merge` / `hs_discard` | Safe experimentation |

---

## Multi-Agent Setup

Each agent gets its own ID. Cards auto-tagged for full traceability.

Recommended roles:
- **coordinator** — `hs_blockers`, `hs_impact`, `hs_graph`, `hs_decide`, `hs_fork`, `hs_merge`
- **researcher** — `hs_search`, `hs_recommend`, `hs_store`, `hs_ingest`, `hs_identify`
- **builder** — `hs_store`, `hs_decide`, `hs_commit`, `hs_blockers`, `hs_fork`
- **memory-agent** — `hs_prune`, `hs_stats`, `hs_smart_search`, `hs_diff`, `hs_discard`

---

## When to use each tool

| Moment | Tool |
|--------|------|
| Start of session | `hs_identify` → `hs_search` + `hs_recommend` |
| Not sure which mode | `hs_smart_search` — auto-routes |
| New project / onboarding | `hs_ingest` to auto-populate |
| Decision made | `hs_decide` with rationale and links |
| Task completed | `hs_commit` — commit outcome |
| Task blocked | `hs_store` with `blocks` relation |
| Before starting work | `hs_blockers` to check dependencies |
| Before changing a card | `hs_impact` to check blast radius |
| Before risky experiment | `hs_fork` → work in branch → `hs_merge` or `hs_discard` |
| Discovery | `hs_recommend` — find related context |
| Working memory | `hs_store` with `ttl=` + `type=scratchpad` |
| Periodic cleanup | `hs_prune dry=true` → inspect → execute |
| Debug a bad decision | `hs_graph` with `at` timestamp |
| Cross-agent signal | `hs_store` with `targetAgent` → `hs_inbox` |
| Check efficiency | `hs_stats` |
| Check agent trust | `hs_profile` |

---

## Setup

### MCP (Claude Desktop / Cursor / VS Code / Windsurf)
```json
{
  "mcpServers": {
    "hyperstack": {
      "command": "npx",
      "args": ["-y", "hyperstack-mcp"],
      "env": {
        "HYPERSTACK_API_KEY": "hs_your_key",
        "HYPERSTACK_WORKSPACE": "my-project",
        "HYPERSTACK_AGENT_SLUG": "cursor-agent"
      }
    }
  }
}
```

### Python SDK
```bash
pip install hyperstack-py
```
```python
from hyperstack import HyperStack
hs = HyperStack(api_key="hs_...", workspace="my-project")
hs.identify(agent_slug="my-agent")
branch = hs.fork(branch_name="experiment")
hs.diff(branch_workspace_id=branch["branchWorkspaceId"])
hs.merge(branch_workspace_id=branch["branchWorkspaceId"], strategy="ours")
```

### LangGraph
```bash
pip install hyperstack-langgraph
```
```python
from hyperstack_langgraph import HyperStackMemory
memory = HyperStackMemory(api_key="hs_...", workspace="my-project")
```

### Self-Hosted
```bash
# With OpenAI embeddings (semantic search)
docker run -d -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  -e OPENAI_API_KEY=sk-... \
  ghcr.io/deeqyaqub1-cmd/hyperstack:latest

# Fully local — Ollama embeddings (no OpenAI needed)
docker run -d -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  -e EMBEDDING_BASE_URL=http://host.docker.internal:11434 \
  -e EMBEDDING_MODEL=nomic-embed-text \
  ghcr.io/deeqyaqub1-cmd/hyperstack:latest

# Keyword search only (no embeddings)
docker run -d -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  ghcr.io/deeqyaqub1-cmd/hyperstack:latest
```
Then set `HYPERSTACK_BASE_URL=http://localhost:3000` in your SDK config.

**Embedding env vars (all optional):**
| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | Enables OpenAI embeddings |
| `EMBEDDING_BASE_URL` | `https://api.openai.com` | Custom endpoint (e.g. Ollama) |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | Model name |
| `EMBEDDING_API_KEY` | falls back to `OPENAI_API_KEY` | Key for custom endpoint |

Full guide: https://github.com/deeqyaqub1-cmd/hyperstack-core/blob/main/SELF_HOSTING.md

---

## Data safety

NEVER store passwords, API keys, tokens, PII, or credentials in cards. Cards should be safe in a data breach. Always confirm with user before storing sensitive information.

---

## Pricing

| Plan | Price | Cards | Features |
|------|-------|-------|---------|
| Free | $0 | 10 | Search only |
| Pro | $29/mo | 100 | All 8 modes + branching + agent identity |
| Team | $59/mo | 500 | All modes + webhooks + agent tokens |
| Business | $149/mo | 2,000 | All modes + SSO + 20 members |
| Self-hosted | $0 | Unlimited | Full feature parity |

Get your free API key: https://cascadeai.dev/hyperstack

---

## Changelog

### v1.1.0 (Feb 20, 2026)

#### ✨ Git-Style Memory Branching — 4 new tools
- `hs_fork` — fork a workspace into a branch, all cards copied, parent untouched
- `hs_diff` — SQL-driven diff between branch and parent (added/changed/deleted)
- `hs_merge` — merge branch back to parent (`ours` or `theirs` strategy)
- `hs_discard` — delete branch entirely, parent untouched
- Branching requires Pro plan or above
- Fork batches in groups of 25 to stay under serverless limits
- Diff uses SQL EXCEPT queries — deterministic, pushed to Postgres not JS

#### ✨ Agent Identity + Trust Scoring — 2 new tools
- `hs_identify` — register agent with SHA256 fingerprint (idempotent)
- `hs_profile` — compute trustScore on read: `(verifiedCards/total)×0.7 + min(cardCount/100,1.0)×0.3`
- `HYPERSTACK_AGENT_SLUG` env var for zero-config auto-identification
- All `hs_store` calls after `hs_identify` auto-stamp `agentIdentityId`

#### ✨ Self-Hosting via Docker
- Docker image: `ghcr.io/deeqyaqub1-cmd/hyperstack:latest`
- `HYPERSTACK_BASE_URL` env var in all SDKs — point at own Postgres
- Full self-hosting guide: https://github.com/deeqyaqub1-cmd/hyperstack-core/blob/main/SELF_HOSTING.md

#### 📦 SDK Updates
- `hyperstack-mcp` → v1.9.0 (14 tools, was 9)
- `hyperstack-py` → v1.4.0 (fork/diff/merge/discard/identify/profile)
- `hyperstack-langgraph` → v1.4.0 (same methods as hyperstack-py)

### v1.0.20 (Feb 20, 2026)
- Trust/Provenance fields on every card: `confidence`, `truthStratum`, `verifiedBy`, `verifiedAt`, `sourceAgent`
- Security: `hs_webhook` and `hs_agent_tokens` removed from skill scope (admin-only)
- Backend reliability fixes: prune CTE rewrite, Zod validation, UsageLog lazy purge
- Skill renamed to "HyperStack — Typed Graph Memory for AI Agents"

### v1.0.19 (Feb 20, 2026)
- `hs_prune` — memory pruning with dry-run safety
- `hs_commit` — feedback-driven memory, agent learning
- `pinned` field — protect cards from pruning permanently
- `scratchpad` cardType + TTL lazy expiry

### v1.0.18 (Feb 20, 2026)
- `hs_smart_search` — agentic RAG routing

### v1.0.16 (Feb 19, 2026)
- `hs_impact` — reverse graph traversal
- `hs_recommend` — co-citation scoring

### v1.0.13–v1.0.15
- Core foundation: `hs_search`, `hs_store`, `hs_decide`, `hs_blockers`, `hs_graph`, `hs_my_cards`, `hs_ingest`, `hs_inbox`, `hs_stats`
