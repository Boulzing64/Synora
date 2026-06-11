import type { BetaDistribution } from "../beta/repository.js";
import type { GovernanceProposal } from "../governance/repository.js";
import type { ReputationEvent, ReputationProfile } from "../reputation/engine.js";
import type { RewardClaim } from "../rewards/repository.js";

export type SynoraNotificationKind =
  | "BETA_TRANSACTION_CONFIRMED"
  | "BETA_REWARD_READY"
  | "REWARD_AVAILABLE"
  | "REWARD_CLAIMED"
  | "REPUTATION_EVENT"
  | "GOVERNANCE_PROPOSAL";

export type SynoraNotification = {
  id: string;
  kind: SynoraNotificationKind;
  createdAt: string;
  href: string;
  data: Record<string, string | number>;
};

const meaningfulReputationEvents = new Set<ReputationEvent["type"]>([
  "PROFILE_CREATED",
  "WALLET_AUTHENTICATED",
  "SYN_BALANCE_CONNECTED",
]);

export function buildNotifications(params: {
  betaDistribution: BetaDistribution | null;
  claimAllowed: boolean;
  events: ReputationEvent[];
  profile: ReputationProfile;
  proposals: GovernanceProposal[];
  rewardClaims: RewardClaim[];
}) {
  const notifications: SynoraNotification[] = [];

  if (params.betaDistribution?.status === "CLAIMED") {
    notifications.push({
      id: `beta-claimed-${params.betaDistribution.rewardId}`,
      kind: "BETA_TRANSACTION_CONFIRMED",
      createdAt:
        params.betaDistribution.claimedAt ?? params.betaDistribution.createdAt,
      href: "/rewards",
      data: {
        amount: params.betaDistribution.amount,
        transactionHash: params.betaDistribution.transactionHash ?? "",
      },
    });
  } else if (params.betaDistribution?.status === "AUTHORIZED") {
    notifications.push({
      id: `beta-ready-${params.betaDistribution.rewardId}`,
      kind: "BETA_REWARD_READY",
      createdAt: params.betaDistribution.createdAt,
      href: "/obtenir-syn",
      data: {
        amount: params.betaDistribution.amount,
      },
    });
  }

  for (const claim of params.rewardClaims.slice(0, 5)) {
    notifications.push({
      id: `reward-claimed-${claim.id}`,
      kind: "REWARD_CLAIMED",
      createdAt: claim.createdAt,
      href: "/rewards",
      data: {
        amount: claim.amount,
        rewardType: claim.rewardType,
      },
    });
  }

  if (params.profile.score >= 60 && params.claimAllowed) {
    const latestActivityAt =
      params.events.at(-1)?.createdAt ?? new Date(0).toISOString();

    notifications.push({
      id: "reward-available-daily",
      kind: "REWARD_AVAILABLE",
      createdAt: latestActivityAt,
      href: "/dashboard",
      data: {
        amount: 10,
        score: params.profile.score,
      },
    });
  }

  const latestEventByType = new Map<
    ReputationEvent["type"],
    ReputationEvent
  >();

  for (const event of params.events) {
    if (meaningfulReputationEvents.has(event.type)) {
      latestEventByType.set(event.type, event);
    }
  }

  for (const event of latestEventByType.values()) {
    notifications.push({
      id: `reputation-${event.type}-${event.createdAt}`,
      kind: "REPUTATION_EVENT",
      createdAt: event.createdAt,
      href: "/reputation",
      data: {
        eventType: event.type,
        score: params.profile.score,
        level: params.profile.level,
      },
    });
  }

  for (const proposal of params.proposals
    .filter((item) => item.status === "ACTIVE")
    .slice(0, 3)) {
    notifications.push({
      id: `governance-${proposal.id}`,
      kind: "GOVERNANCE_PROPOSAL",
      createdAt: proposal.createdAt,
      href: "/governance",
      data: {
        proposalId: proposal.id,
        title: proposal.title,
        remainingSeconds: proposal.remainingSeconds,
      },
    });
  }

  return notifications
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);
}
