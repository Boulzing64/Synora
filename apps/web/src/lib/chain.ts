export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_CHAIN_ID_HEX = "0x14a34";
export const BASE_SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";
export const BASE_SEPOLIA_EXPLORER_URL = "https://sepolia.basescan.org";
export const BASE_SEPOLIA_CHAIN = {
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