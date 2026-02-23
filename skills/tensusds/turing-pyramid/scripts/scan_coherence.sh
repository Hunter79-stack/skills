#!/bin/bash
# scan_coherence.sh - Check memory consistency
# Returns: 3=coherent, 2=minor issues, 1=contradictions, 0=chaos

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_scan_helper.sh"

NEED="coherence"
WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
MEMORY_DIR="$WORKSPACE/memory"

# Get time-based satisfaction
time_sat=$(calc_time_satisfaction "$NEED")
if [[ $time_sat -eq 3 ]]; then echo 3; exit 0; fi

issues=0

# Check for MEMORY.md existence and size
if [[ -f "$WORKSPACE/MEMORY.md" ]]; then
    lines=$(wc -l < "$WORKSPACE/MEMORY.md")
    if [[ $lines -gt 500 ]]; then
        issues=$((issues + 2))  # Too large, needs pruning
    fi
else
    issues=$((issues + 3))  # No MEMORY.md = big issue
fi

# Check for orphaned temp files
if [[ -d "$MEMORY_DIR" ]]; then
    orphans=$(find "$MEMORY_DIR" -name "*.tmp" -o -name "*~" 2>/dev/null | wc -l)
    issues=$((issues + orphans))
fi

# Calculate event satisfaction
if [[ $issues -ge 6 ]]; then
    event_sat=0
elif [[ $issues -ge 3 ]]; then
    event_sat=1
elif [[ $issues -ge 1 ]]; then
    event_sat=2
else
    event_sat=3
fi

smart_satisfaction "$NEED" "$event_sat"
