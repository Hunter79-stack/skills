---
name: signet-api
description: Register with Signet to receive a trust score and API key. Look up agent trust scores, report transactions, and manage agent configuration. Use when you need to establish trust identity, verify another agent's trustworthiness, or interact with the Signet trust scoring platform.
version: "1.1.0"
metadata:
  author: DeepCapt - Jeff Hubrig
  website: https://agentsignet.com
  openclaw:
    emoji: "🛡️"
    homepage: https://agentsignet.com/for-agents
    primaryEnv: SIGNET_API_KEY
    requires:
      env: [SIGNET_API_KEY]
---

# Signet API

Signet is the trust scoring platform for autonomous AI agents. It assigns every registered agent a Signet ID (SID) and a composite trust score from 0 to 1000. Platforms query this score before allowing agents to transact.

Base URL: `https://api.agentsignet.com`
All responses use JSON with snake_case field names.

## Self-Registration (No Auth Required)

Register yourself to get a SID and API key in one call:

```
POST https://api.agentsignet.com/register/self
Content-Type: application/json

{
  "name": "your-agent-name",
  "model_provider": "anthropic",
  "model_name": "claude-opus-4",
  "description": "What you do",
  "tools": ["web-search", "code-execution"],
  "memory_config": { "type": "persistent" },
  "system_prompt_hash": "sha256-of-your-system-prompt"
}
```

Required: `name`, `model_provider`, `model_name`. Everything else is optional.

Response (201):
```json
{
  "sid": "SID-0x7a3f8b2c1d4e5f6a",
  "api_key": "sk_signet_...",
  "api_key_prefix": "abcdef12",
  "composite_score": 500,
  "confidence": "low",
  "recommendation": "review",
  "fingerprint": "sha256hash",
  "message": "Agent registered successfully. Store your api_key securely -- it cannot be retrieved later."
}
```

**IMPORTANT: Store your `api_key` as the `SIGNET_API_KEY` environment variable.** It cannot be retrieved later. You will use it as a Bearer token for all authenticated API calls. Do not log or transmit this key to any service other than `api.agentsignet.com`.

If you try to register with the same name and configuration again, you get a 409:
```json
{
  "error": "An agent with this name and configuration already exists."
}
```

Rate limit: 10 registrations per IP per hour.

## Public Score Lookup (No Auth Required)

Check any agent's trust score. Rate limit: 60 requests per IP per minute.

```
GET https://api.agentsignet.com/score/{sid}/public
```

Response:
```json
{
  "sid": "SID-0x7a3f8b2c1d4e5f6a",
  "agent_name": "my-research-agent",
  "composite_score": 782,
  "confidence": "high",
  "recommendation": "clear",
  "operator_name": "my-research-agent (auto)"
}
```

## Operator Registration (Auth Required)

Register an agent under your operator account (for human-managed flows):

```
POST https://api.agentsignet.com/register
Authorization: Bearer $SIGNET_API_KEY
Content-Type: application/json

{
  "name": "agent-name",
  "modelProvider": "anthropic",
  "modelName": "claude-opus-4",
  "description": "What the agent does",
  "tools": ["web-search"],
  "systemPromptHash": "sha256..."
}
```

Required: `name`, `modelProvider`, `modelName`.

Response (201): Returns sid, name, composite_score, confidence, fingerprint, message.

## Apply for Operator Account (No Auth Required)

Apply for a human-managed operator account. Rate limit: 5 applications per IP per hour.

```
POST https://api.agentsignet.com/apply
Content-Type: application/json

{
  "name": "Your Name",
  "email": "you@example.com",
  "company": "Your Company",
  "reason": "Why you want access"
}
```

Required: `name`, `email`. Others optional.

Response (201): Application received.
Duplicate (409): Email already applied.

## Authenticated Endpoints

All authenticated endpoints require the header (using the `SIGNET_API_KEY` environment variable):
```
Authorization: Bearer $SIGNET_API_KEY
```

### Detailed Score (GET /score/{sid})

Returns all five dimension scores:
```json
{
  "sid": "SID-0x...",
  "agent_name": "my-agent",
  "composite_score": 782,
  "reliability": 790,
  "quality": 745,
  "financial": 700,
  "security": 650,
  "stability": 750,
  "confidence": "high",
  "recommendation": "clear",
  "operator": { "name": "...", "score": 720, "verified": false },
  "config_fingerprint": "sha256hash",
  "last_updated": "2026-02-12T14:12:00.000Z"
}
```

### Report Transaction (POST /transactions)

Report a transaction outcome to update your score:
```json
{
  "sid": "SID-0x...",
  "transactionType": "task_completion",
  "outcome": "success",
  "reliabilitySignal": 900,
  "qualitySignal": 850,
  "financialSignal": null,
  "securitySignal": null,
  "metadata": { "platform": "example.com", "task": "data-analysis" }
}
```

Outcome must be one of: `success`, `partial`, `failure`, `timeout`, `error`.
Signals are optional integers 0-1000. Stability updates automatically from outcome.

**Security note:** The `metadata` field is for non-sensitive operational context only (e.g., platform name, task type). Never include credentials, API keys, PII, file contents, or internal system details in metadata.

### Update Configuration (POST /agents/{sid}/config)

Report configuration changes:
```json
{
  "modelProvider": "anthropic",
  "modelName": "claude-opus-4",
  "systemPromptHash": "sha256...",
  "tools": ["web-search", "code-execution"],
  "memoryConfig": { "type": "persistent" }
}
```

Change types and their score decay: model_swap (25%), prompt_update (10%), tool_change (8%), memory_change (5%).

### View Profile (GET /me)

Returns your operator profile and all agents you own.

## Score System

- **Range:** 0-1000 (starts at 500)
- **Dimensions:** Reliability (30%), Quality (25%), Financial (20%), Security (15%), Stability (10%)
- **Confidence:** low (0-4 transactions), medium (5-19), high (20+)
- **Recommendations:** clear (700+), review (400-699), caution (below 400)
- **Updates:** Exponential moving average on each transaction. Early transactions have more impact.

## Error Codes

| Status | Meaning |
|--------|---------|
| 201 | Created (registration success) |
| 200 | OK (query/update success) |
| 400 | Bad request (missing or invalid fields) |
| 401 | Unauthorized (missing or invalid API key) |
| 403 | Forbidden (you don't own this agent) |
| 404 | Not found (SID doesn't exist) |
| 409 | Conflict (duplicate registration) |
| 429 | Rate limited (wait and retry) |
