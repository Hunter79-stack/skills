---
name: publora
description: >
  Publora API — schedule and publish social media posts across 10 platforms
  (X/Twitter, LinkedIn, Instagram, Threads, TikTok, YouTube, Facebook, Bluesky,
  Mastodon, Telegram). Use this skill when the user wants to post, schedule,
  draft, or bulk-schedule content on any social platform via Publora.
---

# Publora API — Core Skill

Publora is an affordable REST API for scheduling and publishing social media posts
across 10 platforms. Base URL: `https://api.publora.com/api/v1`

## Authentication

All requests require the `x-publora-key` header. Keys start with `sk_`.

```bash
curl https://api.publora.com/api/v1/platform-connections \
  -H "x-publora-key: sk_YOUR_KEY"
```

Get your key: [publora.com](https://publora.com) → Settings → API Keys → Generate API Key.
⚠️ Copy immediately — shown only once.

## Step 0: Get Platform IDs

**Always call this first** to get valid platform IDs before posting.

```bash
GET /api/v1/platform-connections
```

```javascript
const res = await fetch('https://api.publora.com/api/v1/platform-connections', {
  headers: { 'x-publora-key': 'sk_YOUR_KEY' }
});
const { connections } = await res.json();
// connections[i].id → use this as platform ID (e.g. "linkedin-ABC123")
```

Platform IDs look like: `twitter-123`, `linkedin-ABC`, `instagram-456`, `threads-789`, etc.

## Post Immediately

Omit `scheduledTime` to publish right away:

```javascript
await fetch('https://api.publora.com/api/v1/create-post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-publora-key': 'sk_YOUR_KEY' },
  body: JSON.stringify({
    content: 'Your post content here',
    platforms: ['twitter-123', 'linkedin-ABC']
  })
});
```

## Schedule a Post

Include `scheduledTime` in ISO 8601 UTC — must be at least 2 minutes in the future:

```javascript
await fetch('https://api.publora.com/api/v1/create-post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-publora-key': 'sk_YOUR_KEY' },
  body: JSON.stringify({
    content: 'Scheduled post content',
    platforms: ['twitter-123', 'linkedin-ABC'],
    scheduledTime: '2026-03-16T10:00:00.000Z'
  })
});
// Response: { postGroupId: "pg_abc123", scheduledTime: "..." }
```

## Save as Draft

Omit `scheduledTime` — post is created as draft. Schedule it later:

```javascript
// Create draft
const { postGroupId } = await createPost({ content, platforms });

// Schedule later
await fetch(`https://api.publora.com/api/v1/update-post/${postGroupId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'x-publora-key': 'sk_YOUR_KEY' },
  body: JSON.stringify({ status: 'scheduled', scheduledTime: '2026-03-16T10:00:00.000Z' })
});
```

## Bulk Schedule (a Week of Content)

```python
from datetime import datetime, timedelta, timezone
import requests

HEADERS = { 'Content-Type': 'application/json', 'x-publora-key': 'sk_YOUR_KEY' }
base_date = datetime(2026, 3, 16, 10, 0, 0, tzinfo=timezone.utc)

posts = ['Monday post', 'Tuesday post', 'Wednesday post', 'Thursday post', 'Friday post']

for i, content in enumerate(posts):
    scheduled_time = base_date + timedelta(days=i)
    requests.post('https://api.publora.com/api/v1/create-post', headers=HEADERS, json={
        'content': content,
        'platforms': ['twitter-123', 'linkedin-ABC'],
        'scheduledTime': scheduled_time.isoformat()
    })
```

## Media Upload (Images & Videos)

3-step process: create post → get upload URL → upload to S3.

```python
import requests

HEADERS = { 'Content-Type': 'application/json', 'x-publora-key': 'sk_YOUR_KEY' }

# Step 1: Create post
post = requests.post('https://api.publora.com/api/v1/create-post', headers=HEADERS, json={
    'content': 'Check this out!',
    'platforms': ['instagram-456'],
    'scheduledTime': '2026-03-15T14:30:00.000Z'
}).json()
post_group_id = post['postGroupId']

# Step 2: Get pre-signed upload URL
upload = requests.post('https://api.publora.com/api/v1/get-upload-url', headers=HEADERS, json={
    'fileName': 'photo.jpg',
    'contentType': 'image/jpeg',
    'type': 'image',  # or 'video'
    'postGroupId': post_group_id
}).json()

# Step 3: Upload directly to S3 (no auth header needed)
with open('./photo.jpg', 'rb') as f:
    requests.put(upload['uploadUrl'], headers={'Content-Type': 'image/jpeg'}, data=f)
```

Max video size: **512 MB**.

## Platform-Specific Skills

For platform-specific settings and examples, install the relevant skill:
- `publora-linkedin` — LinkedIn posts
- `publora-twitter` — X/Twitter posts & threads
- `publora-instagram` — Instagram images/reels
- `publora-threads` — Threads posts
- `publora-tiktok` — TikTok videos
- `publora-youtube` — YouTube videos
- `publora-facebook` — Facebook posts
- `publora-bluesky` — Bluesky posts
- `publora-mastodon` — Mastodon posts
- `publora-telegram` — Telegram channels

## Errors

| Code | Meaning |
|------|---------|
| 400 | Invalid request (check `scheduledTime` format, required fields) |
| 401 | Invalid or missing API key |
| 403 | Free plan limit reached (5 pending posts max) |
| 404 | Post/resource not found |
