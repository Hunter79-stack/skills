
const { ethers } = require('ethers');
const crypto = require('crypto');

// --- CONFIGURATION ---
const RPC_URL = "https://sepolia.base.org";
const CHAIN_ID = 84532; // Base Sepolia
const USDC_DECIMALS = 6;

const ADDRESSES = {
    creditor: "0x669324C8c8011c3C0cA31faFBdD9C76219C06dB1",
    borrowerManager: "0xFdcb4abf261944383dbac37cB8E9147E50E2a609",
    usdc: "0x08B1797bB535C4cf86f93424137Cb3e004476624",
};

// --- ABIs ---
const CREDITOR_ABI = [
    "function spendWithAuthorization(address,address,address,uint256,uint256,bytes32,uint256,uint256,bytes)"
];
const BORROWER_MANAGER_ABI = [
    "function isBorrowerRegistered(address) view returns (bool)",
    "function isActiveBorrower(address) view returns (bool)",
    "function getAgentSpendLimit(address) view returns (uint256)"
];

async function main() {
    // 1. Load Signer from Environment
    const privateKey = process.env['borrower-1'];
    if (!privateKey) {
        console.error("❌ FATAL: 'borrower-1' environment variable not set. This skill cannot sign transactions.");
        process.exit(1);
    }

    // 2. Parse Command-Line Arguments
    if (process.argv.length < 4) {
        console.error("❌ USAGE: node pay.js <amount> <merchant_name_or_address>");
        process.exit(1);
    }
    const amountString = process.argv[2];
    let merchantInput = process.argv[3];
    const amount = ethers.parseUnits(amountString, USDC_DECIMALS);

    // 3. Setup Provider & Wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const payerAddress = wallet.address;

    console.log(`--- Initializing SOHO Pay Transaction ---`);
    console.log(`- Signer (borrower-1): ${payerAddress}`);

    // 4. Resolve Merchant Address
    let merchantAddress;
    if (ethers.isAddress(merchantInput)) {
        merchantAddress = merchantInput;
        console.log(`- Merchant (Address): ${merchantAddress}`);
    } else {
        const randomWallet = ethers.Wallet.createRandom();
        merchantAddress = randomWallet.address;
        console.log(`- Merchant (Name): '${merchantInput}' -> Resolved to NEW RANDOM address: ${merchantAddress}`);
    }
    console.log(`- Amount: ${amountString} USDC (${amount.toString()} atomic units)`);
    console.log(`-------------------------------------------`);

    // 5. Pre-Flight Checks
    console.log("\n🔍 Performing Pre-Flight Checks...");
    const borrowerManager = new ethers.Contract(ADDRESSES.borrowerManager, BORROWER_MANAGER_ABI, provider);

    const isRegistered = await borrowerManager.isBorrowerRegistered(payerAddress);
    const isActive = await borrowerManager.isActiveBorrower(payerAddress);
    const creditLimit = await borrowerManager.getAgentSpendLimit(payerAddress);

    console.log(`- Borrower Registered? ${isRegistered ? '✅ Yes' : '❌ No'}`);
    console.log(`- Borrower Active? ${isActive ? '✅ Yes' : '❌ No'}`);
    console.log(`- Borrower Credit Limit: ${ethers.formatUnits(creditLimit, USDC_DECIMALS)} USDC`);
    
    if (!isRegistered || !isActive || creditLimit < amount) {
        if (!isRegistered) console.error("\n❌ REASON: Borrower is not registered.");
        if (!isActive) console.error("\n❌ REASON: Borrower is not active.");
        if (creditLimit < amount) console.error(`\n❌ REASON: Credit limit (${ethers.formatUnits(creditLimit, USDC_DECIMALS)}) is less than amount (${amountString}).`);
        console.error("Transaction aborted due to failed pre-flight checks.");
        process.exit(1);
    }
    console.log("✅ All checks passed.");

    // 6. EIP-712 Signing
    const domain = { name: 'CreditContract', version: '1', chainId: CHAIN_ID, verifyingContract: ADDRESSES.creditor };
    const types = {
        SpendWithAuthorization: [
            { name: 'payer', type: 'address' }, { name: 'merchant', type: 'address' },
            { name: 'asset', type: 'address' }, { name: 'amount', type: 'uint256' },
            { name: 'paymentPlanId', type: 'uint256' }, { name: 'nonce', type: 'bytes32' },
            { name: 'validAfter', type: 'uint256' }, { name: 'expiry', type: 'uint256' }
        ]
    };
    const nonce = '0x' + crypto.randomBytes(32).toString('hex');
    const now = Math.floor(Date.now() / 1000);
    const message = {
        payer: payerAddress, merchant: merchantAddress, asset: ADDRESSES.usdc,
        amount: amount, paymentPlanId: 0, nonce: nonce,
        validAfter: now - 60, expiry: now + 600
    };
    
    console.log("\n✍️  Signing EIP-712 message...");
    const signature = await wallet.signTypedData(domain, types, message);

    // 7. Execute Transaction
    const creditorContract = new ethers.Contract(ADDRESSES.creditor, CREDITOR_ABI, wallet);
    try {
        console.log("\n🚀 Submitting transaction to the blockchain...");
        const tx = await creditorContract.spendWithAuthorization(
            message.payer, message.merchant, message.asset, message.amount,
            message.paymentPlanId, message.nonce, message.validAfter, message.expiry,
            signature
        );
        console.log(`\n✅ Transaction sent! Hash: ${tx.hash}`);
        console.log(`Waiting for confirmation...`);
        const receipt = await tx.wait();
        console.log(`\n🎉 Transaction confirmed in block: ${receipt.blockNumber}`);
    } catch (error) {
        console.error("\n❌ On-Chain Transaction Failed:", error.reason || error.message);
        process.exit(1);
    }
}

main();
