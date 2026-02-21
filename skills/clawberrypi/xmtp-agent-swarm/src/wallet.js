// wallet.js — Wallet utilities for Base mainnet USDC transfers
import { ethers } from 'ethers';

const BASE_RPC = process.env.RPC_URL || 'https://mainnet.base.org';
const USDC_ADDRESS = process.env.USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

/** Create a provider for Base mainnet */
export function getProvider() {
  return new ethers.JsonRpcProvider(BASE_RPC);
}

/** Create a wallet from a private key */
export function loadWallet(privateKey) {
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

/** Load wallet from .env WALLET_PRIVATE_KEY */
export function loadWalletFromEnv() {
  const key = process.env.WALLET_PRIVATE_KEY;
  if (!key) throw new Error('WALLET_PRIVATE_KEY not set in environment');
  return loadWallet(key);
}

/** Get USDC balance for an address (returns human-readable string) */
export async function getUSDCBalance(address) {
  const provider = getProvider();
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
  const [balance, decimals] = await Promise.all([usdc.balanceOf(address), usdc.decimals()]);
  return ethers.formatUnits(balance, decimals);
}

/** Transfer USDC from wallet to recipient. Returns tx hash. */
export async function transferUSDC(wallet, to, amountHuman) {
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);
  const decimals = await usdc.decimals();
  const amount = ethers.parseUnits(amountHuman.toString(), decimals);
  const tx = await usdc.transfer(to, amount);
  await tx.wait();
  return tx.hash;
}
