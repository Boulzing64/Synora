import { createPublicClient, formatUnits, http } from "viem";

async function main() {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";
  const synoraAddress = process.env.SYNORA_ADDRESS;
  const walletAddress = process.env.CHECK_WALLET_ADDRESS;

  if (!synoraAddress || !/^0x[a-fA-F0-9]{40}$/.test(synoraAddress)) {
    throw new Error("SYNORA_ADDRESS invalide ou manquante.");
  }

  if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    throw new Error("CHECK_WALLET_ADDRESS invalide ou manquante.");
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
      name: "symbol",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "string" }],
    },
  ] as const;

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const symbol = await publicClient.readContract({
    address: synoraAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "symbol",
  });

  const balance = await publicClient.readContract({
    address: synoraAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [walletAddress as `0x${string}`],
  });

  console.log(`Wallet: ${walletAddress}`);
  console.log(`Token: ${synoraAddress}`);
  console.log(`Balance: ${formatUnits(balance, 18)} ${symbol}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});