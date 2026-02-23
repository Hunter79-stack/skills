#!/bin/bash
# scan_competence.sh - Check for effective skill use
# Returns: 3=highly effective, 2=competent, 1=struggling, 0=failing

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_scan_helper.sh"

NEED="competence"
WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
MEMORY_DIR="$WORKSPACE/memory"
TODAY=$(date +%Y-%m-%d)

# Get time-based satisfaction
time_sat=$(calc_time_satisfaction "$NEED")
if [[ $time_sat -eq 3 ]]; then echo 3; exit 0; fi

# Check for competence signals
competence_signals=0
failure_signals=0

if [[ -f "$MEMORY_DIR/$TODAY.md" ]]; then
    # Positive: completed, solved, built, fixed, succeeded
    success=$(grep -ciE "(completed|solved|built|fixed|succeeded|worked|done)" "$MEMORY_DIR/$TODAY.md" 2>/dev/null)
    [[ -z "$success" ]] && success=0
    competence_signals=$((competence_signals + success))
    
    # Negative: failed, error, couldn't, stuck, broken
    failures=$(grep -ciE "(failed|error|couldn't|stuck|broken|bug)" "$MEMORY_DIR/$TODAY.md" 2>/dev/null)
    [[ -z "$failures" ]] && failures=0
    failure_signals=$((failure_signals + failures))
fi

# Calculate event satisfaction
net=$((competence_signals - failure_signals))
if [[ $failure_signals -gt $competence_signals ]] && [[ $failure_signals -gt 3 ]]; then
    event_sat=0
elif [[ $net -ge 3 ]]; then
    event_sat=3
elif [[ $net -ge 1 ]]; then
    event_sat=2
else
    event_sat=1
fi

smart_satisfaction "$NEED" "$event_sat"
