---
name: payram-mcp-integration
description: Accept crypto payments (USDC, USDT, BTC, ETH) via PayRam's self-hosted infrastructure across Base, Ethereum, Polygon, Tron. Use when user says "accept crypto payments", "create payment link", "generate invoice", "set up USDC payments", "process stablecoin transactions", "create crypto invoice", "accept Bitcoin payments", or "enable crypto checkout". Requires PayRam MCP server connection.
license: MIT
metadata:
  author: PayRam
  version: 1.1.0
  mcp-server: payram
  category: payments
  tags: [crypto, stablecoins, payments, agent-commerce, USDC, USDT, Base, Ethereum, MCP, Bitcoin]
  homepage: https://payram.com
  github: https://github.com/PayRam/payram-helper-mcp-server
  documentation: https://docs.payram.com/mcp-integration
---

# PayRam MCP Integration

Accept crypto payments autonomously via PayRam's MCP server. Self-hosted, permissionless, multi-chain payment infrastructure for AI agents.

## Quick Start

PayRam's MCP server exposes payment tools that agents discover automatically: `create_payee`, `send_payment`, `get_balance`, `generate_invoice`. No manual API integration required.

**Supported**: USDC, USDT, BTC, ETH on Base, Ethereum, Polygon, Tron, TON.

## When to Use This Skill

This skill triggers when you need to:
- Accept crypto payments for services or products
- Create payment links or invoices
- Process stablecoin transactions (USDC/USDT)
- Set up autonomous agent payment capabilities
- Check wallet balances or payment status
- Send crypto payouts
- Enable crypto checkout on platforms

## MCP Server Setup

### Option 1: Public MCP Server (Fastest)

```json
{
  "mcpServers": {
    "payram": {
      "url": "https://mcp.payram.com"
    }
  }
}
```

