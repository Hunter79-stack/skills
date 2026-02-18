# SurrealDB Knowledge Graph Memory v2.0

A knowledge graph memory system using SurrealDB with vectorized semantic search, confidence scoring, graph-aware fact relationships, **episodic memory**, **working memory**, and **outcome-based learning**.

## Description

Use this skill for:
- Storing and retrieving knowledge as interconnected facts
- Semantic memory search with confidence-weighted results  
- Managing fact relationships (supports, contradicts, updates)
- LLM-powered knowledge extraction from memory files
- AI-driven relationship discovery between facts
- **NEW v2:** Episodic memory for task histories and learnings
- **NEW v2:** Working memory for crash-resilient task tracking
- **NEW v2:** Outcome-based confidence calibration (facts that help succeed gain confidence)
- **NEW v2:** Context-aware retrieval (task-boosted search)
- **NEW v2:** Synchronous writes for important facts

**Triggers:** "remember this", "store fact", "what do you know about", "memory search", "similar tasks", "past episodes", "working memory", "knowledge graph"

## ⚠️ Security & Installation Notes

This skill performs system-level operations. Review before installing:

| Behavior | Location | Description |
|----------|----------|-------------|
| **Network installer** | `install.sh` | Runs `curl https://install.surrealdb.com \| sh` |
| **Source patching** | `integrate-clawdbot.sh` | Uses `sed -i` to patch Clawdbot source files |
| **Service management** | `memory.ts` | Can start SurrealDB server, run schema imports |
| **Python packages** | `install.sh` | Installs surrealdb, openai, pyyaml via pip |
| **File access** | `extract-knowledge.py` | Reads `MEMORY.md` and `memory/*.md` for extraction |

**Default credentials:** Examples use `root/root` — change for production and bind to localhost only.

**API key:** `OPENAI_API_KEY` is required for embeddings (text-embedding-3-small) and LLM extraction (GPT-4o-mini).

## v2.0 Features

### 1. Episodic Memory
Learn from past task attempts:

```bash
# Find similar past tasks
mcporter call surrealdb-memory.episode_search query="deploy API" limit:5

# Get actionable learnings
mcporter call surrealdb-memory.episode_learnings task_goal="Build REST API"
# Returns: ["Always validate OAuth tokens first", "⚠️ Past failure: Token expired mid-deploy"]
```

### 2. Working Memory
Track current task state that survives crashes:

```bash
# Check active task status
mcporter call surrealdb-memory.working_memory_status
```

Working memory is managed via Python:
```python
from working_memory import WorkingMemory

wm = WorkingMemory()
wm.start_task("Deploy marketing pipeline", plan=[...])
wm.update_step(1, status="complete", result_summary="Audited 12 templates")
episode = wm.complete_task(outcome="success")
```

### 3. Synchronous Writes
Important facts get stored immediately (not batched):

```bash
mcporter call surrealdb-memory.knowledge_store_sync \
    content="Client X uses OAuth2 not API keys" \
    importance:0.85
```

### 4. Context-Aware Search
Search with awareness of current task:

```bash
mcporter call surrealdb-memory.context_aware_search \
    query="API authentication" \
    task_context="Deploy marketing automation for ClientX"
```

### 5. Outcome Calibration
Facts that lead to success gain confidence; facts that correlate with failure lose confidence. This is automatic based on episode outcomes.

## MCP Tools (v2)

| Tool | Description |
|------|-------------|
| `knowledge_search` | Semantic search for facts by query |
| `knowledge_recall` | Recall a fact with full context (relations, entities) |
| `knowledge_store` | Store a new fact with confidence and tags |
| `knowledge_stats` | Get knowledge graph statistics (now includes episodes) |
| `knowledge_store_sync` | **v2** Importance-based routing (>0.7 = immediate write) |
| `episode_search` | **v2** Find similar past tasks/episodes |
| `episode_learnings` | **v2** Get actionable insights from history |
| `episode_store` | **v2** Store completed task episode |
| `working_memory_status` | **v2** Get current task progress |
| `context_aware_search` | **v2** Task-context boosted retrieval |

## Prerequisites

1. **SurrealDB** installed and running:
   ```bash
   # Install (one-time)
   ./scripts/install.sh
   
   # Start server
   surreal start --bind 127.0.0.1:8000 --user root --pass root file:~/.clawdbot/memory/knowledge.db
   ```

