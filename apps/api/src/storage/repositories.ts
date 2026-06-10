import pg from "pg";
import type { Pool as PgPool } from "pg";
import { getAddress } from "viem";

import {
  createInitialReputationEvents,
  type ReputationEvent,
  type ReputationEventType,
} from "../reputation/engine.js";

const { Pool } = pg;

type AuthNonceEntry = {
  nonce: string;
  issuedAt: string;
  expiresAt: number;
};

type Migration = {
  version: string;
  name: string;
  sql: string;
};

const MIGRATIONS: Migration[] = [
  {
    version: "001",
    name: "create_users",
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        wallet_address TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    version: "002",
    name: "create_auth_nonces",
    sql: `
      CREATE TABLE IF NOT EXISTS auth_nonces (
        wallet_address TEXT PRIMARY KEY REFERENCES users(wallet_address) ON DELETE CASCADE,
        nonce TEXT NOT NULL,
        issued_at TIMESTAMPTZ NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    version: "003",
    name: "create_reputation_events",
    sql: `
      CREATE TABLE IF NOT EXISTS reputation_events (
        id BIGSERIAL PRIMARY KEY,
        wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
        type TEXT NOT NULL,
        value INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    version: "004",
    name: "create_reputation_indexes",
    sql: `
      CREATE INDEX IF NOT EXISTS idx_reputation_events_wallet_created
        ON reputation_events(wallet_address, created_at);

      CREATE INDEX IF NOT EXISTS idx_auth_nonces_expires_at
        ON auth_nonces(expires_at);
    `,
  },
  {
    version: "005",
    name: "create_governance_proposals",
    sql: `
      CREATE TABLE IF NOT EXISTS governance_proposals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        creator_wallet TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
        status TEXT NOT NULL,
        votes_for NUMERIC NOT NULL DEFAULT 0,
        votes_against NUMERIC NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      );
    `,
  },
  {
    version: "006",
    name: "create_governance_votes",
    sql: `
      CREATE TABLE IF NOT EXISTS governance_votes (
        proposal_id TEXT NOT NULL REFERENCES governance_proposals(id) ON DELETE CASCADE,
        wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
        choice TEXT NOT NULL,
        weight NUMERIC NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (proposal_id, wallet_address)
      );

      CREATE INDEX IF NOT EXISTS idx_governance_votes_proposal
        ON governance_votes(proposal_id);

      CREATE INDEX IF NOT EXISTS idx_governance_proposals_status_created
        ON governance_proposals(status, created_at);
    `,
  },
];

const memoryNonceStore = new Map<string, AuthNonceEntry>();
const memoryReputationEventsStore = new Map<string, ReputationEvent[]>();

let pool: PgPool | null = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL;
}

function isPostgresEnabled() {
  return Boolean(getDatabaseUrl());
}

