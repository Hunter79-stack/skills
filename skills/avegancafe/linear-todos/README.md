# Linear Todos

A complete todo management system built on Linear with smart date parsing, priorities, and CLI tools.

## Features

- 📝 Natural language dates ("tomorrow", "next Monday", "in 3 days")
- ⚡ Priority levels (urgent, high, normal, low)
- 📅 Smart scheduling (day, week, month)
- ✅ Mark todos as done
- 💤 Snooze todos to later dates
- 📊 Daily review with organized output
- ☕ Morning digest with fun greetings

## Installation

### Prerequisites

- [uv](https://docs.astral.sh/uv/) - Fast Python package manager
- A Linear account with [API access](https://linear.app/settings/api)

### Option 1: Install from ClawHub (Recommended for OpenClaw users)

```bash
clawhub install linear-todos
```

### Option 2: Clone and install manually

```bash
# Clone the repository
git clone <repo-url>
cd linear-todos

# Install dependencies
uv sync

# Run setup wizard
uv run python main.py setup
```

### Option 3: Using pip

```bash
git clone <repo-url>
cd linear-todos
pip install -e .
linear-todo --help
```

### Option 4: Copy to OpenClaw workspace

```bash
cp -r linear-todos ~/.openclaw/skills/
cd ~/.openclaw/skills/linear-todos
uv sync
```

## Setup (After Install)

### 1. Get a Linear API Key

1. Go to [linear.app/settings/api](https://linear.app/settings/api)
2. Create a new API key (name it "Linear Todos" or whatever you prefer)
3. Copy the key — you'll need it for the next step

### 2. Configure the CLI

**Interactive setup (recommended):**

```bash
uv run python main.py setup
```

This wizard will:
- Verify your API key
- Show your Linear teams
- Let you pick which team to use for todos
- Save settings to `~/.config/linear-todos/config.json`

**Or use environment variables:**

```bash
export LINEAR_API_KEY="lin_api_xxxxxxxx"
export LINEAR_TEAM_ID="your-team-id"  # optional
```

### 3. Create Your First Todo

```bash
uv run python main.py create "My first todo" --when day
uv run python main.py list
```

## Quick Start

```bash
# Create todos with natural language dates
uv run python main.py create "Call mom" --when day
uv run python main.py create "Pay taxes" --date 2025-04-15
uv run python main.py create "Review PR" --date "next Monday" --priority high

# Manage todos
uv run python main.py list
uv run python main.py done TODO-123
uv run python main.py snooze TODO-123 "next week"

# Daily review
uv run python main.py review
```

## Commands

| Command | Purpose |
|---------|---------|
| `create` | Create new todos |
| `list` | List all todos |
| `done` | Mark todos as completed |
| `snooze` | Reschedule todos |
| `review` | Full daily review |
| `digest` | Morning digest (today only) |
| `setup` | Interactive configuration |

**See [SKILL.md](SKILL.md) for complete documentation.**

## Testing

```bash
uv run pytest tests/ -v
```

106 tests. All pass.

## License

MIT
