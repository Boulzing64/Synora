export type SynoraLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface SynoraUserProfile {
  walletAddress: string;
  score: number;
  level: SynoraLevel;
  rewardsClaimed: number;
}
