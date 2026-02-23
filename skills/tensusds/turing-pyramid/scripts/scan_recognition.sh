#!/bin/bash
# scan_recognition.sh - Check for external acknowledgment/feedback
# Returns: 3=recent positive feedback, 2=some engagement, 1=ignored, 0=negative feedback

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_scan_helper.sh"

NEED="recognition"
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
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)

positive_signals=0
negative_signals=0

# Check memory for recognition indicators
for day in "$TODAY" "$YESTERDAY"; do
    if [ -f "$MEMORY_DIR/$day.md" ]; then
        # Positive: thanks, great, helpful, appreciated, good job, liked
        positive=$(grep -ciE "(thanks|great work|helpful|appreciated|good job|liked|upvote|positive feedback|feedback|молодец|отлично|круто)" "$MEMORY_DIR/$day.md" 2>/dev/null || echo 0)
        positive_signals=$((positive_signals + positive))
        
        # Negative: wrong, bad, unhelpful, mistake, failed
        negative=$(grep -ciE "(wrong|bad|unhelpful|mistake|failed|criticism|negative|ошибка)" "$MEMORY_DIR/$day.md" 2>/dev/null || echo 0)
        negative_signals=$((negative_signals + negative))
    fi
done

# Calculate event-based score
if [ "$negative_signals" -gt "$positive_signals" ] && [ "$negative_signals" -gt 2 ]; then
    event_sat=0  # Net negative feedback
elif [ "$positive_signals" -ge 3 ]; then
    event_sat=3  # Good recognition
elif [ "$positive_signals" -ge 1 ]; then
    event_sat=2  # Some engagement
else
    event_sat=1  # Ignored/no feedback
fi

# Return the worse of time_sat and event_sat
smart_satisfaction "$NEED" "$event_sat"