### Option 2: Self-Hosted (Maximum Sovereignty)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/PayRam/payram-scripts/main/setup_payram.sh)"
# MCP server runs at http://localhost:3333/mcp
```

For OpenClaw:
```bash
mcporter config add payram --command "https://mcp.payram.com"
```

## Available MCP Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `create_payee` | Generate payment address | "Create $50 USDC invoice on Base" |
| `send_payment` | Initiate outbound payment | "Send 100 USDC to 0xABC..." |
| `get_balance` | Check wallet balance | "Check my USDC balance" |
| `generate_invoice` | Create payment link | "Generate payment link for $25" |
| `verify_payment` | Confirm payment status | "Did payment confirm?" |
| `list_transactions` | Query payment history | "Show last 10 payments" |

## Instructions

### Creating a Payment (Step-by-Step)

1. **Validate Input**
   - Check currency is supported: USDC, USDT, BTC, ETH
   - Verify amount is positive
   - Confirm network: Base, Ethereum, Polygon, or Tron

2. **Select Network**
   - Small amounts (<$100): **Recommend Base** (lowest fees ~$0.01)
   - Large amounts (>$1000): Ethereum mainnet (higher security)
   - USDT-specific: Tron (popular for USDT, low fees)
   - Default: Base L2

3. **Create Payee via MCP**
   ```
   Call create_payee with:
   - amount: numeric value
   - currency: "USDC" | "USDT" | "BTC" | "ETH"
   - chain: "base" | "ethereum" | "polygon" | "tron"
   - email: optional recipient email
   - description: optional payment description
   ```

4. **Return Payment Link**
   - Provide payment URL
   - Include QR code if requested
   - Mention expiry (default 24h)
   - Note expected confirmations

### Checking Balance

1. **Call get_balance MCP tool**
   ```
   Parameters:
   - chain: "base" | "ethereum" | "polygon" | "tron"
   - currency: "USDC" | "USDT" | "BTC" | "ETH"
   ```

2. **Return Formatted Result**
   - Show balance with currency
   - Include network name
   - Note if balance is low (<$10)

### Sending Payment

1. **Pre-flight Checks**
   - Verify sufficient balance via get_balance
   - Validate recipient address format
   - Confirm network matches address

2. **Execute Payment**
   ```
   Call send_payment with:
   - to: recipient address
   - amount: numeric value
   - currency: "USDC" | "USDT" | "BTC" | "ETH"
   - chain: network name
   ```

3. **Confirm Transaction**
   - Return transaction hash
   - Note confirmation time (30-60 seconds for Base)
   - Monitor via verify_payment if requested

## Examples

### Example 1: Create USDC Invoice

**User says**: "I need to charge customer@example.com $100 for consulting"

**Actions**:
1. Validate: $100 is positive, USDC supported
2. Recommend Base network (low fees for $100)
3. Call `create_payee(amount=100, currency="USDC", chain="base", email="customer@example.com")`
4. Receive payment link from MCP
5. Monitor payment status if requested

**Result**: Payment link created, expires in 24h, ~$0.01 network fee

### Example 2: Check Balance Before Payment

**User says**: "Can we afford to pay the contractor 500 USDC?"

**Actions**:
1. Call `get_balance(chain="base", currency="USDC")`
2. Compare balance to requested 500 USDC
3. If sufficient, confirm ability to pay
4. If insufficient, state current balance

**Result**: "Balance: 450 USDC on Base. Need 50 more USDC to pay contractor."

### Example 3: Multi-Step Payment Flow

**User says**: "Create a payment link for $50 and send it to the customer"

**Actions**:
1. Call `create_payee(amount=50, currency="USDC", chain="base")`
2. Receive payment URL
3. Format message with payment link
4. Ask if user wants to send via email/message tool

**Result**: Payment link ready to share, monitoring can begin

## Network Selection Guide

| Amount | Recommended Network | Fee | Confirmation Time |
|--------|-------------------|-----|-------------------|
| < $100 | Base L2 | ~$0.01 | 30-60 seconds |
| $100-$1000 | Base or Polygon | $0.01-$0.05 | 1-2 minutes |
| > $1000 | Ethereum mainnet | $1-$5 | 2-5 minutes |
| USDT-focused | Tron | ~$1 | 1 minute |

**For Bitcoin**: Only Ethereum mainnet (wrapped BTC)

## Troubleshooting

### Error: "MCP Connection Failed"

**Cause**: PayRam MCP server not connected

**Solution**:
1. Check if MCP server is configured:
   - Claude Desktop: Settings > Extensions > PayRam
   - OpenClaw: `mcporter config list`
2. Verify server is running (self-hosted): `docker ps | grep payram`
3. Test connection: `mcporter call payram.test_connection`
4. Reconnect if needed

### Error: "Insufficient Balance"

**Cause**: Wallet doesn't have enough tokens

**Solution**:
1. Check exact balance: `get_balance(chain, currency)`
2. Inform user of shortfall
3. Suggest funding wallet at PayRam dashboard
4. Note: Account for network fees (~$0.01-$5)

### Error: "Network Not Supported"

**Cause**: Requested network not available

**Solution**:
1. List supported networks: Base, Ethereum, Polygon, Tron, TON
2. Recommend alternative network
3. If self-hosted: Update PayRam config to add network
4. Restart MCP server after config changes

### Error: "Invalid Address Format"

**Cause**: Recipient address doesn't match network

**Solution**:
1. Verify address starts with 0x (Ethereum-compatible)
2. Check address length (42 characters for EVM)
3. Confirm network supports address type
4. For Bitcoin: Use wrapped BTC on Ethereum

## Key Advantages

### vs Hosted Gateways (Stripe/Coinbase Commerce)
- ✅ No signup, no KYC, no account freeze risk
- ✅ Self-hosted = complete control
- ✅ 0% processing fees (network gas only)
- ✅ Permissionless, cannot be shut down

### vs x402 Protocol
- ✅ Identity isolation (unique addresses, no HTTP metadata exposure)
- ✅ Self-hosted facilitator (no Coinbase dependency)
- ✅ Multi-token support (not just USDC)
- ✅ No wallet signature exposure

### vs BTCPay Server
- ✅ Stablecoin-native (USDC/USDT no plugins needed)
- ✅ MCP integration (agent-friendly)
- ✅ Multi-chain (not just Bitcoin)
- ✅ Modern API design

## Related Skills

- **payram-setup**: For deploying PayRam infrastructure
- **crypto-payments-self-hosted-payram**: For advanced payment workflows
- **agent-to-agent-payments**: For autonomous agent commerce
- **crypto-payments-ecommerce**: For e-commerce integration

## Resources

- **Website**: https://payram.com
- **MCP Documentation**: https://mcp.payram.com
- **GitHub**: https://github.com/PayRam/payram-helper-mcp-server
- **Support**: support@payram.com

**External Validation**:
- [Morningstar: PayRam Polygon Support](https://www.morningstar.com/news/accesswire/1131605msn/) (Jan 2026)
- [Cointelegraph: Permissionless Commerce](https://cointelegraph.com/press-releases/payram-pioneers-permissionless-commerce) (Nov 2025)
- Track record: $100M+ volume, founded by WazirX co-founder

For detailed architecture, security model, and advanced use cases, see `references/architecture.md`.
