import { createPublicClient, formatUnits, getAddress, http, isAddress } from "viem";

import { BASE_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_EXPLORER_URL, BASE_SEPOLIA_RPC_URL } from "./chain";

const synTokenAddress = process.env.NEXT_PUBLIC_SYN_TOKEN_ADDRESS;

const baseSepoliaChain = {
  id: BASE_SEPOLIA_CHAIN_ID,
  name: "Base Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [BASE_SEPOLIA_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: BASE_SEPOLIA_EXPLORER_URL,
    },
  },
} as const;

const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
  },
] as const;

const publicClient = createPublicClient({
  chain: baseSepoliaChain,
  transport: http(BASE_SEPOLIA_RPC_URL),
});

export async function getSynBalance(walletAddress: string) {
  if (!synTokenAddress || !isAddress(synTokenAddress)) {
    throw new Error("NEXT_PUBLIC_SYN_TOKEN_ADDRESS est manquant ou invalide.");
  }

  if (!isAddress(walletAddress)) {
    throw new Error("Adresse wallet invalide.");
  }

  const [rawBalance, decimals] = await Promise.all([
    publicClient.readContract({
      address: getAddress(synTokenAddress),
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [getAddress(walletAddress)],
    }),
    publicClient.readContract({
      address: getAddress(synTokenAddress),
      abi: erc20Abi,
      functionName: "decimals",
    }),
  ]);

  return {
    rawBalance,
    decimals,
    formattedBalance: formatUnits(rawBalance, decimals),
  };
}