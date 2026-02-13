# Security Policy

## Wallet Security

### Private Key Storage

The Apiosk skill stores wallet private keys in `~/.apiosk/wallet.json` with restrictive file permissions (chmod 600). **The private key is stored in plaintext.**

**This is suitable for:**
- Testing and development
- Small amounts ($1-10 USDC)
- Proof-of-concept usage

**This is NOT suitable for:**
- Production use with large amounts
- Shared/multi-user systems
- Long-term key storage

### Recommended Production Setup

For production usage, use one of these alternatives:

1. **Hardware Wallet**
   - Ledger or Trezor
   - Requires modification of skill scripts
   - Contact support for integration guide

2. **External Key Management**
   - AWS KMS, Google Cloud KMS, HashiCorp Vault
   - Requires custom integration
   - Recommended for enterprise deployments

3. **Hot Wallet with Monitoring**
   - Generate wallet with `./setup-wallet.sh`
   - Fund with ONLY the amount you need for immediate use
   - Monitor balance: `./check-balance.sh`
   - Set up alerts for unusual activity

### Payment Verification

**How x402 works:**
- The gateway validates payments by checking the blockchain directly
- Your wallet address is sent with each request (for payment association)
- The gateway verifies on-chain that your address has paid the required amount
- **Your private key is NEVER transmitted** - only your public wallet address is sent

**Why the private key exists:**
- The private key is stored locally for future use cases (e.g., withdrawals, refunds)
- Currently, API calls only send your wallet address, not the private key
- The gateway performs on-chain verification without needing your signature
- This is a simplified implementation - full x402 may require client-side signing in the future

**Security implications:**
- Even though the private key isn't currently used for API calls, it's still a sensitive secret
- If compromised, someone could drain the wallet's USDC balance
- Always fund with only small amounts ($1-10) for testing
- For production, implement external key management or hardware wallet integration

### Dependencies

The skill requires Foundry (cast command) for wallet generation. Install manually:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Why manual installation is recommended:**
- Allows you to review the installer script before running
- Gives you control over when/how dependencies are installed
- Reduces risk of supply chain attacks

### Network Security

The skill communicates with:
- `https://gateway.apiosk.com` - Apiosk API gateway (HTTPS only)
- Base mainnet RPC - On-chain verification
- No other external services

### Best Practices

1. **Start small:** Test with $1-5 USDC first
2. **Monitor usage:** Run `./usage-stats.sh` regularly
3. **Check balance:** Run `./check-balance.sh` before large operations
4. **Backup wallet:** Keep a secure backup of `~/.apiosk/wallet.json`
5. **Never share:** Don't share your private key with anyone
6. **Use dedicated wallet:** Don't reuse wallets from other services

### Reporting Security Issues

If you discover a security vulnerability, please email:
- **Security contact:** olivier@walhallah.com
- **Subject:** [SECURITY] Apiosk Skill Vulnerability

**Please do NOT open public GitHub issues for security vulnerabilities.**

We will respond within 48 hours and work with you to address the issue.

### Security Audit Status

**Current status:** Not audited

This skill has not undergone a professional security audit. Use at your own risk.

If you would like to sponsor a security audit, please contact us.

### License

MIT License - See LICENSE file for details.

**Disclaimer:** This software is provided "as is" without warranty of any kind. Use at your own risk.
