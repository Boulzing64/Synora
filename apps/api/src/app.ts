import { config } from "dotenv";
import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getAddress, isAddress, verifyMessage } from "viem";
import { z } from "zod";

import { buildAuthMessage } from "./auth/messages.js";
import { buildReputationProfile } from "./reputation/engine.js";
import {
  addWalletEvent,
  deleteAuthNonce,
  getAuthNonce,
  getWalletEvents,
  saveAuthNonce,
} from "./storage/repositories.js";

export function createSynoraApp() {
  config({ path: ".env.local" });

  const app = express();

  app.set("trust proxy", 1);

  const jwtSecret = process.env.JWT_SECRET ?? "";
  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  const webOrigins = process.env.WEB_ORIGINS;

  const allowedOrigins = [
    webOrigin,
    ...(webOrigins
      ? webOrigins
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean)
      : []),
  ];

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET manquant ou trop court. Minimum recommande: 32 caracteres.");
  }

  const jwtOptions = {
    issuer: "synora-api",
    audience: "synora-web",
  } as const;

  const authNonceRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authVerifyRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const reputationEventRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });

  function getAuthenticatedWallet(authorizationHeader: string | undefined) {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authorizationHeader.slice("Bearer ".length);

    try {
      const payload = jwt.verify(token, jwtSecret, jwtOptions) as JwtPayload & {
        walletAddress?: string;
      };

      if (!payload.walletAddress || !isAddress(payload.walletAddress)) {
        return null;
      }

      return getAddress(payload.walletAddress);
    } catch {
      return null;
    }
  }

  app.use(helmet());

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS_ORIGIN_NOT_ALLOWED"));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "64kb" }));

  app.get("/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "synora-api",
    });
  });

  app.post("/auth/nonce", authNonceRateLimit, async (request, response) => {
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

    await saveAuthNonce(walletAddress, {
      nonce,
      issuedAt,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await addWalletEvent(walletAddress, {
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

  app.post("/auth/verify", authVerifyRateLimit, async (request, response) => {
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
    const nonceEntry = await getAuthNonce(walletAddress);

    if (!nonceEntry) {
      return response.status(400).json({
        error: "NONCE_NOT_FOUND",
      });
    }

    if (Date.now() > nonceEntry.expiresAt) {
      await deleteAuthNonce(walletAddress);

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

    await deleteAuthNonce(walletAddress);

    const events = await addWalletEvent(walletAddress, {
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
        ...jwtOptions,
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
    const walletAddress = getAuthenticatedWallet(request.headers.authorization);

    if (!walletAddress) {
      return response.status(401).json({
        error: "INVALID_TOKEN",
      });
    }

    return response.json({
      user: {
        walletAddress,
      },
    });
  });

  app.get("/reputation/:walletAddress", async (request, response) => {
    const walletAddressParam = request.params.walletAddress;

    if (!isAddress(walletAddressParam)) {
      return response.status(400).json({
        error: "INVALID_WALLET_ADDRESS",
      });
    }

    const walletAddress = getAddress(walletAddressParam);
    const events = await getWalletEvents(walletAddress);

    return response.json({
      reputation: buildReputationProfile({
        walletAddress,
        events,
      }),
    });
  });

  app.post("/reputation/event", reputationEventRateLimit, async (request, response) => {
    const authenticatedWallet = getAuthenticatedWallet(request.headers.authorization);

    if (!authenticatedWallet) {
      return response.status(401).json({
        error: "INVALID_TOKEN",
      });
    }

    const schema = z.object({
      type: z.enum(["DASHBOARD_VISITED", "SYN_BALANCE_CONNECTED", "REWARD_CLAIMED"]),
      value: z.number().min(0).max(100).optional(),
    });

    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        error: "INVALID_REPUTATION_EVENT",
      });
    }

    const events = await addWalletEvent(authenticatedWallet, {
      type: parsed.data.type,
      value: parsed.data.value,
      createdAt: new Date().toISOString(),
    });

    return response.json({
      reputation: buildReputationProfile({
        walletAddress: authenticatedWallet,
        events,
      }),
    });
  });

  return app;
}