import pg from "pg";
import type { Pool as PgPool } from "pg";
import { getAddress } from "viem";

import { logger } from "../observability/logger.js";

const { Pool } = pg;

export type RewardClaim = {
  id: string;
  walletAddress: string;
  rewardType: "MVP_REWARD";
  amount: number;
  status: "CLAIMED";
  createdAt: string;
};

const memoryRewardClaimsStore = new Map<string, RewardClaim[]>();

let pool: PgPool | null = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL;
}

function getPool() {
  if (!getDatabaseUrl()) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl:
        process.env.NODE_ENV === "production"
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
    });
  }

  return pool;
}

export async function initializeRewardsStorage() {
  const databasePool = getPool();

  if (!databasePool) {
    logger.warn("rewards.memory.enabled", { reason: "DATABASE_URL_NOT_SET" });
    return;
  }

  await databasePool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const existingMigration = await databasePool.query(
    `
      SELECT version
      FROM schema_migrations
      WHERE version = $1
      LIMIT 1
    `,
    ["007"]
  );

  if (existingMigration.rows.length === 0) {
    const client = await databasePool.connect();

    try {
      await client.query("BEGIN");

      await client.query(`
        CREATE TABLE IF NOT EXISTS reward_claims (
          id BIGSERIAL PRIMARY KEY,
          wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
          reward_type TEXT NOT NULL,
          amount INTEGER NOT NULL,
          status TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_reward_claims_wallet_created
          ON reward_claims(wallet_address, created_at);

        CREATE INDEX IF NOT EXISTS idx_reward_claims_wallet_type
          ON reward_claims(wallet_address, reward_type);
      `);

      await client.query(
        `
          INSERT INTO schema_migrations(version, name)
          VALUES ($1, $2)
        `,
        ["007", "create_reward_claims"]
      );

      await client.query("COMMIT");

      logger.info("database.migration.applied", {
        version: "007",
        name: "create_reward_claims",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  logger.info("rewards.storage.initialized", { provider: "postgresql" });
}

export async function getRecentRewardClaims(walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);
  const databasePool = getPool();

  if (!databasePool) {
    return memoryRewardClaimsStore.get(normalizedWallet) ?? [];
  }

  const result = await databasePool.query(
    `
      SELECT id, wallet_address, reward_type, amount, status, created_at
      FROM reward_claims
      WHERE wallet_address = $1
      ORDER BY created_at DESC
      LIMIT 20
    `,
    [normalizedWallet]
  );

  return result.rows.map((row) => ({
    id: String(row.id),
    walletAddress: String(row.wallet_address),
    rewardType: row.reward_type as "MVP_REWARD",
    amount: Number(row.amount),
    status: row.status as "CLAIMED",
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function canClaimMvpReward(walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);
  const databasePool = getPool();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (!databasePool) {
    const claims = memoryRewardClaimsStore.get(normalizedWallet) ?? [];
    const latestClaim = claims[0];

    if (!latestClaim) {
      return {
        allowed: true,
        reason: null,
      };
    }

    const elapsedMs = Date.now() - new Date(latestClaim.createdAt).getTime();

    return {
      allowed: elapsedMs >= oneDayMs,
      reason: elapsedMs >= oneDayMs ? null : "REWARD_ALREADY_CLAIMED_TODAY",
    };
  }

  const result = await databasePool.query(
    `
      SELECT created_at
      FROM reward_claims
      WHERE wallet_address = $1
        AND reward_type = 'MVP_REWARD'
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [normalizedWallet]
  );

  const latestClaim = result.rows[0];

  if (!latestClaim) {
    return {
      allowed: true,
      reason: null,
    };
  }

  const elapsedMs = Date.now() - new Date(latestClaim.created_at).getTime();

  return {
    allowed: elapsedMs >= oneDayMs,
    reason: elapsedMs >= oneDayMs ? null : "REWARD_ALREADY_CLAIMED_TODAY",
  };
}

export async function createMvpRewardClaim(walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);
  const databasePool = getPool();

  const claim: RewardClaim = {
    id: crypto.randomUUID(),
    walletAddress: normalizedWallet,
    rewardType: "MVP_REWARD",
    amount: 10,
    status: "CLAIMED",
    createdAt: new Date().toISOString(),
  };

  if (!databasePool) {
    const claims = memoryRewardClaimsStore.get(normalizedWallet) ?? [];
    const updatedClaims = [claim, ...claims];
    memoryRewardClaimsStore.set(normalizedWallet, updatedClaims);

    return claim;
  }

  const result = await databasePool.query(
    `
      INSERT INTO reward_claims(wallet_address, reward_type, amount, status, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, wallet_address, reward_type, amount, status, created_at
    `,
    [
      normalizedWallet,
      claim.rewardType,
      claim.amount,
      claim.status,
      claim.createdAt,
    ]
  );

  const row = result.rows[0];

  return {
    id: String(row.id),
    walletAddress: String(row.wallet_address),
    rewardType: row.reward_type as "MVP_REWARD",
    amount: Number(row.amount),
    status: row.status as "CLAIMED",
    createdAt: new Date(row.created_at).toISOString(),
  };
}
