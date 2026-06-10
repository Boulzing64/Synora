import assert from "node:assert/strict";
import request from "supertest";
import { privateKeyToAccount } from "viem/accounts";

import { createSynoraApp } from "../app.js";
import { initializeRewardsStorage } from "../rewards/repository.js";
import { initializeDatabase } from "../storage/repositories.js";

process.env.JWT_SECRET = "synora_test_secret_minimum_32_characters";
process.env.WEB_ORIGIN = "http://localhost:3000";
process.env.REWARDS_SIGNER_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
process.env.REWARDS_DISTRIBUTOR_ADDRESS = "0x0000000000000000000000000000000000000001";
process.env.REWARDS_CHAIN_ID = "84532";
delete process.env.DATABASE_URL;

const app = createSynoraApp();

await initializeDatabase();
await initializeRewardsStorage();

const account = privateKeyToAccount(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
);

const healthResponse = await request(app).get("/health").expect(200);

assert.equal(healthResponse.body.status, "ok");
assert.equal(healthResponse.body.service, "synora-api");

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

console.log("SYNORA API HTTP tests passed.");

const badgesResponse = await request(app)
  .get(`/badges/${account.address}`)
  .expect(200);

assert.equal(badgesResponse.body.walletAddress, account.address);
assert.ok(Array.isArray(badgesResponse.body.badges));
assert.ok(badgesResponse.body.badges.length > 0);