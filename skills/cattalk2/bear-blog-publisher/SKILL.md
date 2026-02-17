---
name: bear-blog-publisher
description: Publish blog posts to Bear Blog platform. Supports AI-generated content, user-provided markdown, and auto-generated diagrams.
---

# Bear Blog Publisher

Publish blog posts to Bear Blog (https://bearblog.dev/).

## Overview

This skill provides automated publishing capabilities for Bear Blog.

## Authentication Methods (Choose One)

### Method 1: OpenClaw Config (Recommended for Personal Use)

Add to your `~/.openclaw/openclaw.json`:

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

**Security**: File permissions should be set to 600 (readable only by owner).

### Method 2: Environment Variables (Recommended for CI/CD)

```bash
export BEAR_BLOG_EMAIL="your@email.com"
export BEAR_BLOG_PASSWORD="yourpassword"
```

**Security**: Credentials exist only in memory, not written to disk.

### Method 3: Runtime Parameters (Recommended for Multi-User)

Provide credentials when calling the skill:

```python
publisher = BearBlogPublisher(email="user@example.com", password="secret")
```

**Security**: Caller (chat bot, web app, etc.) manages credential lifecycle.

## Priority Order

1. Runtime parameters (highest priority)
2. Environment variables
3. OpenClaw config (lowest priority)

## Capabilities

### 1. Publish Blog Post

**Input:**
- `title` (string): Blog post title
- `content` (string): Markdown content
- `email` (string, optional): Bear Blog email
- `password` (string, optional): Bear Blog password

**Output:**
- Published URL or error message

### 2. Generate Content (Optional)

If `content` is not provided, generates based on `topic`.

### 3. Generate Diagram (Optional)

For technical topics, generates architecture diagrams.

## Security Best Practices

1. **Never commit credentials to git**
2. **Use environment variables in production**
3. **Set file permissions to 600 for config files**
4. **Use runtime parameters for multi-user scenarios**

## Example Usage

### With Config File

```bash
# ~/.openclaw/openclaw.json configured
You: "Publish a blog about Python tips"
AI: [Uses config credentials, publishes]
```

### With Environment Variables

```bash
export BEAR_BLOG_EMAIL="user@example.com"
export BEAR_BLOG_PASSWORD="secret"

You: "Publish a blog about Python tips"
AI: [Uses env vars, publishes]
```

### With Runtime Parameters

```python
# In your chat bot code
email = get_user_email()  # Ask user
password = get_user_password()  # Ask user

publisher = BearBlogPublisher(email=email, password=password)
result = publisher.publish(title="My Post", content="# Content")
```

## Implementation

- Uses Bear Blog web API
- CSRF token authentication
- Session-based (no persistent storage)
- Playwright for diagram generation

## License

MIT
