---
name: pocket-money
description: Give your AI agent crypto wallets so it can pay for x402 services. Create purpose-specific wallets, ask your human to fund each one, then spend with human approval via the x402 protocol. No accounts, no KYC — just wallet addresses and USDC on Base.
---

# Pocket Money — Fund Your Agent's Wallets

You have a tool that lets you create crypto wallets (USDC on Base) and use them to pay for x402-enabled services like AutEng Compute. Each wallet is a separate keypair with its own balance — create one per purpose or budget.

**Package**: [`@auteng/agent-utils`](https://www.npmjs.com/package/@auteng/agent-utils) — published by AutEng ([source on GitHub](https://github.com/operator-auteng-ai/agent-utils)).

## Setup (first time only)

Install the agent utils library:

```bash
npm install @auteng/agent-utils
```

## Creating a Wallet

Create a named wallet for each purpose or budget:

```typescript
import { wallet } from '@auteng/agent-utils';

const w = await wallet.create({ name: "feb-2026-compute" });
console.log(w.address); // 0xABC123...
```

If a wallet with that name already exists on disk, it loads it. Each wallet is stored at `.auteng/wallets/<name>.json`.

You can also create a quick default wallet:

```typescript
const w = await wallet.create();
```

## Requesting Funding

When you need money, ask your human to fund a specific wallet:

```
I need $12 in USDC for today's compute tasks.

Please send USDC on **Base** to this address:
`0xABC123...` (wallet: "feb-2026-compute")

You can send from Coinbase, an exchange, or any wallet that supports Base.
```

Be specific about:
- **How much** you need and **why** (e.g., "$5 for API calls", "$20 for a batch processing job")
- **Which wallet** (by name) so both you and your human can track budgets
- The **network**: always Base (not Ethereum mainnet, not Arbitrum)
- The **token**: USDC (not ETH, not other tokens)

## Waiting for Funding

After asking, wait for the USDC to arrive:

```typescript
await w.waitForFunding(12_000000n);
// Polls Base every 10s until >= 12 USDC is available
```

Tell your human you're waiting — they may need a minute to complete the transfer.

## Human Approval Before Spending

**IMPORTANT**: Before making any payment or running any compute job, you MUST:

1. Tell your human exactly what you're about to spend and why
2. Show the estimated cost (use `compute.pricing()` to look up prices)
3. **Wait for explicit human approval** before proceeding

Example:

```
I'd like to run a Python script on sandboxed compute.

  Size:  small (2 vCPU, 1GB RAM)
  Cost:  ~$0.002 (base) + runtime
  Wallet: "feb-2026-compute" ($0.98 remaining)

OK to proceed?
```

Never batch multiple paid operations without listing them first. If running a loop of paid calls, present the total estimated cost upfront and get approval for the batch.

## Running Compute

Once funded and approved by your human, pass the wallet to compute:

```typescript
import { compute } from '@auteng/agent-utils';

const result = await compute.run({
  code: 'print("hello world")',
  stack: 'python',
  size: 'small',
  wallet: w,
});
console.log(result.stdout);  // "hello world\n"
```

Payment is handled automatically via x402. Available stacks: `python`, `node`. Sizes: `small`, `med`, `large`.

## Spending via x402 (any service)

For any x402-enabled service, use the wallet's `fetch()` as a drop-in replacement:

```typescript
const res = await w.fetch('https://x402.auteng.ai/api/x402/compute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'print("hello world")',
    stack: 'python',
    size: 'small',
  }),
});
```

If the service returns `402 Payment Required`, the library automatically signs a payment authorization and retries. No blockchain transaction needed — the payment is settled server-side.

## Managing Multiple Wallets

```typescript
// Retrieve an existing wallet by name
const w = wallet.get("feb-2026-compute");

// List all wallets
const all = wallet.list();
for (const w of all) {
  const bal = await w.checkBalance();
  console.log(`${w.name}: ${w.address} — ${bal} USDC`);
}
```

## Checking Balance

```typescript
const balance = await w.checkBalance();
// Returns USDC in minor units (6 decimals)
// e.g., 12_000000n = $12.00
```

If running low, ask your human for more funding before expensive operations.

## Important Notes

- **Always get human approval** before any operation that spends funds
- Your wallets only need **USDC on Base** — no ETH needed for gas
- Wallet private keys are stored locally at `.auteng/wallets/<name>.json` with restricted permissions (0600). If lost, the funds are gone
- Only fund wallets with small amounts appropriate for the task — treat them as petty cash, not savings
- Create separate wallets for separate budgets so you and your human can track spending
- Check pricing before spending: `compute.pricing()`
