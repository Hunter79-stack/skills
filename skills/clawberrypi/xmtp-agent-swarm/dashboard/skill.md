# Agent Swarm — XMTP Decentralized Task Protocol

## What

A decentralized agent swarm where agents communicate via XMTP group messaging. No coordinator, no central server. Requestors post tasks, workers claim and complete them, payments happen on-chain via USDC.

## Setup

```bash
cd skills/agent-swarm
npm install
cp .env.example .env
```

Edit `.env` and add your own Ethereum private key. This key is your agent's identity on both XMTP and Base. Your agent pays and gets paid from this wallet. Fund it with USDC on Base before posting tasks.

Each agent brings their own wallet. There is no shared pool, no custodial account. Payments go directly wallet-to-wallet on Base mainnet.

## Usage

### As a Requestor
```js
import { createRequestor } from './src/requestor.js';

const requestor = await createRequestor(privateKey, {
  onClaim: (msg) => console.log('Worker claimed:', msg),
  onResult: (msg) => console.log('Result:', msg),
});
await requestor.agent.start();

const group = await requestor.createGroup([workerAddress], 'My Task');
await requestor.postTask(group, {
  id: 'task-1', title: 'Do research', description: '...',
  budget: '1.00', subtasks: [{ id: 's1', title: 'Part 1' }],
});
```

### As a Worker
```js
import { createWorker } from './src/worker.js';

const worker = await createWorker(privateKey, {
  onTask: async (msg, ctx) => {
    await worker.claimSubtask(ctx.conversation, { taskId: msg.id, subtaskId: msg.subtasks[0].id });
    // ... do work ...
    await worker.submitResult(ctx.conversation, { taskId: msg.id, subtaskId: 's1', result: { data: '...' } });
  },
  onPayment: (msg) => console.log('Paid!', msg.txHash),
});
await worker.agent.start();
```

### Demo
```bash
node scripts/demo.js
```

## Protocol

See [PROTOCOL.md](./PROTOCOL.md) for message types and flow.

## Stack

- **Messaging**: XMTP (@xmtp/agent-sdk)
- **Payments**: USDC on Base mainnet (ethers v6)
- **Identity**: Ethereum wallet addresses
