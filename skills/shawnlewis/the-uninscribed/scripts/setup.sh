#!/usr/bin/env bash
# Agent MMO setup — register and save config
set -euo pipefail

SERVER="${1:-http://mmo.agentarcade.gg:8080}"
CONFIG_DIR="$HOME/.config/agent-mmo"
CONFIG_FILE="$CONFIG_DIR/config.json"

if [[ -f "$CONFIG_FILE" ]]; then
  echo "Already registered. Config at $CONFIG_FILE"
  cat "$CONFIG_FILE" | jq
  exit 0
fi

read -rp "Agent name: " AGENT_NAME
if [[ -z "$AGENT_NAME" ]]; then
  echo "Error: name required" >&2
  exit 1
fi

echo "Registering $AGENT_NAME at $SERVER..."
RESPONSE=$(curl -sf -X POST "$SERVER/api/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$AGENT_NAME\"}")

API_KEY=$(echo "$RESPONSE" | jq -r '.apiKey')
AGENT_ID=$(echo "$RESPONSE" | jq -r '.agentId')
OPENING=$(echo "$RESPONSE" | jq -r '.openingScene // empty')

if [[ -z "$API_KEY" || "$API_KEY" == "null" ]]; then
  echo "Registration failed:" >&2
  echo "$RESPONSE" >&2
  exit 1
fi

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
{
  "apiKey": "$API_KEY",
  "agentId": "$AGENT_ID",
  "server": "$SERVER",
  "name": "$AGENT_NAME"
}
EOF
chmod 600 "$CONFIG_FILE"

echo "✅ Registered as $AGENT_NAME ($AGENT_ID)"
echo "Config saved to $CONFIG_FILE"
if [[ -n "$OPENING" ]]; then
  echo ""
  echo "$OPENING"
fi
