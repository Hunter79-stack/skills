# Bear Blog Publisher

Publish blog posts to Bear Blog - supports AI-generated content, user-provided markdown, and auto-generated diagrams.

## Features

- **Triple Auth Methods**: Config file, environment variables, or runtime parameters
- **AI Content Generation**: Optional auto-generation of blog posts
- **Auto Diagrams**: Generates architecture diagrams for technical posts
- **Secure by Design**: No credential storage, session-only authentication

## Installation

```bash
clawhub install bear-blog-publisher
```

## Authentication (Choose One)

### Method 1: OpenClaw Config File

Edit `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "bear-blog-publisher": {
      "email": "your@email.com",
      "password": "yourpassword"
    }
  }
}
```

Set secure permissions:
```bash
chmod 600 ~/.openclaw/openclaw.json
```

### Method 2: Environment Variables

```bash
export BEAR_BLOG_EMAIL="your@email.com"
export BEAR_BLOG_PASSWORD="yourpassword"
```

### Method 3: Runtime Parameters

```python
from bear_blog_publisher import BearBlogPublisher

publisher = BearBlogPublisher(
    email="your@email.com",
    password="yourpassword"
)
```

## Usage

### AI-Generated Content

```
You: "Publish a blog about remote work tips"
AI: [Generates and publishes]
     ✅ Published: https://bearblog.dev/yourname/remote-work-tips/
```

### User-Provided Content

```
You: "Publish this as a blog: [paste your markdown]"
AI: [Publishes your exact content]
     ✅ Published: https://bearblog.dev/yourname/your-post/
```

## Security

- **No persistent credential storage**
- **Session-only authentication**
- **Config file permission check** (warns if readable by others)
- **Priority**: Runtime > Environment > Config

## Requirements

- Bear Blog account
- Python 3.8+
- Playwright (auto-installed)

## License

MIT
