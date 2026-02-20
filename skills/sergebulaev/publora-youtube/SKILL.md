---
name: publora-youtube
description: >
  Post or schedule video content to YouTube using the Publora API. Use this skill
  when the user wants to publish or schedule YouTube videos via Publora.
---

# Publora — YouTube

Post and schedule YouTube video content via the Publora API.

> **Prerequisite:** Install the `publora` core skill for auth setup and getting platform IDs.

## Get Your YouTube Platform ID

```bash
GET https://api.publora.com/api/v1/platform-connections
# Look for entries like "youtube-012"
```

## Upload and Schedule a YouTube Video

```python
import requests

HEADERS = { 'Content-Type': 'application/json', 'x-publora-key': 'sk_YOUR_KEY' }

# Step 1: Create post
post = requests.post('https://api.publora.com/api/v1/create-post', headers=HEADERS, json={
    'content': 'How We Built a SaaS in 30 Days — Full Breakdown',
    'platforms': ['youtube-012'],
    'scheduledTime': '2026-03-16T16:00:00.000Z'
}).json()

# Step 2: Get upload URL
upload = requests.post('https://api.publora.com/api/v1/get-upload-url', headers=HEADERS, json={
    'fileName': 'saas-breakdown.mp4', 'contentType': 'video/mp4',
    'type': 'video', 'postGroupId': post['postGroupId']
}).json()

# Step 3: Upload video (max 512MB)
with open('saas-breakdown.mp4', 'rb') as f:
    requests.put(upload['uploadUrl'], headers={'Content-Type': 'video/mp4'}, data=f)

print(f"Video scheduled: {post['postGroupId']}")
```

## Post YouTube Short

Same flow as regular video — just ensure video is vertical (9:16) and under 60 seconds:

```javascript
body: JSON.stringify({
  content: 'One tip that 10x\'d our productivity #shorts #productivity',
  platforms: ['youtube-012'],
  scheduledTime: '2026-03-16T12:00:00.000Z'
})
```

## Tips for YouTube

- **Content field** = video title/description — make it SEO-optimized
- **Video required** — YouTube posts without video will fail
- **Max size:** 512 MB
- **Best upload times:** Thursday–Saturday, 2–4 PM (audience timezone)
- **Shorts:** Under 60 seconds, vertical 9:16 — YouTube auto-detects and promotes as Shorts
- **Thumbnails:** Can't set via API — set in YouTube Studio after publishing
- **Description SEO:** First 2–3 sentences appear in search; include keywords
