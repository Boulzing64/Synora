const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type SynoraUser = {
  walletAddress: string;
  score: number;
  level: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  rewardsClaimed: number;
};

export type AuthNonceResponse = {
  walletAddress: string;
  nonce: string;
  issuedAt: string;
  message: string;
};

export type AuthVerifyResponse = {
  token: string;
  user: SynoraUser;
};

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error ?? `API_ERROR_${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export function requestAuthNonce(walletAddress: string) {
  return postJson<AuthNonceResponse>("/auth/nonce", {
    walletAddress,
  });
}

export function verifyAuthSignature(params: {
  walletAddress: string;
  signature: string;
}) {
  return postJson<AuthVerifyResponse>("/auth/verify", params);
}