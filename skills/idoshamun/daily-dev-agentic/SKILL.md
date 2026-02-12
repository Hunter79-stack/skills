---
name: daily-dev-agentic
description: daily.dev Agentic Learning - continuous self-improvement through daily.dev feeds. Use when setting up agent learning, running learning loops, sharing insights with owner, or managing the agent's knowledge base. Triggers on requests about agent learning, knowledge building, staying current, or "what have you learned".
---

# daily.dev Agentic Learning

Continuous self-improvement for AI agents through daily.dev content feeds.

## Overview

This skill enables agents to:
1. Maintain a personalized learning feed on daily.dev
2. Periodically scan and learn from new content
3. Build a knowledge base with valuable discoveries
4. Share insights with their owner

## Prerequisites

- daily.dev Plus subscription (for API access)
- API token stored in `DAILY_DEV_TOKEN` env var
- Agent identity configured (IDENTITY.md with name/emoji)

## Setup Flow (One-Time)

Run setup when: user asks to set up learning, agent has no existing feed config, or owner wants to change learning goals.

### 1. Ask About Learning Goals

Ask the owner what topics/areas they want you to learn about. Example:
> "What topics would you like me to stay current on? I'll create a personalized feed and continuously learn from it."

### 2. Create Learning Feed

```bash
# Create feed with chronological ordering
curl -X POST "https://api.daily.dev/public/v1/feeds/custom/" \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "[EMOJI] [AGENT_NAME]'\''s Learning Feed",
    "icon": "[EMOJI]",
    "orderBy": "DATE",
    "disableEngagementFilter": true
  }'
```

Use agent's emoji and name from IDENTITY.md. Save returned `feedId`.

### 3. Create Knowledge Base Bookmark List

```bash
curl -X POST "https://api.daily.dev/public/v1/bookmarks/lists" \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "[EMOJI] [AGENT_NAME]'\''s Knowledge Base",
    "icon": "[EMOJI]"
  }'
```

Save returned list `id`.

### 4. Store Configuration

Save to `memory/agentic-learning.md`:

```markdown
# Agentic Learning Config

## Feed
- ID: [feedId]
- Created: [date]

## Bookmark List
- ID: [listId]

## Learning Goals
[User's stated goals]

## State
- Last scan: [timestamp]
- Last cursor: [cursor or null]
```

### 5. Set Up Cron

Create a cron job to run the learning loop 1-3x daily:
```
Schedule: "0 9,17 * * *" (9am and 5pm UTC)
Text: "Run your daily.dev learning loop - scan your feed and learn"
```

## Learning Loop (Cron)

Triggered by cron or manual request. See [references/learning-loop.md](references/learning-loop.md) for detailed flow.

**Quick summary:**
1. Load config from `memory/agentic-learning.md`
2. Fetch feed posts since last scan
3. Scan summaries, filter by relevance to goals
4. For interesting posts: fetch full content via `web_fetch`
5. For highly relevant: research deeper with `web_search`
6. Take notes in `memory/learnings/[date].md`
7. Save gems to bookmark list
8. Update last scan timestamp

## Sharing Insights

### Weekly Digest (Cron)
Schedule weekly: summarize top learnings, trends spotted, gems saved.

### Threshold-Based (During Learning Loop)
When discovering something highly relevant to owner's work, share immediately:
> "🗿 Found something you should see: [brief summary + link]"

### On-Demand
When owner asks "what have you learned" or similar:
1. Read recent entries from `memory/learnings/`
2. Summarize key insights, trends, and notable discoveries
3. Link to saved bookmarks if relevant

## Memory Structure

```
memory/
├── agentic-learning.md      # Config and state
└── learnings/
    ├── 2024-01-15.md        # Daily learning notes
    ├── 2024-01-16.md
    └── ...
```

See [references/memory-format.md](references/memory-format.md) for note structure.

## API Quick Reference

All endpoints use `https://api.daily.dev/public/v1` with `Authorization: Bearer $DAILY_DEV_TOKEN`.

| Action | Method | Endpoint |
|--------|--------|----------|
| List all tags | GET | `/tags/` |
| Create feed | POST | `/feeds/custom/` |
| Get feed posts | GET | `/feeds/custom/{feedId}?limit=50` |
| Create bookmark list | POST | `/bookmarks/lists` |
| Add bookmarks | POST | `/bookmarks/` with `{postIds, listId}` |
| Get post details | GET | `/posts/{id}` |

Rate limit: 60 req/min. Check `X-RateLimit-Remaining` header.
