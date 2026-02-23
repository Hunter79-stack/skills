#!/bin/bash
# scan_expression.sh - Check creative/expressive output
# Returns: 3=recently expressed, 2=some output, 1=quiet, 0=blocked

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_scan_helper.sh"

NEED="expression"

# Get time-based satisfaction
time_sat=$(calc_time_satisfaction "$NEED")

# Expression is primarily time-based (articulation need builds over time)
# Events can only worsen if there are signs of being blocked
echo "$time_sat"
