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

export function verifyAuthSignature(params: { walletAddress: string; signature: string }) {
  return postJson<AuthVerifyResponse>("/auth/verify", params);
}

export function getAuthenticatedUser(token: string) {
  return getJson<AuthMeResponse>("/auth/me", token);
}

export type EmailAccount = {
  id: string;
  email: string;
  walletAddress: string | null;
  createdAt: string;
  updatedAt: string;
};

export function requestEmailMagicLink(email: string) {
  return postJson<{
    sent: boolean;
    expiresAt: string;
    magicLink?: string;
  }>("/auth/email/request", { email });
}

export function verifyEmailMagicLink(token: string) {
  return postJson<{ token: string; account: EmailAccount }>(
    "/auth/email/verify",
    { token }
  );
}

export function getEmailAccount(token: string) {
  return getJson<{ account: EmailAccount }>("/auth/email/me", token);
}

export function linkEmailWallet(emailToken: string, walletToken: string) {
  return postJson<{ account: EmailAccount }>(
    "/auth/email/link-wallet",
    { walletToken },
    emailToken
  );
}

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

export type NotificationsResponse = {
  walletAddress: string;
  notifications: SynoraNotification[];
};

export function getNotifications(token: string) {
  return getJson<NotificationsResponse>("/notifications", token);
}

export type BetaFeedbackCategory =
  | "GENERAL"
  | "ONBOARDING"
  | "WALLET"
  | "REWARDS";

export type BetaFeedback = {
  walletAddress: string;
  rating: number;
  category: BetaFeedbackCategory;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export function getMyBetaFeedback(token: string) {
  return getJson<{ feedback: BetaFeedback | null }>("/feedback/me", token);
}

export function submitBetaFeedback(
  params: {
    rating: number;
    category: BetaFeedbackCategory;
    comment: string;
  },
  token: string
) {
  return postJson<{ feedback: BetaFeedback }>("/feedback", params, token);
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
  expiresAt: string;
  quorum: number;
  quorumReached: boolean;
  totalVotes: number;
  remainingSeconds: number;
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

export type BetaDistribution = {
  walletAddress: string;
  rewardId: string;
  amount: number;
  status: "AUTHORIZED" | "CLAIMED";
  source: string;
  transactionHash: string | null;
  createdAt: string;
  claimedAt: string | null;
};

export type BetaProgramStatus = {
  maxTesters: number;
  remainingPlaces: number;
  registrationOpen: boolean;
  totalBetaRegistrations: number;
  totalBetaTesters: number;
  totalBetaSynDistributed: number;
};

export type BetaStatusResponse = {
  walletAddress: string;
  eligible: boolean;
  distribution: BetaDistribution | null;
  program: BetaProgramStatus;
};

export function getBetaStatus(token: string) {
  return getJson<BetaStatusResponse>("/beta/status", token);
}

export function getBetaProgram() {
  return getJson<{ program: BetaProgramStatus }>("/beta/program");
}

export type BetaAcquisitionSource =
  | "direct"
  | "founder"
  | "community"
  | "social"
  | "partner";

export function requestBetaAuthorization(
  token: string,
  source: BetaAcquisitionSource = "direct"
) {
  return postJson<{
    distribution: BetaDistribution;
    authorization: RewardAuthorization;
    program: BetaProgramStatus;
  }>("/beta/authorize", { source }, token);
}

export function confirmBetaClaim(token: string, transactionHash: string) {
  return postJson<{ distribution: BetaDistribution }>(
    "/beta/confirm",
    { transactionHash },
    token
  );
}
export type LeaderboardEntry = {
  walletAddress: string;
  score: number;
  rewardsClaimed: number;
  eventsCount: number;
  updatedAt: string;
};

export type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[];
};

export function getLeaderboard(limit = 20) {
  return getJson<LeaderboardResponse>(`/leaderboard?limit=${limit}`);
}

export type SynoraBadge = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
};

export type BadgesResponse = {
  walletAddress: string;
  score: number;
  rewardsClaimed: number;
  unlockedCount: number;
  badges: SynoraBadge[];
};

export function getBadges(walletAddress: string) {
  return getJson<BadgesResponse>(`/badges/${walletAddress}`);
}

export type AssistantChatResponse = {
  answer: string;
};

export function askAssistant(message: string) {
  return postJson<AssistantChatResponse>("/assistant/chat", {
    message,
  });
}

