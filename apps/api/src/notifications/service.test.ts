import assert from "node:assert/strict";

import { buildNotifications } from "./service.js";

const notifications = buildNotifications({
  betaDistribution: {
    walletAddress: "0x0000000000000000000000000000000000000001",
    rewardId:
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    amount: 100,
    status: "CLAIMED",
    transactionHash:
      "0x0000000000000000000000000000000000000000000000000000000000000002",
    createdAt: "2026-06-10T10:00:00.000Z",
    claimedAt: "2026-06-10T11:00:00.000Z",
  },
  claimAllowed: true,
  events: [
    {
      type: "PROFILE_CREATED",
      createdAt: "2026-06-09T10:00:00.000Z",
    },
    {
      type: "WALLET_AUTHENTICATED",
      createdAt: "2026-06-10T09:00:00.000Z",
    },
    {
      type: "DASHBOARD_VISITED",
      createdAt: "2026-06-10T12:00:00.000Z",
    },
  ],
  profile: {
    walletAddress: "0x0000000000000000000000000000000000000001",
    score: 80,
    level: "BRONZE",
    rewardsClaimed: 1,
    eventsCount: 3,
    updatedAt: "2026-06-10T12:00:00.000Z",
  },
  proposals: [
    {
      id: "proposal-1",
      title: "First proposal",
      description: "Test",
      creatorWallet: "0x0000000000000000000000000000000000000001",
      status: "ACTIVE",
      votesFor: 0,
      votesAgainst: 0,
      createdAt: "2026-06-10T08:00:00.000Z",
      expiresAt: "2026-06-17T08:00:00.000Z",
      quorum: 100,
      quorumReached: false,
      totalVotes: 0,
      remainingSeconds: 100,
    },
  ],
  rewardClaims: [
    {
      id: "reward-1",
      walletAddress: "0x0000000000000000000000000000000000000001",
      rewardType: "MVP_REWARD",
      amount: 10,
      status: "CLAIMED",
      createdAt: "2026-06-10T11:30:00.000Z",
    },
  ],
});

assert.ok(
  notifications.some(
    (notification) => notification.kind === "BETA_TRANSACTION_CONFIRMED"
  )
);
assert.ok(
  notifications.some((notification) => notification.kind === "REWARD_AVAILABLE")
);
assert.ok(
  notifications.some((notification) => notification.kind === "REWARD_CLAIMED")
);
assert.ok(
  notifications.some(
    (notification) => notification.kind === "GOVERNANCE_PROPOSAL"
  )
);
assert.equal(
  notifications.some(
    (notification) =>
      notification.kind === "REPUTATION_EVENT" &&
      notification.data.eventType === "DASHBOARD_VISITED"
  ),
  false
);

console.log("SYNORA notifications service tests passed.");
