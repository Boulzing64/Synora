import { config } from "dotenv";
import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { getAddress, isAddress, verifyMessage } from "viem";
import { z } from "zod";

import { buildAuthMessage } from "./auth/messages.js";
import {
  buildReputationProfile,
  createInitialReputationEvents,
  type ReputationEvent,
} from "./reputation/engine.js";

config({ path: ".env.local" });

const app = express();

const apiPort = Number(process.env.API_PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET;
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET manquant ou trop court. Minimum recommande: 32 caracteres.");
}

const nonceStore = new Map<
  string,
  {
    nonce: string;
    issuedAt: string;
    expiresAt: number;
  }
>();

const reputationEventsStore = new Map<string, ReputationEvent[]>();

function getWalletEvents(walletAddress: string) {
  const existingEvents = reputationEventsStore.get(walletAddress);

  if (existingEvents) {
    return existingEvents;
  }

  const initialEvents = createInitialReputationEvents();
  reputationEventsStore.set(walletAddress, initialEvents);

  return initialEvents;
}

function addWalletEvent(walletAddress: string, event: ReputationEvent) {
  const events = getWalletEvents(walletAddress);
  events.push(event);
  reputationEventsStore.set(walletAddress, events);

  return events;
}

app.use(
  cors({
    origin: webOrigin,
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "synora-api",
  });
});

app.post("/auth/nonce", (request, response) => {
  const schema = z.object({
    walletAddress: z.string(),
  });

  const parsed = schema.safeParse(request.body);

  if (!parsed.success || !isAddress(parsed.data.walletAddress)) {
    return response.status(400).json({
      error: "INVALID_WALLET_ADDRESS",
    });
  }

  const walletAddress = getAddress(parsed.data.walletAddress);
  const nonce = crypto.randomBytes(16).toString("hex");
  const issuedAt = new Date().toISOString();

  nonceStore.set(walletAddress, {
    nonce,
    issuedAt,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  addWalletEvent(walletAddress, {
    type: "DASHBOARD_VISITED",
    createdAt: issuedAt,
  });

  const message = buildAuthMessage({
    domain: "synora.local",
    walletAddress,
    nonce,
    issuedAt,
  });

  return response.json({
    walletAddress,
    nonce,
    issuedAt,
    message,
  });
});

app.post("/auth/verify", async (request, response) => {
  const schema = z.object({
    walletAddress: z.string(),
    signature: z.string(),
  });

  const parsed = schema.safeParse(request.body);

  if (!parsed.success || !isAddress(parsed.data.walletAddress)) {
    return response.status(400).json({
      error: "INVALID_AUTH_PAYLOAD",
    });
  }

  const walletAddress = getAddress(parsed.data.walletAddress);
  const nonceEntry = nonceStore.get(walletAddress);

  if (!nonceEntry) {
    return response.status(400).json({
      error: "NONCE_NOT_FOUND",
    });
  }

  if (Date.now() > nonceEntry.expiresAt) {
    nonceStore.delete(walletAddress);

    return response.status(400).json({
      error: "NONCE_EXPIRED",
    });
  }

  const message = buildAuthMessage({
    domain: "synora.local",
    walletAddress,
    nonce: nonceEntry.nonce,
    issuedAt: nonceEntry.issuedAt,
  });

  const isValidSignature = await verifyMessage({
    address: walletAddress,
    message,
    signature: parsed.data.signature as `0x${string}`,
  });

  if (!isValidSignature) {
    return response.status(401).json({
      error: "INVALID_SIGNATURE",
    });
  }

  nonceStore.delete(walletAddress);

  const events = addWalletEvent(walletAddress, {
    type: "WALLET_AUTHENTICATED",
    createdAt: new Date().toISOString(),
  });

  const reputationProfile = buildReputationProfile({
    walletAddress,
    events,
  });

  const token = jwt.sign(
    {
      sub: walletAddress,
      walletAddress,
    },
    jwtSecret,
    {
      expiresIn: "1h",
      issuer: "synora-api",
      audience: "synora-web",
    }
  );

  return response.json({
    token,
    user: {
      walletAddress,
      score: reputationProfile.score,
      level: reputationProfile.level,
      rewardsClaimed: reputationProfile.rewardsClaimed,
    },
    reputation: reputationProfile,
  });
});

app.get("/auth/me", (request, response) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return response.status(401).json({
      error: "MISSING_TOKEN",
    });
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, jwtSecret, {
      issuer: "synora-api",
      audience: "synora-web",
    });

    return response.json({
      user: payload,
    });
  } catch {
    return response.status(401).json({
      error: "INVALID_TOKEN",
    });
  }
});

app.get("/reputation/:walletAddress", (request, response) => {
  const walletAddressParam = request.params.walletAddress;

  if (!isAddress(walletAddressParam)) {
    return response.status(400).json({
      error: "INVALID_WALLET_ADDRESS",
    });
  }

  const walletAddress = getAddress(walletAddressParam);
  const events = getWalletEvents(walletAddress);

  return response.json({
    reputation: buildReputationProfile({
      walletAddress,
      events,
    }),
  });
});

app.post("/reputation/event", (request, response) => {
  const schema = z.object({
    walletAddress: z.string(),
    type: z.enum([
      "PROFILE_CREATED",
      "WALLET_AUTHENTICATED",
      "DASHBOARD_VISITED",
      "SYN_BALANCE_CONNECTED",
      "REWARD_CLAIMED",
    ]),
    value: z.number().min(0).max(100).optional(),
  });

  const parsed = schema.safeParse(request.body);

  if (!parsed.success || !isAddress(parsed.data.walletAddress)) {
    return response.status(400).json({
      error: "INVALID_REPUTATION_EVENT",
    });
  }

  const walletAddress = getAddress(parsed.data.walletAddress);

  const events = addWalletEvent(walletAddress, {
    type: parsed.data.type,
    value: parsed.data.value,
    createdAt: new Date().toISOString(),
  });

  return response.json({
    reputation: buildReputationProfile({
      walletAddress,
      events,
    }),
  });
});

app.listen(apiPort, () => {
  console.log(`SYNORA API listening on http://localhost:${apiPort}`);
});