export type AnalyticsSummary = {
  stakingContractAddress: string | null;
  totalStakedSyn: string;
  stakingStatus: string;
  totalWallets: number;
  totalEvents: number;
  totalRewardsClaimed: number;
  topScore: number;
  totalSynDistributed: number;
  totalRewardClaims: number;
  uniqueRewardClaimers: number;
  averageRewardsPerUser: number;
  totalBetaRegistrations: number;
  totalBetaTesters: number;
  totalBetaSynDistributed: number;
  totalGovernanceProposals: number;
  activeGovernanceProposals: number;
  closedGovernanceProposals: number;
  totalGovernanceVotes: number;
  totalGovernanceVotingWeight: number;
  uniqueGovernanceVoters: number;
  averageGovernanceVotingWeight: number;
};

export type AnalyticsResponse = {
  analytics: AnalyticsSummary;
};

export function getAnalytics() {
  return getJson<AnalyticsResponse>("/analytics");
}

export type AdminDashboardResponse = {
  generatedAt: string;
  adminWallet: string;
  funnel: {
    emailAccounts: number;
    linkedEmailAccounts: number;
    authenticatedWallets: number;
    balanceConnectedWallets: number;
    betaRegistrations: number;
    betaClaimedWallets: number;
    reputationQualifiedWallets: number;
    rewardClaimers: number;
    governanceVoters: number;
  };
  overview: {
    totalWallets: number;
    totalEvents: number;
    totalBetaSynDistributed: number;
    betaMaxTesters: number;
    betaRemainingPlaces: number;
    feedbackCount: number;
    averageFeedbackRating: number;
    activeGovernanceProposals: number;
  };
  recentEmailAccounts: EmailAccount[];
  recentWallets: Array<{
    walletAddress: string;
    score: number;
    eventsCount: number;
    rewardsClaimed: number;
    updatedAt: string;
  }>;
  recentFeedback: BetaFeedback[];
  acquisitionSources: Array<{
    source: string;
    registrations: number;
    claimed: number;
  }>;
};

export function getAdminDashboard(token: string) {
  return getJson<AdminDashboardResponse>("/admin/dashboard", token);
}

export type StakingResponse = {
  walletAddress: string;
  stakedBalance: string;
  stakingScoreBoost: number;
  governanceWeight: number;
  status: string;
};

export function getStakingProfile(walletAddress: string) {
  return getJson<StakingResponse>(`/staking/${walletAddress}`);
}

export type GovernanceProposal = {
  id: string;
  title: string;
  description: string;
  creatorWallet: string;
  status: "ACTIVE" | "PASSED" | "REJECTED" | "EXPIRED";
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
  expiresAt: string;
  quorum: number;
  quorumReached: boolean;
  totalVotes: number;
  remainingSeconds: number;
};

export type GovernanceProposalsResponse = {
  proposals: GovernanceProposal[];
};

export function getGovernanceProposals() {
  return getJson<GovernanceProposalsResponse>("/governance/proposals");
}

export function createGovernanceProposal(params: {
  title: string;
  description: string;
}, token: string) {
  return postJson<{ proposal: GovernanceProposal }>(
    "/governance/proposals",
    params,
    token
  );
}

export function voteGovernanceProposal(params: {
  proposalId: string;
  choice: "FOR" | "AGAINST";
}, token: string) {
  return postJson<{ proposal: GovernanceProposal }>(
    `/governance/proposals/${params.proposalId}/vote`,
    {
      choice: params.choice,
    },
    token
  );
}

export type GovernanceVote = {
  walletAddress: string;
  choice: "FOR" | "AGAINST";
  weight: number;
  createdAt: string;
};

export type GovernanceVotesResponse = {
  proposalId: string;
  votes: GovernanceVote[];
};

export function getGovernanceVotes(proposalId: string) {
  return getJson<GovernanceVotesResponse>(`/governance/proposals/${proposalId}/votes`);
}

export type RewardsHistoryResponse = {
  walletAddress: string;
  claims: RewardClaim[];
};

export function getRewardClaims(walletAddress: string) {
  return getJson<RewardsHistoryResponse>(`/rewards/${walletAddress}`);
}

export type GovernanceVoterLeaderboardEntry = {
  walletAddress: string;
  votesCount: number;
  totalWeight: number;
  lastVoteAt: string;
};

export type GovernanceVotersLeaderboardResponse = {
  leaderboard: GovernanceVoterLeaderboardEntry[];
};

export function getGovernanceVotersLeaderboard(limit = 10) {
  return getJson<GovernanceVotersLeaderboardResponse>(
    `/governance/leaderboard?limit=${limit}`
  );
}

