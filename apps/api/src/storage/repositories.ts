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

export async function initializeDatabase() {
  const databasePool = getPool();

  if (!databasePool) {
    console.log("SYNORA API using in-memory storage because DATABASE_URL is not set.");
    return;
  }

  await databasePool.query(`
    CREATE TABLE IF NOT EXISTS users (
      wallet_address TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS auth_nonces (
      wallet_address TEXT PRIMARY KEY REFERENCES users(wallet_address) ON DELETE CASCADE,
      nonce TEXT NOT NULL,
      issued_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reputation_events (
      id BIGSERIAL PRIMARY KEY,
      wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
      type TEXT NOT NULL,
      value INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_reputation_events_wallet_created
      ON reputation_events(wallet_address, created_at);
  `);

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