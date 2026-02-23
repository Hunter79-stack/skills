# feed-to-md Skill

This skill converts RSS/Atom feed URLs into Markdown using `feed2md`.

## Files

- `SKILL.md`: skill definition and usage instructions

## Requirements

- Node.js with `npm` available

## Install

```bash
npm install -g feed2md-cli@0.1.0
```

## Usage

```bash
feed2md "https://example.com/feed.xml"
feed2md "https://example.com/feed.xml" --limit 5
feed2md "https://example.com/feed.xml" --output result.md
```
