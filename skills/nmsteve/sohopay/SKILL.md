---
name: sohopay
description: "Initiate payments on the SOHO Pay credit layer using EIP-712 signatures."
---

# SOHO Pay - Credit Layer Payments

This skill allows the agent to initiate payments through the SOHO Pay `Creditor` smart contract using the `spendWithAuthorization` EIP-712 flow.

The agent signs the payment authorization off-chain using a pre-configured wallet, and then submits the transaction to the network on the user's behalf.

## Core Command

The primary way to use this skill is with a natural language command:

`pay <amount> to <merchant>`

-   `<amount>`: The numerical amount to pay (e.g., `10`, `0.5`).
-   `<merchant>`: The recipient. This can be either:
    -   A full Ethereum address (`0x...`).
    -   A name (e.g., `amazon`). For demo purposes, if a name is provided, the skill will generate a **new random wallet address** to use as the recipient.

## Workflow

When triggered, the skill's script performs the following actions:

1.  **Parse Inputs**: Extracts the amount and merchant from the user's request.
2.  **Pre-Flight Checks**: Before signing, it runs a series of checks to ensure the transaction is likely to succeed:
    -   Verifies the borrower is registered and active.
    -   Checks if the borrower has a sufficient credit limit.
3.  **Generate Authorization**: Creates an EIP-712 typed data message for the payment.
4.  **Sign Off-Chain**: Uses the `borrower-1` wallet (from environment variables) to sign the authorization message.
5.  **Execute On-Chain**: Calls the `spendWithAuthorization` function on the `Creditor` contract, providing the signed message.
6.  **Report Result**: Returns the transaction hash to the user upon confirmation.

## Configuration

-   **Environment Variable**: The private key for the signing wallet **must** be available as an environment variable named `borrower-1`.
-   **Network**: All transactions are performed on the **Base Sepolia** testnet.

## Defaults

The following values are hardcoded into the script for consistency:

-   **Creditor Contract**: `0x669324C8c8011c3C0cA31faFBdD9C76219C06dB1`
-   **Borrower Manager**: `0xFdcb4abf261944383dbac37cB8E9147E50E2a609`
-   **Asset (USDC)**: `0x08B1797bB535C4cf86f93424137Cb3e004476624` (6 decimals)
-   **Payment Plan ID**: `0`

## Example Usage

> `pay 10 to amazon`

This command will trigger a payment of 10 USDC to a newly generated random address, signed by the `borrower-1` wallet.
