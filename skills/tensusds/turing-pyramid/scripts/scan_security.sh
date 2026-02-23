#!/bin/bash
# scan_security.sh - Check system stability and threats
# Returns: 3=secure, 2=minor concerns, 1=issues, 0=compromised

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_scan_helper.sh"

NEED="security"
WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"

# Get time-based satisfaction
time_sat=$(calc_time_satisfaction "$NEED")
if [[ $time_sat -eq 3 ]]; then echo 3; exit 0; fi

issues=0

# Check core files exist
[[ ! -f "$WORKSPACE/SOUL.md" ]] && issues=$((issues + 2))
[[ ! -f "$WORKSPACE/MEMORY.md" ]] && issues=$((issues + 1))
[[ ! -f "$WORKSPACE/AGENTS.md" ]] && issues=$((issues + 1))

# Check for backup indicators (generic)
# Agents can customize BACKUP_DIR in environment
BACKUP_DIR="${BACKUP_DIR:-}"
if [[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" ]]; then
    : # Backup configured and exists
fi
# Note: backup check is optional, not penalized if unconfigured

# Calculate event satisfaction
if [[ $issues -ge 4 ]]; then
    event_sat=0
elif [[ $issues -ge 2 ]]; then
    event_sat=1
elif [[ $issues -ge 1 ]]; then
    event_sat=2
else
    event_sat=3
fi

smart_satisfaction "$NEED" "$event_sat"
