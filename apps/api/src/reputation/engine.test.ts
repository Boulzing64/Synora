import assert from "node:assert/strict";

import {
  buildReputationProfile,
  calculateReputationScore,
  createInitialReputationEvents,
  getReputationLevel,
  type ReputationEvent,
} from "./engine.js";

const initialEvents = createInitialReputationEvents();

assert.equal(calculateReputationScore(initialEvents), 25);
assert.equal(getReputationLevel(0), "BRONZE");
assert.equal(getReputationLevel(150), "SILVER");
assert.equal(getReputationLevel(400), "GOLD");
assert.equal(getReputationLevel(750), "PLATINUM");

const events: ReputationEvent[] = [
  ...initialEvents,
  {
    type: "WALLET_AUTHENTICATED",
    createdAt: new Date().toISOString(),
  },
  {
    type: "SYN_BALANCE_CONNECTED",
    createdAt: new Date().toISOString(),
  },
];

const profile = buildReputationProfile({
  walletAddress: "0x0000000000000000000000000000000000000001",
  events,
});

assert.equal(profile.score, 60);
assert.equal(profile.level, "BRONZE");
assert.equal(profile.eventsCount, 3);

console.log("Reputation engine tests passed.");