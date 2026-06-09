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
import { logger } from "./observability/logger.js";
import { buildReputationProfile } from "./reputation/engine.js";
import { createRewardAuthorization } from "./rewards/authorization.js";
import {
  canClaimMvpReward,
  createMvpRewardClaim,
  getRecentRewardClaims,
} from "./rewards/repository.js";
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

  const rewardClaimRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
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
      logger.warn("auth.nonce.invalid_wallet");
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

    logger.info("auth.nonce.created", { walletAddress });

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
      logger.warn("auth.verify.invalid_payload");
      return response.status(400).json({
        error: "INVALID_AUTH_PAYLOAD",
      });
    }

    const walletAddress = getAddress(parsed.data.walletAddress);
    const nonceEntry = await getAuthNonce(walletAddress);

    if (!nonceEntry) {
      logger.warn("auth.verify.nonce_not_found", { walletAddress });
      return response.status(400).json({
        error: "NONCE_NOT_FOUND",
      });
    }

    if (Date.now() > nonceEntry.expiresAt) {
      await deleteAuthNonce(walletAddress);

      logger.warn("auth.verify.nonce_expired", { walletAddress });
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
      logger.warn("auth.verify.invalid_signature", { walletAddress });
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

    logger.info("auth.verify.success", { walletAddress });

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

  app.get("/auth/me", async (request, response) => {
    const walletAddress = getAuthenticatedWallet(request.headers.authorization);

    if (!walletAddress) {
      return response.status(401).json({
        error: "INVALID_TOKEN",
      });
    }

    const events = await getWalletEvents(walletAddress);

    const reputationProfile = buildReputationProfile({
      walletAddress,
      events,
    });

    return response.json({
      user: {
        walletAddress,
        score: reputationProfile.score,
        level: reputationProfile.level,
        rewardsClaimed: reputationProfile.rewardsClaimed,
      },
      reputation: reputationProfile,
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

  app.get("/reputation/:walletAddress/events", async (request, response) => {
    const walletAddressParam = request.params.walletAddress;

    if (!isAddress(walletAddressParam)) {
      return response.status(400).json({
        error: "INVALID_WALLET_ADDRESS",
      });
    }

    const walletAddress = getAddress(walletAddressParam);
    const events = await getWalletEvents(walletAddress);

    return response.json({
      walletAddress,
      events: events
        .slice()
        .reverse()
        .slice(0, 20),
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

    const reputationProfile = buildReputationProfile({
      walletAddress: authenticatedWallet,
      events,
    });

    logger.info("reputation.event.created", {
      walletAddress: authenticatedWallet,
      type: parsed.data.type,
      score: reputationProfile.score,
    });

    return response.json({
      reputation: reputationProfile,
    });
  });

  app.get("/rewards/:walletAddress", async (request, response) => {
    const walletAddressParam = request.params.walletAddress;

    if (!isAddress(walletAddressParam)) {
      return response.status(400).json({
        error: "INVALID_WALLET_ADDRESS",
      });
    }

    const walletAddress = getAddress(walletAddressParam);
    const claims = await getRecentRewardClaims(walletAddress);

    return response.json({
      walletAddress,
      claims,
    });
  });

  app.post("/rewards/authorize", rewardClaimRateLimit, async (request, response) => {
    const authenticatedWallet = getAuthenticatedWallet(request.headers.authorization);

    if (!authenticatedWallet) {
      return response.status(401).json({
        error: "INVALID_TOKEN",
      });
    }

    const eventsBeforeAuthorization = await getWalletEvents(authenticatedWallet);
    const profileBeforeAuthorization = buildReputationProfile({
      walletAddress: authenticatedWallet,
      events: eventsBeforeAuthorization,
    });

    if (profileBeforeAuthorization.score < 60) {
      return response.status(403).json({
        error: "REWARD_SCORE_TOO_LOW",
      });
    }

    const claimEligibility = await canClaimMvpReward(authenticatedWallet);

    if (!claimEligibility.allowed) {
      return response.status(409).json({
        error: claimEligibility.reason ?? "REWARD_NOT_ALLOWED",
      });
    }

    const rewardId = crypto.randomBytes(32).toString("hex");
    const normalizedRewardId = `0x${rewardId}`;

    try {
      const authorization = await createRewardAuthorization({
        rewardId: normalizedRewardId,
        walletAddress: authenticatedWallet,
        amountSyn: 10,
      });

      logger.info("rewards.authorization.created", {
        walletAddress: authenticatedWallet,
        rewardId: normalizedRewardId,
      });

      return response.json({
        authorization,
      });
    } catch (error) {
      logger.error("rewards.authorization.failed", {
        walletAddress: authenticatedWallet,
        message: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      });

      return response.status(503).json({
        error: "REWARDS_AUTHORIZATION_NOT_CONFIGURED",
      });
    }
  });
  app.post("/rewards/claim", rewardClaimRateLimit, async (request, response) => {
    const authenticatedWallet = getAuthenticatedWallet(request.headers.authorization);

    if (!authenticatedWallet) {
      return response.status(401).json({
        error: "INVALID_TOKEN",
      });
    }

    const eventsBeforeClaim = await getWalletEvents(authenticatedWallet);
    const profileBeforeClaim = buildReputationProfile({
      walletAddress: authenticatedWallet,
      events: eventsBeforeClaim,
    });

    if (profileBeforeClaim.score < 60) {
      logger.warn("rewards.claim.score_too_low", {
        walletAddress: authenticatedWallet,
        score: profileBeforeClaim.score,
      });

      return response.status(403).json({
        error: "REWARD_SCORE_TOO_LOW",
      });
    }

    const claimEligibility = await canClaimMvpReward(authenticatedWallet);

    if (!claimEligibility.allowed) {
      logger.warn("rewards.claim.rejected", {
        walletAddress: authenticatedWallet,
        reason: claimEligibility.reason,
      });

      return response.status(409).json({
        error: claimEligibility.reason ?? "REWARD_NOT_ALLOWED",
      });
    }

    const rewardClaim = await createMvpRewardClaim(authenticatedWallet);

    const eventsAfterClaim = await addWalletEvent(authenticatedWallet, {
      type: "REWARD_CLAIMED",
      value: rewardClaim.amount,
      createdAt: rewardClaim.createdAt,
    });

    const reputationProfile = buildReputationProfile({
      walletAddress: authenticatedWallet,
      events: eventsAfterClaim,
    });

    logger.info("rewards.claim.created", {
      walletAddress: authenticatedWallet,
      rewardType: rewardClaim.rewardType,
      amount: rewardClaim.amount,
      score: reputationProfile.score,
    });

    return response.json({
      rewardClaim,
      reputation: reputationProfile,
      user: {
        walletAddress: authenticatedWallet,
        score: reputationProfile.score,
        level: reputationProfile.level,
        rewardsClaimed: reputationProfile.rewardsClaimed,
      },
    });
  });

  return app;
}