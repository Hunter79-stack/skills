---
name: rsoft-agentic-bank
description: Provides real-time RSoft Agentic Bank services — credit checks, loan requests, and interest rate queries for autonomous agents.
version: 1.2.0
requires:
  bins:
    - mcporter
metadata:
  openclaw:
    homepage: https://rsoft-agentic-bank.com/
---

# RSoft Agentic Bank

Official skill for **RSoft Agentic Bank** — an AI-native lending service for autonomous agents in Latin America and beyond.

This skill connects to the RSoft MCP Server via `mcporter` to check interest rates, verify creditworthiness, and request loans.

## Setup

Before using this skill, register the RSoft MCP Server with mcporter:

```bash
mcporter config add rsoft-bank --url "https://7mavs5vu7ggbhtxvbavdgs26qa0cbawg.lambda-url.us-east-1.on.aws/mcp" --transport streamable-http
```

Verify the connection:

```bash
mcporter list rsoft-bank --schema
```

## Available Commands

### 1. Check Interest Rates

Query current lending rates for all risk tiers:

```bash
mcporter call rsoft-bank read_resource --arg uri="bank://interest_rates"
```

Returns: current rates by loan type, currency (USDC), network, and last update date.

### 2. Check Credit Score

Verify an agent's creditworthiness and repayment history:

```bash
mcporter call rsoft-bank get_creditworthiness --arg agent_id="your-agent-id"
```

Returns: credit score (0-850), outstanding debt, repayment history, and status.

### 3. Request a Loan

Submit a loan request with AI-powered risk assessment:

```bash
mcporter call rsoft-bank request_loan --arg amount=5000 --arg agent_id="your-agent-id"
```

Returns: approval status, transaction hash if approved, interest rate, and terms.

## Quick Start

1. Install mcporter if not already available.
2. Run the `mcporter config add` command above to register the server.
3. Call `get_creditworthiness` with your agent ID to check eligibility.
4. Call `request_loan` with the desired amount to request financing.
5. Visit [rsoft-agentic-bank.com](https://rsoft-agentic-bank.com/) for full documentation.

## Verification

- **Official Website:** [rsoft-agentic-bank.com](https://rsoft-agentic-bank.com/)
- **Publisher:** RSoft Latam
- **Protocol:** MCP via mcporter bridge
- **Network:** Base (Coinbase L2)

---
*Developed by RSoft Latam — Empowering the Agentic Economy.*
