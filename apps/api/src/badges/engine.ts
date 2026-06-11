import type { ReputationEvent } from "../reputation/engine.js";

export type SynoraBadge = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
};

export function buildBadges(events: ReputationEvent[], foundingBetaTester = false) {
  const eventTypes = new Set(events.map((event) => event.type));
  const rewardsClaimed = events.filter((event) => event.type === "REWARD_CLAIMED").length;

  const score = events.reduce((total, event) => {
    if (event.type === "PROFILE_CREATED") return total + 10;
    if (event.type === "WALLET_AUTHENTICATED") return total + 20;
    if (event.type === "DASHBOARD_VISITED") return total + 5;
    if (event.type === "SYN_BALANCE_CONNECTED") return total + 30;
    if (event.type === "REWARD_CLAIMED") return total + 10;
    return total;
  }, 0);

  const badges: SynoraBadge[] = [
    {
      id: "wallet_verified",
      label: "Wallet Verified",
      description: "Wallet authenticated by signature.",
      unlocked: eventTypes.has("WALLET_AUTHENTICATED"),
    },
    {
      id: "early_adopter",
      label: "Early Adopter",
      description: "Joined SYNORA during the MVP beta phase.",
      unlocked: eventTypes.has("PROFILE_CREATED") || events.length > 0,
    },
    {
      id: "founding_beta_tester",
      label: "Founding Beta Tester",
      description: "Claimed the founding beta allocation on Base Sepolia.",
      unlocked: foundingBetaTester,
    },
    {
      id: "syn_connected",
      label: "SYN Connected",
      description: "SYN balance connected on Base Sepolia.",
      unlocked: eventTypes.has("SYN_BALANCE_CONNECTED"),
    },
    {
      id: "reward_claimer",
      label: "Reward Claimer",
      description: "Claimed at least one SYNORA reward.",
      unlocked: rewardsClaimed >= 1,
    },
    {
      id: "onchain_pioneer",
      label: "On-chain Pioneer",
      description: "Eligible for on-chain rewards experience.",
      unlocked: score >= 60,
    },
    {
      id: "top_reputation",
      label: "Top Reputation",
      description: "Reached a reputation score of 100 or more.",
      unlocked: score >= 100,
    },
  ];

  return {
    score,
    rewardsClaimed,
    badges,
    unlockedCount: badges.filter((badge) => badge.unlocked).length,
  };
}
