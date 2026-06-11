import assert from "node:assert/strict";
import request from "supertest";
import { privateKeyToAccount } from "viem/accounts";

import { createSynoraApp } from "../app.js";
import { initializeBetaStorage } from "../beta/repository.js";
import { initializeRewardsStorage } from "../rewards/repository.js";
import { initializeDatabase } from "../storage/repositories.js";

process.env.JWT_SECRET = "synora_test_secret_minimum_32_characters";
process.env.WEB_ORIGIN = "http://localhost:3000";
process.env.REWARDS_SIGNER_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
process.env.REWARDS_DISTRIBUTOR_ADDRESS = "0x0000000000000000000000000000000000000001";
process.env.REWARDS_CHAIN_ID = "84532";
process.env.BETA_MAX_TESTERS = "1";
process.env.ADMIN_WALLET_ADDRESSES =
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
delete process.env.DATABASE_URL;

const app = createSynoraApp();

await initializeDatabase();
await initializeRewardsStorage();
await initializeBetaStorage();

const account = privateKeyToAccount(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
);

const healthResponse = await request(app).get("/health").expect(200);

assert.equal(healthResponse.body.status, "ok");
assert.equal(healthResponse.body.service, "synora-api");

const initialBetaProgramResponse = await request(app).get("/beta/program").expect(200);

assert.equal(initialBetaProgramResponse.body.program.maxTesters, 1);
assert.equal(initialBetaProgramResponse.body.program.remainingPlaces, 1);
assert.equal(initialBetaProgramResponse.body.program.registrationOpen, true);

await request(app)
  .post("/auth/nonce")
  .send({
    walletAddress: "invalid-wallet",
  })
  .expect(400);

const nonceResponse = await request(app)
  .post("/auth/nonce")
  .send({
    walletAddress: account.address,
  })
  .expect(200);

assert.equal(nonceResponse.body.walletAddress, account.address);
assert.equal(typeof nonceResponse.body.message, "string");

const signature = await account.signMessage({
  message: nonceResponse.body.message,
});

const verifyResponse = await request(app)
  .post("/auth/verify")
  .send({
    walletAddress: account.address,
    signature,
  })
  .expect(200);

assert.equal(typeof verifyResponse.body.token, "string");
assert.equal(verifyResponse.body.user.walletAddress, account.address);
assert.ok(verifyResponse.body.user.score > 0);

const token = verifyResponse.body.token as string;

const emailRequestResponse = await request(app)
  .post("/auth/email/request")
  .send({
    email: "founder@synora.test",
  })
  .expect(200);

assert.equal(emailRequestResponse.body.sent, true);
assert.match(emailRequestResponse.body.magicLink, /\/connexion\?token=/);

const emailMagicToken = new URL(emailRequestResponse.body.magicLink).searchParams.get(
  "token"
);
assert.ok(emailMagicToken);

const emailVerifyResponse = await request(app)
  .post("/auth/email/verify")
  .send({
    token: emailMagicToken,
  })
  .expect(200);

assert.equal(emailVerifyResponse.body.account.email, "founder@synora.test");

await request(app)
  .post("/auth/email/verify")
  .send({
    token: emailMagicToken,
  })
  .expect(401);

const emailToken = emailVerifyResponse.body.token as string;

const linkedEmailResponse = await request(app)
  .post("/auth/email/link-wallet")
  .set("Authorization", `Bearer ${emailToken}`)
  .send({
    walletToken: token,
  })
  .expect(200);

assert.equal(linkedEmailResponse.body.account.walletAddress, account.address);

await request(app)
  .get("/auth/email/me")
  .set("Authorization", `Bearer ${emailToken}`)
  .expect(200)
  .expect((response) => {
    assert.equal(response.body.account.email, "founder@synora.test");
    assert.equal(response.body.account.walletAddress, account.address);
  });

await request(app).get("/notifications").expect(401);

const initialNotificationsResponse = await request(app)
  .get("/notifications")
  .set("Authorization", `Bearer ${token}`)
  .expect(200);

assert.equal(initialNotificationsResponse.body.walletAddress, account.address);
assert.ok(Array.isArray(initialNotificationsResponse.body.notifications));
assert.ok(
  initialNotificationsResponse.body.notifications.some(
    (notification: { kind: string }) =>
      notification.kind === "REPUTATION_EVENT"
  )
);

await request(app)
  .post("/feedback")
  .send({
    rating: 5,
    category: "ONBOARDING",
    comment: "Excellent onboarding.",
  })
  .expect(401);

await request(app)
  .post("/feedback")
  .set("Authorization", `Bearer ${token}`)
  .send({
    rating: 8,
    category: "ONBOARDING",
    comment: "Invalid rating.",
  })
  .expect(400);

