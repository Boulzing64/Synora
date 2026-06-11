import { privateKeyToAccount } from "viem/accounts";
import { getAddress, isAddress, keccak256, parseUnits, stringToHex } from "viem";

export type RewardAuthorization = {
  rewardId: string;
  walletAddress: string;
  amount: string;
  signature: string;
  verifyingContract: string;
  chainId: number;
};

const rewardAuthorizationTypes = {
  RewardClaim: [
    { name: "rewardId", type: "bytes32" },
    { name: "wallet", type: "address" },
    { name: "amount", type: "uint256" },
  ],
} as const;

export function createDailyMvpRewardId(walletAddress: string, date = new Date()) {
  const normalizedWallet = getAddress(walletAddress);
  const utcDay = date.toISOString().slice(0, 10);

  return keccak256(stringToHex(`SYNORA:MVP_REWARD:${normalizedWallet}:${utcDay}`));
}

export function createBetaRewardId(walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);

  return keccak256(stringToHex(`SYNORA:FOUNDING_BETA:${normalizedWallet}`));
}

export async function createRewardAuthorization(params: {
  rewardId: string;
  walletAddress: string;
  amountSyn: number;
}) {
  const signerPrivateKey = process.env.REWARDS_SIGNER_PRIVATE_KEY;
  const verifyingContract = process.env.REWARDS_DISTRIBUTOR_ADDRESS;
  const chainId = Number(process.env.REWARDS_CHAIN_ID ?? 84532);

  if (!signerPrivateKey || !/^0x[a-fA-F0-9]{64}$/.test(signerPrivateKey)) {
    throw new Error("REWARDS_SIGNER_PRIVATE_KEY manquant ou invalide.");
  }

  if (!verifyingContract || !isAddress(verifyingContract)) {
    throw new Error("REWARDS_DISTRIBUTOR_ADDRESS manquant ou invalide.");
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(params.rewardId)) {
    throw new Error("rewardId invalide.");
  }

  if (!isAddress(params.walletAddress)) {
    throw new Error("walletAddress invalide.");
  }

  const account = privateKeyToAccount(signerPrivateKey as `0x${string}`);
  const walletAddress = getAddress(params.walletAddress);
  const amount = parseUnits(String(params.amountSyn), 18);

  const domain = {
    name: "SYNORA Rewards",
    version: "1",
    chainId,
    verifyingContract: getAddress(verifyingContract),
  } as const;

  const message = {
    rewardId: params.rewardId as `0x${string}`,
    wallet: walletAddress,
    amount,
  } as const;

  const signature = await account.signTypedData({
    domain,
    types: rewardAuthorizationTypes,
    primaryType: "RewardClaim",
    message,
  });

  return {
    rewardId: params.rewardId,
    walletAddress,
    amount: amount.toString(),
    signature,
    verifyingContract: getAddress(verifyingContract),
    chainId,
  } satisfies RewardAuthorization;
}
