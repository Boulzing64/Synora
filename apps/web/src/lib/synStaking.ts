import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  http,
  parseUnits,
} from "viem";

import { BASE_SEPOLIA_CHAIN } from "./chain";

const SYN_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SYN_TOKEN_ADDRESS;
const SYN_STAKING_ADDRESS = process.env.NEXT_PUBLIC_SYN_STAKING_ADDRESS;

const erc20Abi = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const stakingAbi = [
  {
    type: "function",
    name: "stake",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "unstake",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "stakedBalanceOf",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalStaked",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function ensureAddresses() {
  if (!SYN_TOKEN_ADDRESS) {
    throw new Error("NEXT_PUBLIC_SYN_TOKEN_ADDRESS manquant.");
  }

  if (!SYN_STAKING_ADDRESS) {
    throw new Error("NEXT_PUBLIC_SYN_STAKING_ADDRESS manquant.");
  }

  return {
    synTokenAddress: SYN_TOKEN_ADDRESS as `0x${string}`,
    synStakingAddress: SYN_STAKING_ADDRESS as `0x${string}`,
  };
}

function getPublicClient() {
  return createPublicClient({
    chain: BASE_SEPOLIA_CHAIN,
    transport: http(BASE_SEPOLIA_CHAIN.rpcUrls.default.http[0]),
  });
}

function getWalletClient() {
  if (!window.ethereum) {
    throw new Error("MetaMask est introuvable.");
  }

  return createWalletClient({
    chain: BASE_SEPOLIA_CHAIN,
    transport: custom(window.ethereum),
  });
}

export async function getStakingOnChainProfile(walletAddress: string) {
  const { synStakingAddress } = ensureAddresses();
  const publicClient = getPublicClient();

  const [stakedBalance, totalStaked] = await Promise.all([
    publicClient.readContract({
      address: synStakingAddress,
      abi: stakingAbi,
      functionName: "stakedBalanceOf",
      args: [walletAddress as `0x${string}`],
    }),
    publicClient.readContract({
      address: synStakingAddress,
      abi: stakingAbi,
      functionName: "totalStaked",
    }),
  ]);

  return {
    stakedBalance,
    totalStaked,
    formattedStakedBalance: formatUnits(stakedBalance, 18),
    formattedTotalStaked: formatUnits(totalStaked, 18),
  };
}

export async function getSynStakingAllowance(walletAddress: string) {
  const { synTokenAddress, synStakingAddress } = ensureAddresses();
  const publicClient = getPublicClient();

  return publicClient.readContract({
    address: synTokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [walletAddress as `0x${string}`, synStakingAddress],
  });
}

export async function approveSynForStaking(params: {
  walletAddress: string;
  amountSyn: string;
}) {
  const { synTokenAddress, synStakingAddress } = ensureAddresses();
  const walletClient = getWalletClient();

  const amount = parseUnits(params.amountSyn, 18);

  return walletClient.writeContract({
    address: synTokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    account: params.walletAddress as `0x${string}`,
    args: [synStakingAddress, amount],
  });
}

export async function stakeSyn(params: {
  walletAddress: string;
  amountSyn: string;
}) {
  const { synStakingAddress } = ensureAddresses();
  const walletClient = getWalletClient();

  const amount = parseUnits(params.amountSyn, 18);

  return walletClient.writeContract({
    address: synStakingAddress,
    abi: stakingAbi,
    functionName: "stake",
    account: params.walletAddress as `0x${string}`,
    args: [amount],
  });
}

export async function unstakeSyn(params: {
  walletAddress: string;
  amountSyn: string;
}) {
  const { synStakingAddress } = ensureAddresses();
  const walletClient = getWalletClient();

  const amount = parseUnits(params.amountSyn, 18);

  return walletClient.writeContract({
    address: synStakingAddress,
    abi: stakingAbi,
    functionName: "unstake",
    account: params.walletAddress as `0x${string}`,
    args: [amount],
  });
}