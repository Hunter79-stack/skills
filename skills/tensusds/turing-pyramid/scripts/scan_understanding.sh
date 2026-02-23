#!/bin/bash
# scan_understanding.sh - Check learning and comprehension activity
# Returns: 3=actively learning, 2=some research, 1=stagnant, 0=confused/lost

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_scan_helper.sh"

NEED="understanding"
WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
MEMORY_DIR="$WORKSPACE/memory"

# Get time-based satisfaction first
time_sat=$(calc_time_satisfaction "$NEED")

# If time says fully satisfied, trust it
if [[ $time_sat -eq 3 ]]; then
    echo 3
    exit 0
fi

# Otherwise, check for event-based signals
TODAY=$(date +%Y-%m-%d)

research_activity=0
confusion_signals=0

# Check today's memory for learning indicators
if [ -f "$MEMORY_DIR/$TODAY.md" ]; then
    # Positive: research, learned, understood, discovered, realized
    learning=$(grep -ciE "(research|learned|understood|discover|realiz|insight|figured out|makes sense|explored|read article)" "$MEMORY_DIR/$TODAY.md" 2>/dev/null || echo 0)
    research_activity=$((research_activity + learning))
    
    # Negative: confused, lost, unclear, don't understand
    confused=$(grep -ciE "(confused|lost|unclear|don't understand|no idea|stuck)" "$MEMORY_DIR/$TODAY.md" 2>/dev/null || echo 0)
    confusion_signals=$((confusion_signals + confused))
fi

# Check research directory activity (last 12 hours)
if [ -d "$WORKSPACE/research" ]; then
    recent_research=$(find "$WORKSPACE/research" -type f -mmin -720 2>/dev/null | wc -l)
    if [ "$recent_research" -gt 0 ]; then
        research_activity=$((research_activity + recent_research))
    fi
fi

# Calculate event-based score
if [ "$confusion_signals" -gt 2 ]; then
    event_sat=0  # Lost/confused state
elif [ "$research_activity" -ge 3 ]; then
    event_sat=3  # Actively learning
elif [ "$research_activity" -ge 1 ]; then
    event_sat=2  # Some research happening
else
    event_sat=1  # Stagnant, no recent learning
fi

# Return the worse of time_sat and event_sat
smart_satisfaction "$NEED" "$event_sat"
