import { createWalletClient, custom } from "viem";

import { BASE_SEPOLIA_CHAIN } from "./chain";

const REWARDS_DISTRIBUTOR_ADDRESS =
  process.env.NEXT_PUBLIC_REWARDS_DISTRIBUTOR_ADDRESS;

const rewardsDistributorAbi = [
  {
    type: "function",
    name: "claimWithSignature",
    stateMutability: "nonpayable",
    inputs: [
      { name: "rewardId", type: "bytes32" },
      { name: "wallet", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

export async function claimRewardOnChain(params: {
  walletAddress: string;
  rewardId: string;
  amount: string;
  signature: string;
}) {
  if (!window.ethereum) {
    throw new Error("MetaMask est introuvable.");
  }

  if (!REWARDS_DISTRIBUTOR_ADDRESS) {
    throw new Error("NEXT_PUBLIC_REWARDS_DISTRIBUTOR_ADDRESS manquant.");
  }

  const walletClient = createWalletClient({
    chain: BASE_SEPOLIA_CHAIN,
    transport: custom(window.ethereum),
  });

  const hash = await walletClient.writeContract({
    address: REWARDS_DISTRIBUTOR_ADDRESS as `0x${string}`,
    abi: rewardsDistributorAbi,
    functionName: "claimWithSignature",
    account: params.walletAddress as `0x${string}`,
    args: [
      params.rewardId as `0x${string}`,
      params.walletAddress as `0x${string}`,
      BigInt(params.amount),
      params.signature as `0x${string}`,
    ],
  });

  return hash;
}