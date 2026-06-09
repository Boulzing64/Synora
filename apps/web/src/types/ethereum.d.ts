export {};

type EthereumRequestArgs = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};

type EthereumProvider = {
  request: <T = unknown>(args: EthereumRequestArgs) => Promise<T>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}