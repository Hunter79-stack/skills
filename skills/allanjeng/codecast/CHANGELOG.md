# Changelog

## v3.0.0 — 2026-02-15

### Codex Structured Output Parsing
- Added auto-detection of Codex `--json` JSONL event stream in `parse-stream.py`
- Parses `thread.started`, `turn.started/completed/failed`, `item.started/completed`, `error` events
- Supports command executions, file changes, agent messages, reasoning traces, MCP tool calls, web searches, and plan updates
- Token usage and cost tracking per turn
- End-of-session summary with file/command/tool stats
- `dev-relay.sh` auto-detects `--json` in Codex commands and routes through parser (no `unbuffer` needed)

### PR Review Mode (`--review`)
- New `--review <PR_URL>` flag on `dev-relay.sh`
- Clones repo to temp dir, checks out PR branch, runs agent with review prompt
- Supports GitHub PR URLs (`https://github.com/owner/repo/pull/123`) and shorthand (`owner/repo#123`)
- Options: `-a` agent, `-p` custom prompt, `-c` post review as `gh pr comment`
- Streams review session to Discord as usual
- New script: `scripts/review-pr.sh`

### Parallel Worktree Support (`--parallel`)
- New `--parallel <tasks-file>` flag on `dev-relay.sh`
- Tasks file format: `directory | prompt` (one per line, `#` comments supported)
- Each task gets its own Discord thread, relay dir, and session
- Optional `--worktree` flag to use git worktrees instead of separate repos
- Summary message posted when all tasks complete
- New script: `scripts/parallel-tasks.sh`

### Discord → stdin Bridge
- New companion script: `scripts/discord-bridge.py`
- Connects to Discord gateway via WebSocket (bot token from keychain)
- Watches configured channel for messages from allowed users
- Commands: `!status`, `!kill <PID>`, `!log [PID]`, `!send [PID] <msg>`
- Plain messages auto-forwarded when only one session active
- Configurable via `BRIDGE_CHANNEL_ID` and `BRIDGE_ALLOWED_USERS` env vars

## v2.2.0 — 2026-02-15

- Switched to nohup-first invocation pattern for long-running sessions
- Documented that `exec background:true` is broken for long processes (SIGKILL after ~15-20s)
- Added nohup example and completion detection guidance to SKILL.md

## v2.1.0 — 2026-02-15

- Keychain-based Discord bot token auth (macOS `security` command)
- Concurrent session support via `/tmp/dev-relay-sessions/<PID>.json`
- `{baseDir}` placeholder in all SKILL.md paths for portability
- Added `test-smoke.sh` for pre-flight validation
- Rate limiting (default 25 posts/60s) with automatic batching
- Gateway restart warning for `exec background:true` sessions
- Platform adapter architecture (`scripts/platforms/`)

## v2.0.2

- Initial Discord webhook relay with stream-json parsing
- `dev-relay.sh` entry point with flag parsing and process management
- `parse-stream.py` for Claude Code JSON stream parsing
- Raw ANSI output fallback for non-Claude agents (Codex, Gemini CLI)
- Hang detection and timeout support
