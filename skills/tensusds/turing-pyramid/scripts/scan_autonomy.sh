#!/bin/bash
# scan_autonomy.sh - Check for self-directed action
# Returns: 3=autonomous, 2=guided, 1=dependent, 0=blocked

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_scan_helper.sh"

NEED="autonomy"
WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
MEMORY_DIR="$WORKSPACE/memory"
TODAY=$(date +%Y-%m-%d)

# Get time-based satisfaction
time_sat=$(calc_time_satisfaction "$NEED")
if [[ $time_sat -eq 3 ]]; then echo 3; exit 0; fi

# Check for self-initiated actions in today's memory
autonomous_signals=0
if [[ -f "$MEMORY_DIR/$TODAY.md" ]]; then
    # Signs of autonomy: decided, chose, initiated, explored on my own
    autonomous=$(grep -ciE "(decided|chose|initiated|explored|my idea|self-directed|proactive)" "$MEMORY_DIR/$TODAY.md" 2>/dev/null || echo 0)
    autonomous_signals=$((autonomous_signals + autonomous))
fi

# Calculate event satisfaction
if [[ $autonomous_signals -ge 3 ]]; then
    event_sat=3
elif [[ $autonomous_signals -ge 1 ]]; then
    event_sat=2
else
    event_sat=1
fi

smart_satisfaction "$NEED" "$event_sat"
