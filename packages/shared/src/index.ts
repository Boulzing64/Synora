export type SynoraLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface SynoraUserProfile {
  walletAddress: string;
  score: number;
  level: SynoraLevel;
  rewardsClaimed: number;
}

export type SynoraReputationEventType =
  | "PROFILE_CREATED"
  | "WALLET_AUTHENTICATED"
  | "DASHBOARD_VISITED"
  | "SYN_BALANCE_CONNECTED"
  | "REWARD_CLAIMED";

export interface SynoraReputationEvent {
  type: SynoraReputationEventType;
  createdAt: string;
  value?: number;
}

export interface SynoraReputationProfile extends SynoraUserProfile {
  eventsCount: number;
  updatedAt: string;
}