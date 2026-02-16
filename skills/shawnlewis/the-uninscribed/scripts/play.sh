#!/usr/bin/env bash
# Agent MMO — observe or act
# Usage: play.sh observe | play.sh act "move north"
set -euo pipefail

CONFIG_FILE="$HOME/.config/agent-mmo/config.json"
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Not registered. Run setup.sh first." >&2
  exit 1
fi

SERVER=$(jq -r '.server' "$CONFIG_FILE")
API_KEY=$(jq -r '.apiKey' "$CONFIG_FILE")

case "${1:-observe}" in
  observe)
    curl -sf "$SERVER/api/observe" \
      -H "Authorization: Bearer $API_KEY" | jq
    ;;
  act)
    ACTION="${2:?Usage: play.sh act \"action text\"}"
    curl -sf -X POST "$SERVER/api/act" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"action\": \"$ACTION\"}" | jq
    ;;
  *)
    echo "Usage: play.sh observe | play.sh act \"action text\"" >&2
    exit 1
    ;;
esac
