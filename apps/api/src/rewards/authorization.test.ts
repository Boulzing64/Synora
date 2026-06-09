import assert from "node:assert/strict";

import { createRewardAuthorization } from "./authorization.js";

process.env.REWARDS_SIGNER_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
process.env.REWARDS_DISTRIBUTOR_ADDRESS = "0x0000000000000000000000000000000000000001";
process.env.REWARDS_CHAIN_ID = "84532";

const authorization = await createRewardAuthorization({
  rewardId: "0x0000000000000000000000000000000000000000000000000000000000000001",
  walletAddress: "0x0000000000000000000000000000000000000002",
  amountSyn: 10,
});

assert.equal(authorization.chainId, 84532);
assert.equal(authorization.verifyingContract, "0x0000000000000000000000000000000000000001");
assert.equal(authorization.walletAddress, "0x0000000000000000000000000000000000000002");
assert.equal(authorization.amount, "10000000000000000000");
assert.match(authorization.signature, /^0x[a-fA-F0-9]+$/);

console.log("SYNORA rewards EIP-712 authorization tests passed.");