function getPool() {
  if (!isPostgresEnabled()) {
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

async function runMigrations(databasePool: PgPool) {
  await databasePool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  for (const migration of MIGRATIONS) {
    const existingMigration = await databasePool.query(
      `
        SELECT version
        FROM schema_migrations
        WHERE version = $1
        LIMIT 1
      `,
      [migration.version]
    );

    if (existingMigration.rows.length > 0) {
      continue;
    }

    const client = await databasePool.connect();

    try {
      await client.query("BEGIN");
      await client.query(migration.sql);
      await client.query(
        `
          INSERT INTO schema_migrations(version, name)
          VALUES ($1, $2)
        `,
        [migration.version, migration.name]
      );
      await client.query("COMMIT");

      console.log(`Migration ${migration.version}_${migration.name} applied.`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export async function initializeDatabase() {
  const databasePool = getPool();

  if (!databasePool) {
    console.log("SYNORA API using in-memory storage because DATABASE_URL is not set.");
    return;
  }

  await runMigrations(databasePool);

  console.log("SYNORA PostgreSQL storage initialized.");
}

async function ensureUser(walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);
  const databasePool = getPool();

  if (!databasePool) {
    return normalizedWallet;
  }

  await databasePool.query(
    `
      INSERT INTO users(wallet_address)
      VALUES ($1)
      ON CONFLICT(wallet_address)
      DO UPDATE SET updated_at = NOW()
    `,
    [normalizedWallet]
  );

  return normalizedWallet;
}

export async function saveAuthNonce(walletAddress: string, nonceEntry: AuthNonceEntry) {
  const normalizedWallet = await ensureUser(walletAddress);
  const databasePool = getPool();

  if (!databasePool) {
    memoryNonceStore.set(normalizedWallet, nonceEntry);
    return;
  }

  await databasePool.query(
    `
      INSERT INTO auth_nonces(wallet_address, nonce, issued_at, expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT(wallet_address)
      DO UPDATE SET
        nonce = EXCLUDED.nonce,
        issued_at = EXCLUDED.issued_at,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW()
    `,
    [
      normalizedWallet,
      nonceEntry.nonce,
      nonceEntry.issuedAt,
      new Date(nonceEntry.expiresAt).toISOString(),
    ]
  );
}

export async function getAuthNonce(walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);
  const databasePool = getPool();

  if (!databasePool) {
    return memoryNonceStore.get(normalizedWallet) ?? null;
  }

  const result = await databasePool.query(
    `
      SELECT nonce, issued_at, expires_at
      FROM auth_nonces
      WHERE wallet_address = $1
      LIMIT 1
    `,
    [normalizedWallet]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    nonce: String(row.nonce),
    issuedAt: new Date(row.issued_at).toISOString(),
    expiresAt: new Date(row.expires_at).getTime(),
  };
}

export async function deleteAuthNonce(walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);
  const databasePool = getPool();

  if (!databasePool) {
    memoryNonceStore.delete(normalizedWallet);
    return;
  }

  await databasePool.query(
    `
      DELETE FROM auth_nonces
      WHERE wallet_address = $1
    `,
    [normalizedWallet]
  );
}

export async function getWalletEvents(walletAddress: string) {
  const normalizedWallet = await ensureUser(walletAddress);
  const databasePool = getPool();

  if (!databasePool) {
    const existingEvents = memoryReputationEventsStore.get(normalizedWallet);

    if (existingEvents) {
      return existingEvents;
    }

    const initialEvents = createInitialReputationEvents();
    memoryReputationEventsStore.set(normalizedWallet, initialEvents);

    return initialEvents;
  }

  const existingEvents = await databasePool.query(
    `
      SELECT type, value, created_at
      FROM reputation_events
      WHERE wallet_address = $1
      ORDER BY created_at ASC, id ASC
    `,
    [normalizedWallet]
  );

  if (existingEvents.rows.length === 0) {
    const initialEvents = createInitialReputationEvents();

    for (const event of initialEvents) {
      await addWalletEvent(normalizedWallet, event);
    }

    return initialEvents;
  }

  return existingEvents.rows.map((row) => ({
    type: row.type as ReputationEventType,
    value: row.value === null || row.value === undefined ? undefined : Number(row.value),
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function addWalletEvent(walletAddress: string, event: ReputationEvent) {
  const normalizedWallet = await ensureUser(walletAddress);
  const databasePool = getPool();

  if (!databasePool) {
    const events = await getWalletEvents(normalizedWallet);
    events.push(event);
    memoryReputationEventsStore.set(normalizedWallet, events);

    return events;
  }

  await databasePool.query(
    `
      INSERT INTO reputation_events(wallet_address, type, value, created_at)
      VALUES ($1, $2, $3, $4)
    `,
    [normalizedWallet, event.type, event.value ?? null, event.createdAt]
  );

  return getWalletEvents(normalizedWallet);
}
export async function getLeaderboard(limit = 20) {
  const databasePool = getPool();

  if (!databasePool) {
    return Array.from(memoryReputationEventsStore.entries())
      .map(([walletAddress, events]) => {
        const score = events.reduce((total, event) => {
          if (event.type === "PROFILE_CREATED") return total + 10;
          if (event.type === "WALLET_AUTHENTICATED") return total + 20;
          if (event.type === "DASHBOARD_VISITED") return total + 5;
          if (event.type === "SYN_BALANCE_CONNECTED") return total + 30;
          if (event.type === "REWARD_CLAIMED") return total + 10;
          return total;
        }, 0);

        const rewardsClaimed = events.filter((event) => event.type === "REWARD_CLAIMED").length;

        return {
          walletAddress,
          score,
          rewardsClaimed,
          eventsCount: events.length,
          updatedAt: events.at(-1)?.createdAt ?? new Date().toISOString(),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  const result = await databasePool.query(
    `
      SELECT
        wallet_address,
        COUNT(*)::INTEGER AS events_count,
        SUM(
          CASE
            WHEN type = 'PROFILE_CREATED' THEN 10
            WHEN type = 'WALLET_AUTHENTICATED' THEN 20
            WHEN type = 'DASHBOARD_VISITED' THEN 5
            WHEN type = 'SYN_BALANCE_CONNECTED' THEN 30
            WHEN type = 'REWARD_CLAIMED' THEN 10
            ELSE 0
          END
        )::INTEGER AS score,
        SUM(
          CASE
            WHEN type = 'REWARD_CLAIMED' THEN 1
            ELSE 0
          END
        )::INTEGER AS rewards_claimed,
        MAX(created_at) AS updated_at
      FROM reputation_events
      GROUP BY wallet_address
      ORDER BY score DESC, rewards_claimed DESC, events_count DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows.map((row) => ({
    walletAddress: String(row.wallet_address),
    score: Number(row.score),
    rewardsClaimed: Number(row.rewards_claimed),
    eventsCount: Number(row.events_count),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

export async function getAnalytics() {
  const databasePool = getPool();

  if (!databasePool) {
    const allEvents = Array.from(memoryReputationEventsStore.values()).flat();
    const walletAddresses = new Set(
      Array.from(memoryReputationEventsStore.keys())
    );

    const totalRewardsClaimed = allEvents.filter(
      (event) => event.type === "REWARD_CLAIMED"
    ).length;

    const uniqueRewardClaimers = Array.from(memoryReputationEventsStore.entries()).filter(
      ([, events]) => events.some((event) => event.type === "REWARD_CLAIMED")
    ).length;

    const topScore = Array.from(memoryReputationEventsStore.values()).reduce(
      (highestScore, events) => {
        const score = events.reduce((total, event) => {
          if (event.type === "PROFILE_CREATED") return total + 10;
          if (event.type === "WALLET_AUTHENTICATED") return total + 20;
          if (event.type === "DASHBOARD_VISITED") return total + 5;
          if (event.type === "SYN_BALANCE_CONNECTED") return total + 30;
          if (event.type === "REWARD_CLAIMED") return total + 10;
          return total;
        }, 0);

        return Math.max(highestScore, score);
      },
      0
    );

    return {
      totalWallets: walletAddresses.size,
      totalEvents: allEvents.length,
      totalRewardsClaimed,
      topScore,
      totalSynDistributed: totalRewardsClaimed * 10,
      totalRewardClaims: totalRewardsClaimed,
      uniqueRewardClaimers: Array.from(memoryReputationEventsStore.entries()).filter(([, events]) =>
        events.some((event) => event.type === "REWARD_CLAIMED")
      ).length,
      averageRewardsPerUser:
      uniqueRewardClaimers > 0 ? totalRewardsClaimed / uniqueRewardClaimers : 0,
    };
  }

  const result = await databasePool.query(`
    WITH wallet_scores AS (
      SELECT
        wallet_address,
        SUM(
          CASE
            WHEN type = 'PROFILE_CREATED' THEN 10
            WHEN type = 'WALLET_AUTHENTICATED' THEN 20
            WHEN type = 'DASHBOARD_VISITED' THEN 5
            WHEN type = 'SYN_BALANCE_CONNECTED' THEN 30
            WHEN type = 'REWARD_CLAIMED' THEN 10
            ELSE 0
          END
        )::INTEGER AS score
      FROM reputation_events
      GROUP BY wallet_address
    )
    SELECT
      (SELECT COUNT(DISTINCT wallet_address)::INTEGER FROM reputation_events) AS total_wallets,
      (SELECT COUNT(*)::INTEGER FROM reputation_events) AS total_events,
      (SELECT COUNT(*)::INTEGER FROM reputation_events WHERE type = 'REWARD_CLAIMED') AS total_rewards_claimed,
      COALESCE((SELECT MAX(score)::INTEGER FROM wallet_scores), 0) AS top_score,
      (SELECT COUNT(*)::INTEGER FROM reward_claims) AS total_reward_claims,
      (SELECT COUNT(DISTINCT wallet_address)::INTEGER FROM reward_claims) AS unique_reward_claimers
  `);

  const row = result.rows[0];
  const totalRewardsClaimed = Number(row.total_rewards_claimed);
  const totalRewardClaims = Number(row.total_reward_claims ?? totalRewardsClaimed);
  const uniqueRewardClaimers = Number(row.unique_reward_claimers ?? 0);

  return {
    totalWallets: Number(row.total_wallets),
    totalEvents: Number(row.total_events),
    totalRewardsClaimed,
    topScore: Number(row.top_score),
    totalSynDistributed: totalRewardsClaimed * 10,
      totalRewardClaims: totalRewardsClaimed,
      uniqueRewardClaimers: Array.from(memoryReputationEventsStore.entries()).filter(([, events]) =>
        events.some((event) => event.type === "REWARD_CLAIMED")
      ).length,
      averageRewardsPerUser:
      uniqueRewardClaimers > 0 ? totalRewardsClaimed / uniqueRewardClaimers : 0,
  };
}

export type StoredGovernanceVoteChoice = "FOR" | "AGAINST";
export type StoredGovernanceProposalStatus = "ACTIVE" | "CLOSED";

export type StoredGovernanceProposal = {
  id: string;
  title: string;
  description: string;
  creatorWallet: string;
  status: StoredGovernanceProposalStatus;
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
  expiresAt: string;
};

const memoryGovernanceProposals = new Map<string, StoredGovernanceProposal>();
const memoryGovernanceVotes = new Map<string, Set<string>>();
const memoryGovernanceVoteDetails = new Map<
  string,
  Array<{
    walletAddress: string;
    choice: StoredGovernanceVoteChoice;
    weight: number;
    createdAt: string;
  }>
>();

function mapGovernanceProposalRow(row: any): StoredGovernanceProposal {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    creatorWallet: String(row.creator_wallet),
    status: row.status as StoredGovernanceProposalStatus,
    votesFor: Number(row.votes_for),
    votesAgainst: Number(row.votes_against),
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
  };
}

export async function listStoredGovernanceProposals() {
  const databasePool = getPool();

  if (!databasePool) {
    return Array.from(memoryGovernanceProposals.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  }

  const result = await databasePool.query(`
    SELECT id, title, description, creator_wallet, status, votes_for, votes_against, created_at, expires_at
    FROM governance_proposals
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapGovernanceProposalRow);
}

export async function createStoredGovernanceProposal(proposal: StoredGovernanceProposal) {
  await ensureUser(proposal.creatorWallet);

  const databasePool = getPool();

  if (!databasePool) {
    memoryGovernanceProposals.set(proposal.id, proposal);
    memoryGovernanceVotes.set(proposal.id, new Set());
    return proposal;
  }

  await databasePool.query(
    `
      INSERT INTO governance_proposals(
        id,
        title,
        description,
        creator_wallet,
        status,
        votes_for,
        votes_against,
        created_at,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      proposal.id,
      proposal.title,
      proposal.description,
      proposal.creatorWallet,
      proposal.status,
      proposal.votesFor,
      proposal.votesAgainst,
      proposal.createdAt,
      proposal.expiresAt,
    ]
  );

  return proposal;
}

export async function getStoredGovernanceProposal(proposalId: string) {
  const databasePool = getPool();

  if (!databasePool) {
    return memoryGovernanceProposals.get(proposalId) ?? null;
  }

  const result = await databasePool.query(
    `
      SELECT id, title, description, creator_wallet, status, votes_for, votes_against, created_at, expires_at
      FROM governance_proposals
      WHERE id = $1
      LIMIT 1
    `,
    [proposalId]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return mapGovernanceProposalRow(row);
}

export async function updateStoredGovernanceProposal(proposal: StoredGovernanceProposal) {
  const databasePool = getPool();

  if (!databasePool) {
    memoryGovernanceProposals.set(proposal.id, proposal);
    return proposal;
  }

  await databasePool.query(
    `
      UPDATE governance_proposals
      SET
        status = $2,
        votes_for = $3,
        votes_against = $4
      WHERE id = $1
    `,
    [proposal.id, proposal.status, proposal.votesFor, proposal.votesAgainst]
  );

  return proposal;
}

export async function hasStoredGovernanceVote(proposalId: string, walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);
  const databasePool = getPool();

  if (!databasePool) {
    return memoryGovernanceVotes.get(proposalId)?.has(normalizedWallet) ?? false;
  }

  const result = await databasePool.query(
    `
      SELECT proposal_id
      FROM governance_votes
      WHERE proposal_id = $1 AND wallet_address = $2
      LIMIT 1
    `,
    [proposalId, normalizedWallet]
  );

  return result.rows.length > 0;
}

export async function createStoredGovernanceVote(params: {
  proposalId: string;
  walletAddress: string;
  choice: StoredGovernanceVoteChoice;
  weight: number;
}) {
  const normalizedWallet = await ensureUser(params.walletAddress);
  const databasePool = getPool();

  if (!databasePool) {
    const proposalVotes = memoryGovernanceVotes.get(params.proposalId) ?? new Set<string>();
    proposalVotes.add(normalizedWallet);
    memoryGovernanceVotes.set(params.proposalId, proposalVotes);

    const proposalVoteDetails = memoryGovernanceVoteDetails.get(params.proposalId) ?? [];
    proposalVoteDetails.push({
      walletAddress: normalizedWallet,
      choice: params.choice,
      weight: params.weight,
      createdAt: new Date().toISOString(),
    });
    memoryGovernanceVoteDetails.set(params.proposalId, proposalVoteDetails);
    return;
  }

  await databasePool.query(
    `
      INSERT INTO governance_votes(proposal_id, wallet_address, choice, weight)
      VALUES ($1, $2, $3, $4)
    `,
    [params.proposalId, normalizedWallet, params.choice, params.weight]
  );
}

export async function listStoredGovernanceVotes(proposalId: string) {
  const databasePool = getPool();

  if (!databasePool) {
    return memoryGovernanceVoteDetails.get(proposalId) ?? [];
  }

  const result = await databasePool.query(
    `
      SELECT wallet_address, choice, weight, created_at
      FROM governance_votes
      WHERE proposal_id = $1
      ORDER BY created_at ASC
    `,
    [proposalId]
  );

  return result.rows.map((row) => ({
    walletAddress: String(row.wallet_address),
    choice: row.choice as StoredGovernanceVoteChoice,
    weight: Number(row.weight),
    createdAt: new Date(row.created_at).toISOString(),
  }));
}