const feedbackResponse = await request(app)
  .post("/feedback")
  .set("Authorization", `Bearer ${token}`)
  .send({
    rating: 5,
    category: "ONBOARDING",
    comment: "Excellent onboarding.",
  })
  .expect(200);

assert.equal(feedbackResponse.body.feedback.rating, 5);
assert.equal(feedbackResponse.body.feedback.walletAddress, account.address);

const savedFeedbackResponse = await request(app)
  .get("/feedback/me")
  .set("Authorization", `Bearer ${token}`)
  .expect(200);

assert.equal(savedFeedbackResponse.body.feedback.category, "ONBOARDING");

await request(app)
  .post("/reputation/event")
  .send({
    type: "SYN_BALANCE_CONNECTED",
  })
  .expect(401);

const reputationEventResponse = await request(app)
  .post("/reputation/event")
  .set("Authorization", `Bearer ${token}`)
  .send({
    type: "SYN_BALANCE_CONNECTED",
  })
  .expect(200);

assert.equal(reputationEventResponse.body.reputation.walletAddress, account.address);
assert.ok(reputationEventResponse.body.reputation.score >= verifyResponse.body.user.score);

await request(app)
  .post("/beta/authorize")
  .set("Authorization", `Bearer ${token}`)
  .send({ source: "unknown-channel" })
  .expect(400)
  .expect((response) => {
    assert.equal(response.body.error, "INVALID_BETA_SOURCE");
  });

const betaAuthorizationResponse = await request(app)
  .post("/beta/authorize")
  .set("Authorization", `Bearer ${token}`)
  .send({ source: "founder" })
  .expect(200);

assert.equal(betaAuthorizationResponse.body.distribution.walletAddress, account.address);
assert.equal(betaAuthorizationResponse.body.distribution.amount, 100);
assert.equal(betaAuthorizationResponse.body.distribution.status, "AUTHORIZED");
assert.equal(betaAuthorizationResponse.body.distribution.source, "founder");
assert.equal(betaAuthorizationResponse.body.program.remainingPlaces, 0);
assert.equal(betaAuthorizationResponse.body.program.registrationOpen, false);

const repeatedBetaAuthorizationResponse = await request(app)
  .post("/beta/authorize")
  .set("Authorization", `Bearer ${token}`)
  .send({})
  .expect(200);

assert.equal(
  repeatedBetaAuthorizationResponse.body.authorization.rewardId,
  betaAuthorizationResponse.body.authorization.rewardId
);

const betaStatusResponse = await request(app)
  .get("/beta/status")
  .set("Authorization", `Bearer ${token}`)
  .expect(200);

assert.equal(betaStatusResponse.body.distribution.amount, 100);
assert.equal(betaStatusResponse.body.eligible, true);
assert.equal(betaStatusResponse.body.program.remainingPlaces, 0);

const secondAccount = privateKeyToAccount(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
);
const secondNonceResponse = await request(app)
  .post("/auth/nonce")
  .send({
    walletAddress: secondAccount.address,
  })
  .expect(200);
const secondSignature = await secondAccount.signMessage({
  message: secondNonceResponse.body.message,
});
const secondVerifyResponse = await request(app)
  .post("/auth/verify")
  .send({
    walletAddress: secondAccount.address,
    signature: secondSignature,
  })
  .expect(200);

await request(app).get("/admin/dashboard").expect(401);

await request(app)
  .get("/admin/dashboard")
  .set("Authorization", `Bearer ${secondVerifyResponse.body.token}`)
  .expect(403);

const adminDashboardResponse = await request(app)
  .get("/admin/dashboard")
  .set("Authorization", `Bearer ${token}`)
  .expect(200);

assert.equal(adminDashboardResponse.body.adminWallet, account.address);
assert.ok(
  typeof adminDashboardResponse.body.funnel.authenticatedWallets === "number"
);
assert.ok(Array.isArray(adminDashboardResponse.body.recentFeedback));
assert.equal(adminDashboardResponse.body.overview.betaMaxTesters, 1);
assert.equal(adminDashboardResponse.body.overview.betaRemainingPlaces, 0);
assert.deepEqual(adminDashboardResponse.body.acquisitionSources, [
  {
    source: "founder",
    registrations: 1,
    claimed: 0,
  },
]);

await request(app)
  .post("/beta/authorize")
  .set("Authorization", `Bearer ${secondVerifyResponse.body.token}`)
  .send({})
  .expect(409)
  .expect((response) => {
    assert.equal(response.body.error, "BETA_PROGRAM_FULL");
    assert.equal(response.body.program.remainingPlaces, 0);
  });

await request(app)
  .post("/beta/confirm")
  .set("Authorization", `Bearer ${token}`)
  .send({
    transactionHash: "invalid",
  })
  .expect(400);

