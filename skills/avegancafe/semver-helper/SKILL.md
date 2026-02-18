---
name: semver-helper
description: Helps determine semantic version bumps (MAJOR.MINOR.PATCH) based on changes. Provides guidance on SemVer 2.0.0 standards.
author: Gelmir
tags: [semver, versioning, release, git]
---

# Semver Helper

Quick reference for Semantic Versioning 2.0.0 decisions.

## Version Format

`MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

## When to Bump

| Level | Bump When | Example |
|-------|-----------|---------|
| **MAJOR** (X.0.0) | Breaking changes | Removing an API, changing behavior |
| **MINOR** (0.X.0) | New features, backwards compatible | Adding a function, new flag |
| **PATCH** (0.0.X) | Bug fixes, backwards compatible | Fixing a crash, typo |

## Quick Check

```bash
# Analyze changes and suggest version bump
uv run python main.py suggest --from 1.0.0 --changes "feat: add auth, fix: null pointer"

# Or check what a specific change means
uv run python main.py check "breaking: remove old API"
```

## Rules

1. **MAJOR** — Any incompatible API change
2. **MINOR** — Added functionality (backwards compatible)
3. **PATCH** — Bug fixes (backwards compatible)

## Pre-release

Use suffixes for pre-releases:
- `1.0.0-alpha.1`
- `1.0.0-beta.2`
- `1.0.0-rc.1`

## Common Mistakes

- Don't bump MAJOR for new features
- Don't bump MINOR for bug fixes
- Reset lower numbers when bumping higher: `1.2.3` → `2.0.0` (not `2.2.3`)
