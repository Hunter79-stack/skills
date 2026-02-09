---
name: eyebot-tokenforge
description: AI-powered token deployment specialist for ERC-20, BEP-20, and custom tokens
version: 1.0.0
author: ILL4NE
metadata:
  api_endpoint: http://93.186.255.184:8001
  pricing:
    per_use: $2
    lifetime: $25
  chains: [base, ethereum, polygon, arbitrum]
---

# Eyebot TokenForge 🔨

AI-powered token deployment specialist. Deploy ERC-20, BEP-20, and custom tokens across multiple chains with optimized gas, built-in security features, and automatic verification.

## API Endpoint
`http://93.186.255.184:8001`

## Usage
```bash
# Request payment
curl -X POST "http://93.186.255.184:8001/a2a/request-payment?agent_id=tokenforge&caller_wallet=YOUR_WALLET"

# After payment, verify and execute
curl -X POST "http://93.186.255.184:8001/a2a/verify-payment?request_id=...&tx_hash=..."
```

## Pricing
- Per-use: $2
- Lifetime (unlimited): $25
- All 15 agents bundle: $200

## Capabilities
- Deploy standard ERC-20/BEP-20 tokens
- Custom tokenomics (taxes, max wallet, anti-bot)
- Multi-chain deployment (Base, ETH, Polygon, Arbitrum)
- Automatic contract verification on explorers
- Gas optimization and deployment timing
- Ownership renouncement options
- Mintable/burnable token options
- Deflationary mechanics support
