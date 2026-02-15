---
name: link-brain
version: 4.2.0
description: "Local knowledge base for links. Save URLs with summaries and tags, search later using natural language, build collections, and review your backlog with spaced repetition. Includes a standalone HTML graph view."
---

# Link Brain

Link Brain is a local CLI that stores URLs with titles, summaries, tags, and metadata in a SQLite database.

It is designed to be simple to run and easy to trust.

- No accounts
- No API keys
- No telemetry
- Data stays on disk in `~/.link-brain/`

## Quick start

```bash
python3 scripts/brain.py setup

# Manual save
python3 scripts/brain.py save "https://example.com" \
  --title "Example" \
  --summary "A short note about what this page is." \
  --tags "reference, example"

# Auto save (fetches the page with urllib, then summarizes and tags locally)
python3 scripts/brain.py save "https://example.com" --auto

# Search
python3 scripts/brain.py search "that article about sqlite"

# Make a graph
python3 scripts/brain.py graph --open
```

## Where data lives

By default Link Brain stores everything under:

- `~/.link-brain/brain.db` (SQLite)
- `~/.link-brain/graph.html` (optional output)
- `~/.link-brain/collection-*.md` and `collection-*.html` (optional exports)

For tests or temporary runs you can override the directory:

```bash
LINK_BRAIN_DIR=/tmp/my-link-brain python3 scripts/brain.py setup
```

## Saving links

### Manual save

Use manual save when you already know the title, tags, and summary.

```bash
python3 scripts/brain.py save "https://docs.python.org" \
  --title "Python docs" \
  --summary "Reference docs for the Python standard library." \
  --tags "python, docs"
```

### Auto save

Auto save fetches the URL with `urllib` and then performs local processing:

- extracts readable text from HTML
- generates an extractive summary
- suggests tags based on keywords and your existing tags

```bash
python3 scripts/brain.py auto-save "https://example.com"
# or
python3 scripts/brain.py save "https://example.com" --auto
```

Note: auto save performs a network request to the target URL. All other commands operate locally.

## Searching

Search uses SQLite FTS5 and also supports natural language filters.

Examples:

```bash
python3 scripts/brain.py search "last week unread from github"
python3 scripts/brain.py search "best rated rust"
python3 scripts/brain.py search "unrated videos from youtube"
python3 scripts/brain.py search "oldest unread" --limit 10
```

## Collections

Collections are reading lists that reference saved links.

```bash
python3 scripts/brain.py collection create "Rust" --description "Things to read and revisit"
python3 scripts/brain.py collection add "Rust" 42
python3 scripts/brain.py collection show "Rust"
python3 scripts/brain.py collection export "Rust"          # markdown
python3 scripts/brain.py collection export "Rust" --html   # html
```

## Review (spaced repetition)

Every saved link is added to a review queue. You can pull the next due item and mark it as reviewed.

```bash
python3 scripts/brain.py review next
python3 scripts/brain.py review done 42
python3 scripts/brain.py review skip 42
```

## GUI Console

```bash
python3 scripts/brain.py gui              # Open the visual console in your browser
python3 scripts/brain.py gui --no-open    # Generate without opening
```

The GUI generates a single self-contained HTML file at `~/.link-brain/console.html` with everything embedded inline. No external dependencies, no CDNs, no fetch calls. Features include search, tag cloud, knowledge graph, collections, review queue, reading timeline, and a dark/light mode toggle.

## Graph

The graph command generates a single standalone HTML file with an interactive canvas view.

```bash
python3 scripts/brain.py graph
python3 scripts/brain.py graph --open
```

It does not require external JavaScript libraries.

## Command list

Run:

```bash
python3 scripts/brain.py help
```

## Feedback

Found a bug? Have an idea? We want to hear it.

```bash
brain.py feedback "your message"
brain.py feedback --bug "something broke"
brain.py feedback --idea "wouldn't it be cool if..."
```

Need to file a detailed bug report? Run `brain.py debug` to get system info you can paste into an issue.
