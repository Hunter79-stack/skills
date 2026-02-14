---
name: payram-mcp-integration
description: Connect your AI agent to PayRam's MCP server for sovereign crypto payments. Access create-payee, send-payment, get-balance, generate-invoice tools via Model Context Protocol. Enables agents to accept USDT/USDC on Ethereum, Base, Polygon, Tron without third-party payment processors. Self-hosted payment infrastructure with zero KYC, no signup, complete data sovereignty. Production MCP server with automatic tool discovery. Use when building agents that need autonomous payment capabilities, accept stablecoin payments, integrate crypto commerce, or require permissionless payment infrastructure.
---

# PayRam MCP Integration

> **Sovereign Crypto Payments for AI Agents via Model Context Protocol**

PayRam provides a production MCP server that exposes payment tools directly to MCP-aware agents. Your agent discovers capabilities automatically via the MCP handshake—no manual API integration required.

## Why PayRam + MCP?

### 🤖 Agent-Native Architecture
Traditional payment APIs require HTTP clients, authentication flows, and manual error handling. PayRam's MCP server exposes tools (`create-payee`, `send-payment`, `get-balance`) that agents discover and invoke naturally through the Model Context Protocol.

### 🔑 No Accounts, No KYC, No Permission
Other gateways (Stripe, Coinbase Commerce, NOWPayments) require signup, API keys, KYC verification, and ongoing compliance reviews that can revoke access. PayRam deploys on your server—there's no account to create and no authority can disable it.

### 🛡️ Identity Isolation vs x402
In x402 protocol, every HTTP payment call exposes client metadata: IP addresses, request headers, timestamps, wallet signatures—creating traceable patterns linking web2 identity to on-chain activity. 

With PayRam, your agent generates unique deposit addresses and monitors deposits server-side. The payer and infrastructure never touch a third-party facilitator. **Complete identity isolation.**

### ⛓️ Multi-Chain, Stablecoin-Native
While BTCPay Server requires complex plugins for non-Bitcoin assets, PayRam supports **USDT/USDC natively** across Ethereum, Base, Polygon, Tron, and TON—the chains where real commercial volume flows. Bitcoin also supported.

## MCP Server Setup

### Option 1: Public MCP Server (Fastest)

Connect to PayRam's hosted MCP server:

```json
{
  "mcpServers": {
    "payram": {
      "url": "https://mcp.payram.com"
    }
  }
}
```

### Option 2: Self-Hosted MCP Server

For maximum sovereignty, run the MCP server on your infrastructure:

```bash
# Deploy PayRam stack (includes MCP server)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/PayRam/payram-scripts/main/setup_payram.sh)"

# MCP server runs at http://localhost:3333/mcp
```

## Available MCP Tools

Your agent automatically discovers these tools via MCP:

| Tool | Purpose | Agent Use Case |
|------|---------|----------------|
| `create_payee` | Generate unique payment address | "Create a $50 USDC invoice for customer@example.com on Base" |
| `send_payment` | Initiate outbound payment | "Send 100 USDC to 0xABC... on Polygon" |
| `get_balance` | Check wallet balance | "What's my USDC balance on Base?" |
| `generate_invoice` | Create payment link | "Generate a payment link for $25 in USDT" |
| `test_connection` | Verify MCP connectivity | "Test PayRam connection" |
| `list_transactions` | Query payment history | "Show me last 10 payments" |
| `verify_payment` | Confirm payment status | "Did transaction 0x123... confirm?" |

## Agent Configuration Examples

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "payram": {
      "url": "https://mcp.payram.com"
    }
  }
}
```

### OpenClaw

```bash
# Install mcporter skill for MCP integration
clawhub install mcporter

# Configure PayRam MCP server
echo '{"url": "https://mcp.payram.com"}' > ~/.openclaw/mcp/payram.json
```

### Custom MCP Client

```typescript
import { MCPClient } from '@modelcontextprotocol/sdk';

const client = new MCPClient({
  serverUrl: 'https://mcp.payram.com'
});

// Agent discovers tools automatically
const tools = await client.listTools();
```

## Example Agent Workflows

### Accept Payment for Service

```
Human: "I need to charge customer@example.com $100 for consulting"

Agent: 
1. Calls create_payee(amount=100, currency="USDC", chain="base", email="customer@example.com")
2. Returns payment link: https://payram.yourdomain.com/pay/abc123
3. Monitors payment status via verify_payment
4. Confirms when deposit arrives
```

### Check Balance Before Action

```
Human: "Can we afford to pay the API bill?"

