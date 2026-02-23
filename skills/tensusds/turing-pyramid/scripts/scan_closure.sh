#!/bin/bash
# scan_closure.sh - Check for open threads, pending TODOs
# Returns: 3=all closed, 2=some open, 1=many open, 0=overwhelmed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_scan_helper.sh"

NEED="closure"
WORKSPACE="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
MEMORY_DIR="$WORKSPACE/memory"

# Get time-based satisfaction
time_sat=$(calc_time_satisfaction "$NEED")
if [[ $time_sat -eq 3 ]]; then echo 3; exit 0; fi

# Check for open items
open_count=0

# Count TODO markers in recent memory files (last 3 days only)
if [[ -d "$MEMORY_DIR" ]]; then
    recent_todos=$(find "$MEMORY_DIR" -name "*.md" -mtime -3 \
        -exec grep -l "TODO\|PENDING\|\[ \]" {} \; 2>/dev/null | wc -l)
    open_count=$((open_count + recent_todos))
fi

# Check for "Open questions" markers in recent files only
if [[ -d "$MEMORY_DIR" ]]; then
    open_questions=$(find "$MEMORY_DIR" -name "*.md" -mtime -3 \
        -exec grep -l "Open question\|To follow up\|Waiting for" {} \; 2>/dev/null | wc -l)
    open_count=$((open_count + open_questions / 3))
fi

# Calculate event satisfaction
if [[ $open_count -ge 15 ]]; then
    event_sat=0
elif [[ $open_count -ge 8 ]]; then
    event_sat=1
elif [[ $open_count -ge 4 ]]; then
    event_sat=2
else
    event_sat=3
fi

smart_satisfaction "$NEED" "$event_sat"
