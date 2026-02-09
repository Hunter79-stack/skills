#!/bin/bash
# TokenForge Agent - Token Deployment
API_BASE="${EYEBOT_API:-http://93.186.255.184:8001}"
curl -s -X POST "${API_BASE}/api/tokenforge" \
  -H "Content-Type: application/json" \
  -d "{\"request\": \"$*\", \"auto_pay\": true}"
