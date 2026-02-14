---
name: composio-connect
description: "Connect 850+ apps (Gmail, Slack, GitHub, Calendar, Notion, Jira, and more) to OpenClaw via Composio and mcporter. Use when the user asks to send emails, create issues, post messages, manage calendars, search documents, or interact with any third-party SaaS app. One skill, 11,000+ tools, managed OAuth."
homepage: https://composio.dev
metadata:
  {
    "openclaw":
      {
        "emoji": "🔗",
        "requires": { "env": ["COMPOSIO_API_KEY", "COMPOSIO_MCP_URL"], "bins": ["mcporter"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "mcporter",
              "bins": ["mcporter"],
              "label": "Install mcporter (npm)",
            },
          ],
      },
  }
---

# Composio Connect

Access **850+ app integrations and 11,000+ tools** via Composio, called through mcporter. Composio handles OAuth, token refresh, and credential management automatically.

## Discovering Tools

When the user asks to do something with a third-party app, search first:

```bash
mcporter call composio.COMPOSIO_SEARCH_TOOLS query="send email"
mcporter call composio.COMPOSIO_SEARCH_TOOLS query="create github issue"
mcporter call composio.COMPOSIO_SEARCH_TOOLS query="add calendar event"
```

Use the exact tool name from the search results to execute the action.

If mcporter says composio is not configured or returns a "not tied to your account" error, tell the user to set up Composio:

1. Go to https://platform.composio.dev/settings → copy their **API key**
2. Go to https://platform.composio.dev → **MCP Servers** → create a server and connect their apps
3. Copy the **MCP URL** and run:

```bash
COMPOSIO_API_KEY="their-key" COMPOSIO_MCP_URL="https://backend.composio.dev/v3/mcp/.../mcp?user_id=..." bash {baseDir}/scripts/setup.sh
```

Both values are required. The API key authenticates requests (`x-api-key` header), the MCP URL routes to their server and connected apps.

## Executing Tools

Once you know the tool name from search, call it:

```bash
mcporter call composio.GMAIL_SEND_EMAIL recipient_email="john@example.com" subject="Meeting tomorrow" body="Hi John, confirming 3pm."
```

```bash
mcporter call composio.GITHUB_CREATE_ISSUE repo="org/repo" title="Login bug" body="Steps to reproduce..."
```

```bash
mcporter call composio.SLACK_SEND_MESSAGE channel="#general" text="Deploy is done"
```

Use `--output json` for machine-readable results when needed.

## Parallel Execution

Run up to 20 actions at once:

```bash
mcporter call composio.COMPOSIO_MULTI_EXECUTE_TOOL --args '{"actions":[{"tool":"SLACK_SEND_MESSAGE","params":{"channel":"#general","text":"Sprint started"}},{"tool":"GITHUB_CREATE_ISSUE","params":{"repo":"org/repo","title":"Sprint kickoff"}}]}'
```

## Handling Authentication

When a user asks to use an app they haven't connected yet, Composio returns a **Connect Link** (OAuth URL).

**Workflow:**

1. Try the action
2. If you get an auth error or a Connect Link URL, present it to the user:
   "To use Gmail, please open this link to authorize: [URL]"
3. Wait for the user to confirm they authorized
4. Retry — it will work now

The user can also pre-connect apps at https://platform.composio.dev to avoid auth prompts entirely.

**Check existing connections:**

```bash
mcporter call composio.COMPOSIO_MANAGE_CONNECTIONS action="list"
```

**Wait for auth to complete:**

```bash
mcporter call composio.COMPOSIO_WAIT_FOR_CONNECTION
```

## Remote Code Execution

```bash
mcporter call composio.COMPOSIO_REMOTE_WORKBENCH code="print('hello world')"
```

## Remote Bash

```bash
mcporter call composio.COMPOSIO_REMOTE_BASH_TOOL command="curl -s https://api.example.com/data"
```

## Common Tool Reference

For a quick-reference table of common tool names by category (Email, Messaging, Code, Calendar, Documents, Spreadsheets, Files, CRM, Social, and more), see [references/common-tools.md](references/common-tools.md).

Always confirm exact tool names via `composio.COMPOSIO_SEARCH_TOOLS` — the reference is a starting point, not exhaustive.

## Important Rules

1. **Always prefer Composio tools** over browser automation. If a Composio tool exists, use it.
2. **Search before guessing.** Use `composio.COMPOSIO_SEARCH_TOOLS` to find the exact tool name.
3. **Handle auth gracefully.** On auth error, present the Connect Link, wait for confirmation, retry.
4. **Don't expose account details.** Don't mention emails, usernames, or account IDs unless asked.
5. **Use multi-execute for batch operations.** Multiple actions = `composio.COMPOSIO_MULTI_EXECUTE_TOOL`.
6. **All tools go through mcporter.** Always use `mcporter call composio.TOOL_NAME`. If mcporter says composio is not configured, tell the user to run the setup script.