await request(app)
  .post("/reputation/event")
  .set("Authorization", `Bearer ${token}`)
  .send({
    type: "REWARD_CLAIMED",
  })
  .expect(400);

await request(app)
  .post("/reputation/event")
  .set("Authorization", `Bearer ${token}`)
  .send({
    type: "DASHBOARD_VISITED",
    value: 100,
  })
  .expect(400);

const reputationResponse = await request(app)
  .get(`/reputation/${account.address}`)
  .expect(200);

assert.equal(reputationResponse.body.reputation.walletAddress, account.address);
assert.ok(reputationResponse.body.reputation.eventsCount >= 3);

const eventsResponse = await request(app)
  .get(`/reputation/${account.address}/events`)
  .expect(200);

assert.equal(eventsResponse.body.walletAddress, account.address);
assert.ok(Array.isArray(eventsResponse.body.events));
assert.ok(eventsResponse.body.events.length > 0);

const rewardAuthorizationResponse = await request(app)
  .post("/rewards/authorize")
  .set("Authorization", `Bearer ${token}`)
  .send({})
  .expect(200);

assert.equal(rewardAuthorizationResponse.body.authorization.walletAddress, account.address);
assert.equal(rewardAuthorizationResponse.body.authorization.chainId, 84532);
assert.match(rewardAuthorizationResponse.body.authorization.signature, /^0x[a-fA-F0-9]+$/);

const repeatedRewardAuthorizationResponse = await request(app)
  .post("/rewards/authorize")
  .set("Authorization", `Bearer ${token}`)
  .send({})
  .expect(200);

assert.equal(
  repeatedRewardAuthorizationResponse.body.authorization.rewardId,
  rewardAuthorizationResponse.body.authorization.rewardId
);

const dedicatedRewardClaimResponse = await request(app)
  .post("/rewards/claim")
  .set("Authorization", `Bearer ${token}`)
  .send({})
  .expect(200);

assert.equal(dedicatedRewardClaimResponse.body.rewardClaim.walletAddress, account.address);
assert.equal(dedicatedRewardClaimResponse.body.rewardClaim.rewardType, "MVP_REWARD");
assert.ok(dedicatedRewardClaimResponse.body.reputation.rewardsClaimed >= 1);

await request(app)
  .post("/rewards/claim")
  .set("Authorization", `Bearer ${token}`)
  .send({})
  .expect(409);


await request(app)
  .post("/governance/proposals")
  .send({
    title: "Governance test proposal",
    description: "This proposal must be rejected without authentication.",
  })
  .expect(401);

await request(app)
  .post("/governance/proposals/test-proposal-id/vote")
  .send({
    choice: "FOR",
  })
  .expect(401);

await request(app)
  .post("/governance/proposals")
  .set("Authorization", `Bearer ${token}`)
  .send({
    title: "Governance test proposal",
    description: "This proposal must be rejected without enough staking.",
  })
  .expect(403);

await request(app)
  .post("/governance/proposals/test-proposal-id/vote")
  .set("Authorization", `Bearer ${token}`)
  .send({
    choice: "FOR",
  })
  .expect(403);

console.log("SYNORA API HTTP tests passed.");

const badgesResponse = await request(app)
  .get(`/badges/${account.address}`)
  .expect(200);

assert.equal(badgesResponse.body.walletAddress, account.address);
assert.ok(Array.isArray(badgesResponse.body.badges));
assert.ok(badgesResponse.body.badges.length > 0);
assert.equal(
  badgesResponse.body.badges.find(
    (badge: { id: string; unlocked: boolean }) => badge.id === "founding_beta_tester"
  )?.unlocked,
  false
);

const analyticsResponse = await request(app)
  .get("/analytics")
  .expect(200);

assert.ok(typeof analyticsResponse.body.analytics.totalWallets === "number");
assert.ok(typeof analyticsResponse.body.analytics.totalEvents === "number");
assert.ok(typeof analyticsResponse.body.analytics.totalRewardsClaimed === "number");
assert.ok(typeof analyticsResponse.body.analytics.topScore === "number");
assert.ok(typeof analyticsResponse.body.analytics.totalSynDistributed === "number");
assert.equal(analyticsResponse.body.analytics.totalBetaRegistrations, 1);
assert.equal(analyticsResponse.body.analytics.totalBetaTesters, 0);
assert.equal(analyticsResponse.body.analytics.totalBetaSynDistributed, 0);

const stakingResponse = await request(app)
  .get(`/staking/${account.address}`)
  .expect(200);

assert.equal(stakingResponse.body.walletAddress, account.address);
assert.equal(stakingResponse.body.stakedBalance, "0");
assert.equal(stakingResponse.body.stakingScoreBoost, 0);
assert.equal(stakingResponse.body.governanceWeight, 0);

