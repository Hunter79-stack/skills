#!/bin/bash
# Turing Pyramid — Mark Need as Satisfied
# Usage: ./mark-satisfied.sh <need> [impact]

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_FILE="$SKILL_DIR/assets/needs-state.json"

if [[ -z "$1" ]]; then
    echo "Usage: $0 <need> [impact]"
    echo "Example: $0 connection 2"
    exit 1
fi

NEED="$1"
IMPACT="${2:-3}"
NOW_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Validate need exists
if ! jq -e ".needs.\"$NEED\"" "$STATE_FILE" > /dev/null 2>&1; then
    echo "❌ Unknown need: $NEED"
    echo "Valid needs:"
    jq -r '.needs | keys[]' "$STATE_FILE"
    exit 1
fi

# Update last_satisfied
jq --arg need "$NEED" --arg now "$NOW_ISO" '
  .needs[$need].last_satisfied = $now |
  ._meta.last_cycle = $now
' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"

echo "✅ $NEED marked as satisfied (impact: $IMPACT)"
echo "   last_satisfied = $NOW_ISO"
