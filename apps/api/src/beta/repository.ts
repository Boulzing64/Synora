import pg from "pg";
import type { Pool as PgPool } from "pg";
import { getAddress } from "viem";

import { logger } from "../observability/logger.js";
import { createBetaRewardId } from "../rewards/authorization.js";

const { Pool } = pg;

export type BetaDistributionStatus = "AUTHORIZED" | "CLAIMED";

export type BetaDistribution = {
  walletAddress: string;
  rewardId: string;
  amount: number;
  status: BetaDistributionStatus;
  transactionHash: string | null;
  createdAt: string;
  claimedAt: string | null;
};

const BETA_AMOUNT_SYN = 100;
const memoryDistributions = new Map<string, BetaDistribution>();

let pool: PgPool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
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

function mapRow(row: any): BetaDistribution {
  return {
    walletAddress: String(row.wallet_address),
    rewardId: String(row.reward_id),
    amount: Number(row.amount),
    status: row.status as BetaDistributionStatus,
    transactionHash: row.transaction_hash ? String(row.transaction_hash) : null,
    createdAt: new Date(row.created_at).toISOString(),
    claimedAt: row.claimed_at ? new Date(row.claimed_at).toISOString() : null,
  };
}

export async function initializeBetaStorage() {
  const databasePool = getPool();

  if (!databasePool) {
    logger.warn("beta.memory.enabled", { reason: "DATABASE_URL_NOT_SET" });
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
    `SELECT version FROM schema_migrations WHERE version = $1 LIMIT 1`,
    ["008"]
  );

  if (existingMigration.rows.length === 0) {
    const client = await databasePool.connect();

    try {
      await client.query("BEGIN");
      await client.query(`
        CREATE TABLE IF NOT EXISTS beta_distributions (
          wallet_address TEXT PRIMARY KEY REFERENCES users(wallet_address) ON DELETE CASCADE,
          reward_id TEXT NOT NULL UNIQUE,
          amount INTEGER NOT NULL,
          status TEXT NOT NULL,
          transaction_hash TEXT UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          claimed_at TIMESTAMPTZ
        );

        CREATE INDEX IF NOT EXISTS idx_beta_distributions_status_created
          ON beta_distributions(status, created_at);
      `);
      await client.query(
        `INSERT INTO schema_migrations(version, name) VALUES ($1, $2)`,
        ["008", "create_beta_distributions"]
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  logger.info("beta.storage.initialized", { provider: "postgresql" });
}

export async function getBetaDistribution(walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);
  const databasePool = getPool();

  if (!databasePool) {
    return memoryDistributions.get(normalizedWallet) ?? null;
  }

  const result = await databasePool.query(
    `
      SELECT wallet_address, reward_id, amount, status, transaction_hash, created_at, claimed_at
      FROM beta_distributions
      WHERE wallet_address = $1
      LIMIT 1
    `,
    [normalizedWallet]
  );

  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function getOrCreateBetaDistribution(walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);
  const existing = await getBetaDistribution(normalizedWallet);

  if (existing) {
    return existing;
  }

  const distribution: BetaDistribution = {
    walletAddress: normalizedWallet,
    rewardId: createBetaRewardId(normalizedWallet),
    amount: BETA_AMOUNT_SYN,
    status: "AUTHORIZED",
    transactionHash: null,
    createdAt: new Date().toISOString(),
    claimedAt: null,
  };

  const databasePool = getPool();

  if (!databasePool) {
    memoryDistributions.set(normalizedWallet, distribution);
    return distribution;
  }

  const result = await databasePool.query(
    `
      INSERT INTO beta_distributions(wallet_address, reward_id, amount, status, created_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (wallet_address) DO UPDATE SET wallet_address = EXCLUDED.wallet_address
      RETURNING wallet_address, reward_id, amount, status, transaction_hash, created_at, claimed_at
    `,
    [
      distribution.walletAddress,
      distribution.rewardId,
      distribution.amount,
      distribution.status,
      distribution.createdAt,
    ]
  );

  return mapRow(result.rows[0]);
}

export async function markBetaDistributionClaimed(
  walletAddress: string,
  transactionHash: string
) {
  const normalizedWallet = getAddress(walletAddress);
  const existing = await getOrCreateBetaDistribution(normalizedWallet);

  if (existing.status === "CLAIMED") {
    return existing;
  }

  const claimedAt = new Date().toISOString();
  const updated: BetaDistribution = {
    ...existing,
    status: "CLAIMED",
    transactionHash,
    claimedAt,
  };

  const databasePool = getPool();

  if (!databasePool) {
    memoryDistributions.set(normalizedWallet, updated);
    return updated;
  }

  const result = await databasePool.query(
    `
      UPDATE beta_distributions
      SET status = 'CLAIMED', transaction_hash = $2, claimed_at = $3
      WHERE wallet_address = $1
      RETURNING wallet_address, reward_id, amount, status, transaction_hash, created_at, claimed_at
    `,
    [normalizedWallet, transactionHash, claimedAt]
  );

  return mapRow(result.rows[0]);
}

export async function getBetaAnalytics() {
  const databasePool = getPool();

  if (!databasePool) {
    const distributions = Array.from(memoryDistributions.values());
    const claimed = distributions.filter((distribution) => distribution.status === "CLAIMED");

    return {
      totalBetaRegistrations: distributions.length,
      totalBetaTesters: claimed.length,
      totalBetaSynDistributed: claimed.reduce(
        (total, distribution) => total + distribution.amount,
        0
      ),
    };
  }

  const result = await databasePool.query(`
    SELECT
      COUNT(*)::INTEGER AS total_beta_registrations,
      COUNT(*) FILTER (WHERE status = 'CLAIMED')::INTEGER AS total_beta_testers,
      COALESCE(SUM(amount) FILTER (WHERE status = 'CLAIMED'), 0)::INTEGER
        AS total_beta_syn_distributed
    FROM beta_distributions
  `);
  const row = result.rows[0];

  return {
    totalBetaRegistrations: Number(row.total_beta_registrations ?? 0),
    totalBetaTesters: Number(row.total_beta_testers ?? 0),
    totalBetaSynDistributed: Number(row.total_beta_syn_distributed ?? 0),
  };
}