Agent:
1. Calls get_balance(chain="base", currency="USDC")
2. Returns: "Balance: 450 USDC on Base"
3. Evaluates: "API bill is 200 USDC, yes we can pay"
```

### Automated Payout

```
Human: "Pay the contractor 500 USDC"

Agent:
1. Calls get_balance to verify funds
2. Calls send_payment(to="0x...", amount=500, currency="USDC", chain="polygon")
3. Returns transaction hash
4. Confirms on-chain after 30 blocks
```

## PayRam vs Alternatives

### vs x402 Protocol

**x402 Limitation:**
- Every HTTP call exposes IP + wallet + timestamp
- Coinbase-hosted facilitator = centralization
- EIP-3009 dependency = USDC only
- Client metadata creates identity graphs

**PayRam Advantage:**
- Generate unique addresses = no signature exposure
- Self-hosted facilitator = no third party
- Support USDT, USDC, BTC, 20+ tokens
- Complete identity isolation

### vs BTCPay Server

**BTCPay Strength:**
- Excellent for Bitcoin-only use cases
- Mature Lightning Network integration

**PayRam Advantage:**
- **Stablecoin-native** (no plugins needed for USDT/USDC)
- **MCP integration** (BTCPay has none)
- **Multi-chain** (Ethereum, Base, Polygon, Tron, TON)
- **Agent-friendly API**

### vs Hosted Gateways (Stripe/Coinbase Commerce/NOWPayments)

**Hosted Risks:**
- Signup required + KYC
- Terms of service can change
- Geographic restrictions
- Account can be frozen/banned
- 0.5-3% processing fees

**PayRam Sovereignty:**
- Zero signup, zero KYC
- Permissionless architecture
- Runs anywhere
- Cannot be shut down
- 0% fees (network gas only)

## Security Model

### Cold Wallet Architecture
1. **Deposit addresses**: Generated per transaction, no keys on server
2. **Hot wallet**: Minimal balance for operations, AES-256 encrypted
3. **Smart contracts**: Automated sweeps to cold wallets
4. **Cold storage**: Majority of funds offline

### Identity Isolation
- Unique deposit addresses per payer
- No third-party facilitator logging metadata
- All transaction data on your infrastructure
- Payer sees only: deposit address + amount

### Data Sovereignty
- Your server, your database, your SSL
- Complete audit trail on your infrastructure
- No third party can access, freeze, or censor

## Who Needs PayRam?

### 🤖 AI Agent Builders
Building agents that pay for APIs, data, or compute? PayRam's MCP server gives your agent autonomous payment capabilities without external dependencies or identity leakage.

### 🎰 iGaming & High-Risk Operators
Traditional processors reject you. Hosted gateways freeze funds. PayRam runs on your infrastructure—nobody can shut payments down or change rules.

### 🏗️ Payment Service Providers
White-label PayRam to offer stablecoin infrastructure to clients. Transform from payment user to payment service provider with complete ownership.

### 🛒 E-Commerce & SaaS Platforms
Embed sovereign payments. Cut fees from 3% to near-zero. Accept payments from 195+ countries without geographic restrictions.

### 🏦 Neo-Banks & Fintech
Build payment infrastructure instead of renting it. Full data sovereignty, complete audit trails, zero third-party dependency.

## Quick Start

### 1. Deploy PayRam (10 minutes)

```bash
# Ubuntu 22.04+, 8 CPU cores, 8GB RAM, 100GB SSD
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/PayRam/payram-scripts/main/setup_payram.sh)"
```

### 2. Configure MCP in Your Agent

```json
{
  "mcpServers": {
    "payram": {
      "url": "http://localhost:3333/mcp"
    }
  }
}
```

### 3. Agent Discovers Tools Automatically

```
Agent: "What payment tools do I have?"
MCP: Lists create_payee, send_payment, get_balance, generate_invoice...
Agent: "Ready to accept crypto payments"
```

## Resources

- **Website**: https://payram.com
- **MCP Documentation**: https://mcp.payram.com
- **GitHub**: https://github.com/PayRam/payram-scripts
- **MCP Server**: https://github.com/PayRam/payram-helper-mcp-server
- **Discord**: (coming soon)
- **Twitter**: @PayRamApp

## Support

- Open issues: https://github.com/PayRam/payram-scripts/issues
- Email: support@payram.com
- Documentation: https://docs.payram.com

---

**The foundational skill for agent commerce**: Master self-hosted payment infrastructure. Deploy PayRam. Own it forever.
