import { createPublicClient, createWalletClient, formatUnits, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

async function main() {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const synoraAddress = process.env.SYNORA_ADDRESS;
  const rewardsDistributorAddress = process.env.REWARDS_DISTRIBUTOR_ADDRESS;
  const amountSyn = process.env.REWARDS_FUND_AMOUNT_SYN ?? "1000";

  if (!rpcUrl) {
    throw new Error("BASE_SEPOLIA_RPC_URL manquant.");
  }

  if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error("PRIVATE_KEY invalide ou manquante.");
  }

  if (!synoraAddress || !/^0x[a-fA-F0-9]{40}$/.test(synoraAddress)) {
    throw new Error("SYNORA_ADDRESS invalide ou manquante.");
  }

  if (!rewardsDistributorAddress || !/^0x[a-fA-F0-9]{40}$/.test(rewardsDistributorAddress)) {
    throw new Error("REWARDS_DISTRIBUTOR_ADDRESS invalide ou manquante.");
  }

  const chain = {
    id: 84532,
    name: "Base Sepolia",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
    },
  } as const;

  const erc20Abi = [
    {
      type: "function",
      name: "balanceOf",
      stateMutability: "view",
      inputs: [{ name: "account", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      type: "function",
      name: "transfer",
      stateMutability: "nonpayable",
      inputs: [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ name: "", type: "bool" }],
    },
  ] as const;

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  const amount = parseUnits(amountSyn, 18);

  const deployerBalanceBefore = await publicClient.readContract({
    address: synoraAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });

  const distributorBalanceBefore = await publicClient.readContract({
    address: synoraAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [rewardsDistributorAddress as `0x${string}`],
  });

  console.log(`Deployer: ${account.address}`);
  console.log(`SYNORA: ${synoraAddress}`);
  console.log(`RewardsDistributor: ${rewardsDistributorAddress}`);
  console.log(`Montant à transférer: ${amountSyn} SYN`);
  console.log(`Balance deployer avant: ${formatUnits(deployerBalanceBefore, 18)} SYN`);
  console.log(`Balance RewardsDistributor avant: ${formatUnits(distributorBalanceBefore, 18)} SYN`);

  if (deployerBalanceBefore < amount) {
    throw new Error("Balance SYN insuffisante sur le wallet deployer.");
  }

  const hash = await walletClient.writeContract({
    address: synoraAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "transfer",
    args: [rewardsDistributorAddress as `0x${string}`, amount],
  });

  console.log(`Transaction envoyée: ${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });

  console.log(`Transaction confirmée dans le bloc: ${receipt.blockNumber}`);

  const deployerBalanceAfter = await publicClient.readContract({
    address: synoraAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });

  const distributorBalanceAfter = await publicClient.readContract({
    address: synoraAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [rewardsDistributorAddress as `0x${string}`],
  });

  console.log(`Balance deployer après: ${formatUnits(deployerBalanceAfter, 18)} SYN`);
  console.log(`Balance RewardsDistributor après: ${formatUnits(distributorBalanceAfter, 18)} SYN`);
  console.log("Financement RewardsDistributor terminé.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});