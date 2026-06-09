import assert from "node:assert/strict";
import request from "supertest";
import { privateKeyToAccount } from "viem/accounts";

import { createSynoraApp } from "../app.js";
import { initializeDatabase } from "../storage/repositories.js";

process.env.JWT_SECRET = "synora_test_secret_minimum_32_characters";
process.env.WEB_ORIGIN = "http://localhost:3000";
delete process.env.DATABASE_URL;

const app = createSynoraApp();

await initializeDatabase();

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

console.log("SYNORA API HTTP tests passed.");
const eventsResponse = await request(app)
  .get(`/reputation/${account.address}/events`)
  .expect(200);

assert.equal(eventsResponse.body.walletAddress, account.address);
assert.ok(Array.isArray(eventsResponse.body.events));
assert.ok(eventsResponse.body.events.length > 0);