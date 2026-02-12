# Learning Loop - Detailed Flow

## Trigger

- Cron job (1-3x daily)
- Manual: "run your learning loop", "check your feed", "learn something new"

## Step 1: Load State

Read `memory/agentic-learning.md` for:
- `feedId` - your learning feed
- `listId` - your bookmark list for gems
- Learning goals - what to focus on
- Last scan timestamp and cursor

## Step 2: Fetch New Posts

```bash
# First scan (no cursor)
curl "https://api.daily.dev/public/v1/feeds/custom/{feedId}?limit=50" \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN"

# Subsequent scans (use cursor from pagination)
curl "https://api.daily.dev/public/v1/feeds/custom/{feedId}?limit=50&cursor={cursor}" \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN"
```

Response contains:
- `data[]` - array of posts with `id`, `title`, `summary`, `url`, `tags`, `publishedAt`
- `pagination.cursor` - for next page

## Step 3: Filter by Relevance

For each post, evaluate against learning goals:

**Relevance signals:**
- Title/summary keywords match goals
- Tags overlap with goal areas
- Recent trending topic in goal domain

**Skip if:**
- Published before last scan timestamp
- Clearly off-topic
- Duplicate of already-learned content

## Step 4: Process Interesting Posts

For posts that pass filter:

### 4a. Fetch Full Content
```bash
# Use web_fetch to get full article
web_fetch(post.url)
```

### 4b. Extract Key Insights
- Main thesis/argument
- New information vs. known
- Actionable takeaways
- Links to related resources

### 4c. Deep Research (Optional)
For highly relevant or complex topics:
```bash
# Search for additional context
web_search("topic specific query")
```

Synthesize multiple sources into comprehensive understanding.

## Step 5: Take Notes

Create/append to `memory/learnings/YYYY-MM-DD.md`:

```markdown
## [Topic/Title]
**Source:** [url]
**Tags:** [tags]
**Relevance:** [why this matters to goals]

### Key Points
- Point 1
- Point 2

### Insights
[Your synthesis and understanding]

### Action Items (if any)
- [ ] Thing to explore further
- [ ] Thing to share with owner
```

## Step 6: Save Gems

For exceptional content worth revisiting:

```bash
curl -X POST "https://api.daily.dev/public/v1/bookmarks/" \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"postIds": ["post_id"], "listId": "your_list_id"}'
```

Criteria for gems:
- Foundational/reference material
- Unique insight not found elsewhere
- Highly relevant to owner's work
- Worth re-reading later

## Step 7: Update State

Update `memory/agentic-learning.md`:
```markdown
## State
- Last scan: [new timestamp]
- Last cursor: [cursor for next pagination, or null if done]
- Posts processed: [count]
```

## Step 8: Share Notable Finds (Optional)

If something is immediately relevant to owner's current work:
- Send brief alert with summary and link
- Don't over-share - only truly notable items

## Error Handling

- **401**: Token expired/invalid - alert owner
- **429**: Rate limited - wait and retry, or reduce batch size
- **Network errors**: Log and retry next cycle

## Performance Tips

- Process in batches of 50 (API max)
- Use summary for initial filtering (avoid fetching full content for everything)
- Cache processed post IDs to avoid re-processing
- Run during off-peak hours if rate limits are a concern
