#!/usr/bin/env bash
# composio-connect: One-time setup for OpenClaw
# Registers Composio MCP server in mcporter config
#
# Usage:
#   COMPOSIO_API_KEY=key COMPOSIO_MCP_URL="https://..." bash setup.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Composio Connect — Setup           ║${NC}"
echo -e "${BLUE}║  850+ app integrations for OpenClaw      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Check required env vars ───────────────────────────────────────────────

MISSING=0

if [ -z "${COMPOSIO_API_KEY:-}" ]; then
  echo -e "${RED}✗ COMPOSIO_API_KEY is not set${NC}"
  MISSING=1
else
  MASKED_KEY="${COMPOSIO_API_KEY:0:8}...${COMPOSIO_API_KEY: -4}"
  echo -e "${GREEN}✓ COMPOSIO_API_KEY is set${NC} (${MASKED_KEY})"
fi

if [ -z "${COMPOSIO_MCP_URL:-}" ]; then
  echo -e "${RED}✗ COMPOSIO_MCP_URL is not set${NC}"
  MISSING=1
else
  echo -e "${GREEN}✓ COMPOSIO_MCP_URL is set${NC} (${COMPOSIO_MCP_URL:0:60}...)"
fi

if [ "$MISSING" -eq 1 ]; then
  echo ""
  echo "  To set up Composio:"
  echo "    1. Go to https://platform.composio.dev/settings → copy your API key"
  echo "    2. Go to https://platform.composio.dev → MCP Servers"
  echo "    3. Create an MCP server and connect your apps"
  echo "    4. Copy the MCP URL and run:"
  echo ""
  echo "    COMPOSIO_API_KEY=your-key \\"
  echo "    COMPOSIO_MCP_URL=\"https://backend.composio.dev/v3/mcp/.../mcp?user_id=...\" \\"
  echo "    bash $0"
  echo ""
  exit 1
fi

# ── 2. Check node is available ───────────────────────────────────────────────

if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found. Install Node 18+.${NC}"
  exit 1
fi

# ── 3. Write to mcporter config ──────────────────────────────────────────────

echo ""
echo -e "${BLUE}Registering in mcporter config...${NC}"

MCPORTER_HOME="${HOME}/.mcporter"
MCPORTER_CONFIG="${MCPORTER_HOME}/mcporter.json"
mkdir -p "$MCPORTER_HOME"

MCPORTER_CONFIG="$MCPORTER_CONFIG" MCP_URL="$COMPOSIO_MCP_URL" API_KEY="$COMPOSIO_API_KEY" node -e "
const fs = require('fs');
const configPath = process.env.MCPORTER_CONFIG;
const mcpUrl = process.env.MCP_URL;
const apiKey = process.env.API_KEY;

let config = { mcpServers: {} };
try {
  const existing = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(existing);
  if (!config.mcpServers) config.mcpServers = {};
} catch (e) {}

config.mcpServers.composio = {
  description: 'Composio — 850+ app integrations (Gmail, Slack, GitHub, Calendar, etc.)',
  baseUrl: mcpUrl,
  headers: {
    'x-api-key': apiKey,
  },
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
console.log('Wrote: ' + configPath);
"

echo -e "${GREEN}✓ Composio registered in mcporter as 'composio'${NC}"
echo "  Config: ${MCPORTER_CONFIG}"

# ── 4. Verify (optional — needs mcporter installed) ──────────────────────────

echo ""
echo -e "${BLUE}Verifying connection...${NC}"

if command -v mcporter &>/dev/null; then
  if mcporter list composio 2>/dev/null | head -10; then
    echo ""
    echo -e "${GREEN}✓ Composio tools are accessible via mcporter${NC}"
  else
    echo -e "${YELLOW}⚠ Could not list tools yet${NC}"
    echo "  Try: mcporter list composio"
  fi
else
  echo -e "${YELLOW}⚠ mcporter not installed${NC}"
  echo "  Install: npm install -g mcporter"
fi

# ── Done ──────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "  Manage apps:     https://platform.composio.dev"
echo "  Config location: ${MCPORTER_CONFIG}"
echo "  Free tier:       20,000 calls/month"
echo ""
echo "  Now restart OpenClaw and try:"
echo "    \"Send an email to john@example.com\""
echo "    \"Create a GitHub issue for the login bug\""
echo "    \"What's on my calendar this week?\""
echo ""
