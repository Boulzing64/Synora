export type ReputationLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export type ReputationEventType =
  | "PROFILE_CREATED"
  | "WALLET_AUTHENTICATED"
  | "DASHBOARD_VISITED"
  | "SYN_BALANCE_CONNECTED"
  | "REWARD_CLAIMED";

export type ReputationEvent = {
  type: ReputationEventType;
  createdAt: string;
  value?: number;
};

export type ReputationProfile = {
  walletAddress: string;
  score: number;
  level: ReputationLevel;
  rewardsClaimed: number;
  eventsCount: number;
  updatedAt: string;
};

const EVENT_POINTS: Record<ReputationEventType, number> = {
  PROFILE_CREATED: 25,
  WALLET_AUTHENTICATED: 15,
  DASHBOARD_VISITED: 5,
  SYN_BALANCE_CONNECTED: 20,
  REWARD_CLAIMED: 10,
};

const EVENT_CAPS: Record<ReputationEventType, number> = {
  PROFILE_CREATED: 1,
  WALLET_AUTHENTICATED: 10,
  DASHBOARD_VISITED: 20,
  SYN_BALANCE_CONNECTED: 1,
  REWARD_CLAIMED: 50,
};

export function getReputationLevel(score: number): ReputationLevel {
  if (score >= 750) {
    return "PLATINUM";
  }

  if (score >= 400) {
    return "GOLD";
  }

  if (score >= 150) {
    return "SILVER";
  }

  return "BRONZE";
}

export function calculateReputationScore(events: ReputationEvent[]) {
  const counts = new Map<ReputationEventType, number>();

  let score = 0;

  for (const event of events) {
    const currentCount = counts.get(event.type) ?? 0;
    const cap = EVENT_CAPS[event.type];

    if (currentCount >= cap) {
      continue;
    }

    counts.set(event.type, currentCount + 1);
    score += EVENT_POINTS[event.type] + Math.max(0, event.value ?? 0);
  }

  return Math.min(score, 1000);
}

export function buildReputationProfile(params: {
  walletAddress: string;
  events: ReputationEvent[];
}): ReputationProfile {
  const score = calculateReputationScore(params.events);

  const rewardsClaimed = params.events.filter((event) => event.type === "REWARD_CLAIMED").length;

  return {
    walletAddress: params.walletAddress,
    score,
    level: getReputationLevel(score),
    rewardsClaimed,
    eventsCount: params.events.length,
    updatedAt: new Date().toISOString(),
  };
}

export function createInitialReputationEvents(): ReputationEvent[] {
  const createdAt = new Date().toISOString();

  return [
    {
      type: "PROFILE_CREATED",
      createdAt,
    },
  ];
}