2. **Python dependencies** (use the skill's venv):
   ```bash
   cd /path/to/surrealdb-memory
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r scripts/requirements.txt
   ```

3. **OpenAI API key** for embeddings and extraction:
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

## Quick Start

```bash
# Initialize the database schema (includes v2 tables)
./scripts/init-db.sh

# OR apply v2 schema to existing database
python3 scripts/migrate-v2.py

# Run initial knowledge extraction
source .venv/bin/activate
python3 scripts/extract-knowledge.py extract --full

# Check status
mcporter call surrealdb-memory.knowledge_stats
```

## MCP Server Configuration

Add to your mcporter config:
```json
{
  "surrealdb-memory": {
    "command": "/path/to/.venv/bin/python3 /path/to/scripts/mcp-server-v2.py"
  }
}
```

## CLI Commands

### knowledge-tool.py (simple CLI)

```bash
python3 scripts/knowledge-tool.py search "query" --limit 10
python3 scripts/knowledge-tool.py recall "query"
python3 scripts/knowledge-tool.py store "Fact content" --confidence 0.9
python3 scripts/knowledge-tool.py stats
```

### extract-knowledge.py

| Command | Description |
|---------|-------------|
| `extract` | Extract from changed files only |
| `extract --full` | Full extraction (all files) |
| `status` | Show extraction status and stats |
| `reconcile` | Deep reconciliation (prune, decay, clean orphans) |
| `discover-relations` | AI finds relationships between facts |
| `dedupe` | Find and remove duplicate facts |

### migrate-v2.py

```bash
# Apply v2 schema (safe to run multiple times)
python3 scripts/migrate-v2.py

# Force recreate v2 tables
python3 scripts/migrate-v2.py --force
```

## Architecture (v2)

```
Tier 1: Context Window (conversation)
    ↕ (continuous read/write during loop iterations)
Tier 1.5: Working Memory (~/.working-memory/current-task.yaml)  ← NEW
    ↕ (persisted every N iterations)
Tier 2: File-Based Memory (daily logs, MEMORY.md)
    ↕ (cron extraction + sync writes for important facts)
Tier 3: Knowledge Graph (facts, entities, relations, episodes)  ← ENHANCED
```

## Confidence Scoring

Each fact has an **effective confidence** calculated from:
- Base confidence (0.0–1.0)
- **+ Inherited boost**: from high-confidence supporting facts
- **+ Entity boost**: from well-established entities mentioned
- **+ Outcome adjustment**: success/failure history from episodes *(v2)*
- **- Contradiction drain**: from high-confidence contradicting facts
- **- Time decay**: 5% per month of staleness

## Control UI Integration

The skill includes a **Memory** tab for the Clawdbot Dashboard:

**Features:**
- View statistics (facts, entities, relations, episodes)
- Health status monitoring
- One-click auto-repair
- Run maintenance operations
- View extraction progress

## Files

```
surrealdb-memory/
├── SKILL.md                      # This file
├── INSTRUCTIONS.md               # Setup and usage guide
├── UPGRADE-V2.md                 # V2 upgrade guide
├── CHANGELOG.md                  # Version history
├── package.json                  # Skill metadata
├── scripts/
│   ├── mcp-server-v2.py          # MCP server with 10 tools (v2)
│   ├── mcp-server.py             # Legacy MCP server (v1)
│   ├── working_memory.py         # Working memory module (v2)
│   ├── episodes.py               # Episodic memory module (v2)
│   ├── migrate-v2.py             # V2 schema migration
│   ├── schema-v2.sql             # V2 database schema
│   ├── schema-v2-additive.sql    # Additive v2 schema
│   ├── knowledge-tool.py         # Simple CLI wrapper
│   ├── extract-knowledge.py      # LLM extraction from memory files
│   ├── memory-cli.py             # Full CLI for CRUD operations
│   ├── schema.sql                # Original schema
│   ├── init-db.sh                # Initialize database
│   ├── install.sh                # Install SurrealDB binary
│   └── requirements.txt          # Python dependencies
├── clawdbot-integration/
│   ├── gateway/
│   │   └── memory.ts             # Gateway RPC handlers
│   └── ui/
│       ├── memory-view.ts        # Memory tab view (Lit)
│       └── memory-controller.ts  # Memory tab controller
└── references/
    ├── surql-examples.md         # SurrealQL query patterns
    └── conflict-patterns.md      # Contradiction detection rules
```

## Troubleshooting

**"Connection refused"** — Start SurrealDB:
```bash
surreal start --user root --pass root file:~/.clawdbot/memory/knowledge.db
```

**"surrealdb package not installed"** — Install Python deps:
```bash
source .venv/bin/activate
pip install -r scripts/requirements.txt
```

**"Episode table not found"** — Run v2 migration:
```bash
python3 scripts/migrate-v2.py
```

**"OPENAI_API_KEY not set"** — Export the key:
```bash
export OPENAI_API_KEY="sk-..."
```

## Version History

- **v2.0.0** (2026-02-17): Episodes, working memory, outcome calibration, context-aware search
- **v1.2.0** (2026-02-09): Added MCP server with 4 tools
- **v1.1.0** (2026-02-09): Gateway integration, relation discovery, control UI
- **v1.0.0** (2026-01-31): Initial release with extraction and CLI
