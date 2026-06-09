const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type SynoraUser = {
  walletAddress: string;
  score: number;
  level: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  rewardsClaimed: number;
};

export type SynoraReputationProfile = SynoraUser & {
  eventsCount: number;
  updatedAt: string;
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
  reputation: SynoraReputationProfile;
};

export type AuthMeResponse = {
  user: SynoraUser;
  reputation: SynoraReputationProfile;
};

export type ReputationEventType =
  | "PROFILE_CREATED"
  | "WALLET_AUTHENTICATED"
  | "DASHBOARD_VISITED"
  | "SYN_BALANCE_CONNECTED"
  | "REWARD_CLAIMED";

export type SynoraReputationEvent = {
  type: ReputationEventType;
  createdAt: string;
  value?: number;
};

export type ReputationEventsResponse = {
  walletAddress: string;
  events: SynoraReputationEvent[];
};

export type ReputationEventResponse = {
  reputation: SynoraReputationProfile;
};

async function getJson<TResponse>(path: string, token?: string): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error ?? `API_ERROR_${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

async function postJson<TResponse>(
  path: string,
  body: unknown,
  token?: string
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
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

export function getAuthenticatedUser(token: string) {
  return getJson<AuthMeResponse>("/auth/me", token);
}

export function reportReputationEvent(
  params: {
    type: ReputationEventType;
    value?: number;
  },
  token: string
) {
  return postJson<ReputationEventResponse>("/reputation/event", params, token);
}
export function getReputationEvents(walletAddress: string) {
  return getJson<ReputationEventsResponse>(`/reputation/${walletAddress}/events`);
}
export type RewardClaim = {
  id: string;
  walletAddress: string;
  rewardType: "MVP_REWARD";
  amount: number;
  status: "CLAIMED";
  createdAt: string;
};

export type RewardClaimResponse = {
  rewardClaim: RewardClaim;
  reputation: SynoraReputationProfile;
  user: SynoraUser;
};

export function claimSynoraReward(token: string) {
  return postJson<RewardClaimResponse>("/rewards/claim", {}, token);
}
export type RewardAuthorization = {
  rewardId: string;
  walletAddress: string;
  amount: string;
  signature: string;
  verifyingContract: string;
  chainId: number;
};

export type RewardAuthorizationResponse = {
  authorization: RewardAuthorization;
};

export function requestRewardAuthorization(token: string) {
  return postJson<RewardAuthorizationResponse>("/rewards/authorize", {}, token);
}