import { createPublicClient, http } from "viem";

async function main() {
  const hash = process.env.TX_HASH;

  if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    throw new Error("TX_HASH invalide ou manquant.");
  }

  const client = createPublicClient({
    chain: {
      id: 84532,
      name: "Base Sepolia",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: ["https://sepolia.base.org"] } },
    },
    transport: http("https://sepolia.base.org"),
  });

  const receipt = await client.getTransactionReceipt({
    hash: hash as `0x${string}`,
  });

  console.log({
    status: receipt.status,
    blockNumber: receipt.blockNumber.toString(),
    from: receipt.from,
    to: receipt.to,
    logsCount: receipt.logs.length,
    logs: receipt.logs.map((log) => ({
      address: log.address,
      topics: log.topics,
      data: log.data,
    })),
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});