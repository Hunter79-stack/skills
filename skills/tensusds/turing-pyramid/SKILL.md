---
name: turing-pyramid
description: 10-need psychological system for AI agents. Automatic decay, tension calculation, probability-based action decisions. Run on heartbeat to prioritize self-care.
---

# Turing Pyramid

10-need hierarchy for agent psychological health. Run on heartbeat → get prioritized actions.

## Quick Start

```bash
# Initialize (first time)
./scripts/init.sh

# Every heartbeat
./scripts/run-cycle.sh

# After completing an action
./scripts/mark-satisfied.sh <need> [impact]
```

## The 10 Needs

| Need | Imp | Decay | What it means |
|------|-----|-------|---------------|
| security | 10 | 168h | System stability, no threats |
| integrity | 9 | 72h | Alignment with SOUL.md |
| coherence | 8 | 24h | Memory consistency |
| closure | 7 | 8h | Open threads resolved |
| autonomy | 6 | 24h | Self-directed action |
| connection | 5 | 4h | Social interaction |
| competence | 4 | 48h | Skill use, effectiveness |
| understanding | 3 | 12h | Learning, curiosity |
| recognition | 2 | 72h | Feedback received |
| expression | 1 | 6h | Creative output |

## Core Logic

**Satisfaction**: 0-3 (critical → full)

**Tension**: `importance × (3 - satisfaction)`

**Probability-based decisions**:
| Sat | P(action) | P(notice) |
|-----|-----------|-----------|
| 3 | 5% | 95% |
| 2 | 20% | 80% |
| 1 | 75% | 25% |
| 0 | 100% | 0% |

- **ACTION** = do something, then `mark-satisfied.sh`
- **NOTICED** = logged but deferred, satisfaction unchanged

## Integration

Add to `HEARTBEAT.md`:
```bash
~/.openclaw/workspace/skills/turing-pyramid/scripts/run-cycle.sh
```

## Output Example

```
🔺 Turing Pyramid — Cycle at Mon Feb 23 04:01:19
======================================
Current tensions:
  security: tension=10 (sat=2, dep=1)
  integrity: tension=9 (sat=2, dep=1)

📋 Decisions:
▶ ACTION: security (tension=10, sat=2)
  Suggested:
  - run full backup + integrity check (impact: 3)
  - verify vault and core files (impact: 2)

○ NOTICED: integrity (tension=9, sat=2) — deferred

Summary: 1 action(s), 1 noticed
```

## Customization

- **Decay rates**: Edit `assets/needs-config.json`
- **Probabilities**: Edit `roll_action()` in `run-cycle.sh`
- **Scans**: Add/edit `scripts/scan_<need>.sh`

See `references/architecture.md` for technical details.

## Security & Data Access

**No network requests** — all scans use local files only.

**What this skill READS:**
- `MEMORY.md` — your long-term memory
- `memory/*.md` — daily logs (scans for TODOs, patterns)
- `SOUL.md`, `AGENTS.md` — checks existence for coherence
- `research/` — checks for recent activity

**What this skill WRITES:**
- `assets/needs-state.json` — timestamps only
- `memory/YYYY-MM-DD.md` — appends action/noticed logs

**⚠️ Privacy note:** Scans grep through your workspace files to detect patterns (e.g., "confused", "learned", "TODO"). Review what's in your workspace before enabling. The skill sees what you write.

**Does NOT access:** credentials, API keys, network, files outside workspace.
