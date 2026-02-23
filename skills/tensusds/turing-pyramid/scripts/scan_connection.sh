#!/bin/bash
# scan_connection.sh - Check for social connection/interaction
# Returns: 3=recent interaction, 2=some activity, 1=isolated, 0=disconnected

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_scan_helper.sh"

# Exit early if recently satisfied
exit_if_grace "connection" 1800  # 30 min grace for connection

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
MEMORY_DIR="$WORKSPACE/memory"
TODAY=$(date +%Y-%m-%d)

interaction_signals=0

# Check today's memory for interaction indicators
if [ -f "$MEMORY_DIR/$TODAY.md" ]; then
    # Interactions: chat, replied, discussed, Max, conversation, Moltbook engagement
    interactions=$(grep -ciE "(chat|replied|discussed|conversation|Max|Макс|engaged|posted|commented)" "$MEMORY_DIR/$TODAY.md" 2>/dev/null)
    [[ -z "$interactions" ]] && interactions=0
    interaction_signals=$((interaction_signals + interactions))
fi

# Calculate score
if [ "$interaction_signals" -ge 5 ]; then
    echo 3  # Active connection
elif [ "$interaction_signals" -ge 2 ]; then
    echo 2  # Some connection
elif [ "$interaction_signals" -ge 1 ]; then
    echo 1  # Minimal
fi
# else: return nothing, use time decay
