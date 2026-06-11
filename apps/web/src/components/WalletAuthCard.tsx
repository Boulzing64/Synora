"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { OnboardingJourney } from "@/components/OnboardingJourney";
import {
  claimSynoraReward,
  getAuthenticatedUser,
  getReputationEvents,
  reportReputationEvent,
  requestAuthNonce,
  requestRewardAuthorization,
  type SynoraReputationEvent,
  type SynoraReputationProfile,
  type SynoraUser,
  verifyAuthSignature,
} from "@/lib/api";
import { getInitialLocale, translations, type SynoraLocale } from "@/lib/i18n";
import {
  BASE_SEPOLIA_CHAIN_ID_HEX,
  BASE_SEPOLIA_EXPLORER_URL,
  BASE_SEPOLIA_RPC_URL,
} from "@/lib/chain";
import { getSynBalance } from "@/lib/synToken";

const SESSION_STORAGE_KEY = "synora.authToken";

function formatEventType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function getEventPoints(type: SynoraReputationEvent["type"]) {
  const points: Record<SynoraReputationEvent["type"], number> = {
    PROFILE_CREATED: 25,
    WALLET_AUTHENTICATED: 15,
    DASHBOARD_VISITED: 5,
    SYN_BALANCE_CONNECTED: 20,
    REWARD_CLAIMED: 10,
  };

  return points[type];
}

export function WalletAuthCard() {
  const [locale, setLocale] = useState<SynoraLocale>("fr");
  const t = translations[locale];

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [user, setUser] = useState<SynoraUser | null>(null);
  const [reputation, setReputation] = useState<SynoraReputationProfile | null>(null);
  const [events, setEvents] = useState<SynoraReputationEvent[]>([]);
  const [synBalance, setSynBalance] = useState<string>("0");
  const [status, setStatus] = useState<string>("Wallet non connecte");
  const [error, setError] = useState<string>("");
  const [rewardAuthorizationStatus, setRewardAuthorizationStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  queueMicrotask(() => setLocale(getInitialLocale()));

  function onLocaleChange(event: Event) {
    const customEvent = event as CustomEvent<SynoraLocale>;

    if (customEvent.detail === "fr" || customEvent.detail === "en") {
      setLocale(customEvent.detail);
    }
  }

  window.addEventListener("synora-locale-change", onLocaleChange);

  return () => {
    window.removeEventListener("synora-locale-change", onLocaleChange);
  };
  }, []);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!savedToken) {
      return;
    }

    const token = savedToken;
    let isMounted = true;

    async function restoreSession() {
      try {
        setStatus("Restauration de la session...");

        const authMeResponse = await getAuthenticatedUser(token);

        if (!isMounted) {
          return;
        }

        setAuthToken(token);
        setWalletAddress(authMeResponse.user.walletAddress);
        setUser(authMeResponse.user);
        setReputation(authMeResponse.reputation);

        const eventsResponse = await getReputationEvents(authMeResponse.user.walletAddress);

        if (isMounted) {
          setEvents(eventsResponse.events);
        }

        try {
          const balance = await getSynBalance(authMeResponse.user.walletAddress);

          if (isMounted) {
            setSynBalance(Number(balance.formattedBalance).toLocaleString("fr-FR"));
          }
        } catch {
          if (isMounted) {
            setSynBalance("0");
          }
        }

        setStatus("Session restauree");
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        window.dispatchEvent(new Event("synora-auth-change"));

        if (isMounted) {
          setStatus("Wallet non connecte");
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const shortWallet = useMemo(() => {
    if (!walletAddress) {
      return "Non connecte";
    }

    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const canClaimReward = Boolean(authToken && user && user.score >= 60);
  const score = user?.score ?? 0;
  const scoreProgress = Math.min((score / 1000) * 100, 100);
  const nextLevel =
    score < 150
      ? { label: "SILVER", target: 150 }
      : score < 400
        ? { label: "GOLD", target: 400 }
        : score < 750
          ? { label: "PLATINUM", target: 750 }
          : { label: "MAX", target: 1000 };
  const pointsToNextLevel = Math.max(nextLevel.target - score, 0);
  const ui =
    locale === "en"
      ? {
          identity: "Wallet identity",
          verified: "Verified session",
          disconnected: "Not connected",
          overview: "Reputation overview",
          progress: "Global progress",
          nextLevel: "points to",
          balance: "Available SYN",
          rewards: "Rewards claimed",
          activity: "Verified events",
          recommended: "Recommended action",
          recommendedTitle: authToken
            ? canClaimReward
              ? "Claim your next reward"
              : "Increase your reputation"
            : "Authenticate your wallet",
          recommendedText: authToken
            ? canClaimReward
              ? "Your score is high enough to test the SYNORA reward flow."
              : "Connect your SYN balance and explore the ecosystem to reach 60 points."
            : "Sign a secure message to unlock reputation, rewards and beta access.",
          activityTitle: "Recent activity",
          emptyActivity: "Your verified actions will appear here.",
          quickAccess: "Ecosystem shortcuts",
          beta: "Founding beta",
          staking: "Staking",
          governance: "Governance",
          security: "No private key is ever requested. Authentication uses a wallet signature.",
          updated: "Updated",
          disconnect: "Disconnect",
          technical: "Technical reward test",
        }
      : {
          identity: "Identite wallet",
          verified: "Session verifiee",
          disconnected: "Non connecte",
          overview: "Vue reputation",
          progress: "Progression globale",
          nextLevel: "points avant",
          balance: "SYN disponibles",
          rewards: "Rewards reclames",
          activity: "Evenements verifies",
          recommended: "Action recommandee",
          recommendedTitle: authToken
            ? canClaimReward
              ? "Reclame ta prochaine reward"
              : "Augmente ta reputation"
            : "Authentifie ton wallet",
          recommendedText: authToken
            ? canClaimReward
              ? "Ton score permet maintenant de tester le parcours reward SYNORA."
              : "Connecte ta balance SYN et explore l'ecosysteme pour atteindre 60 points."
            : "Signe un message securise pour debloquer reputation, rewards et acces beta.",
          activityTitle: "Activite recente",
          emptyActivity: "Tes actions verifiees apparaitront ici.",
          quickAccess: "Raccourcis ecosysteme",
          beta: "Founding beta",
          staking: "Staking",
          governance: "Gouvernance",
          security:
            "Aucune cle privee n'est demandee. L'authentification utilise une signature wallet.",
          updated: "Mis a jour",
          disconnect: "Deconnecter",
          technical: "Test technique reward",
        };

  async function refreshEvents(currentWalletAddress: string) {
    const eventsResponse = await getReputationEvents(currentWalletAddress);
    setEvents(eventsResponse.events);
  }

  function applyReputationProfile(profile: SynoraReputationProfile) {
    setUser({
      walletAddress: profile.walletAddress,
      score: profile.score,
      level: profile.level,
      rewardsClaimed: profile.rewardsClaimed,
    });

    setReputation(profile);
  }

  async function ensureBaseSepoliaNetwork() {
    if (!window.ethereum) {
      throw new Error("MetaMask est introuvable.");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: BASE_SEPOLIA_CHAIN_ID_HEX,
          },
        ],
      });
    } catch (switchError) {
      const errorCode =
        typeof switchError === "object" &&
        switchError !== null &&
        "code" in switchError
          ? Number((switchError as { code: unknown }).code)
          : 0;

      if (errorCode !== 4902) {
        throw switchError;
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: BASE_SEPOLIA_CHAIN_ID_HEX,
            chainName: "Base Sepolia",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [BASE_SEPOLIA_RPC_URL],
            blockExplorerUrls: [BASE_SEPOLIA_EXPLORER_URL],
          },
        ],
      });
    }
  }

  async function connectAndAuthenticate() {
    setIsLoading(true);
    setError("");
    setRewardAuthorizationStatus("");

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask est introuvable.");
      }

      setStatus("Connexion au reseau Base Sepolia...");
      await ensureBaseSepoliaNetwork();

      setStatus("Connexion au wallet...");

      const accounts = await window.ethereum.request<string[]>({
        method: "eth_requestAccounts",
      });

      const connectedWallet = accounts[0];

      if (!connectedWallet) {
        throw new Error("Aucun wallet connecte.");
      }

      setWalletAddress(connectedWallet);
      setStatus("Lecture de la balance SYN...");

      const balance = await getSynBalance(connectedWallet);
      setSynBalance(Number(balance.formattedBalance).toLocaleString("fr-FR"));

      setStatus("Creation du message de signature...");

      const nonceResponse = await requestAuthNonce(connectedWallet);

      setStatus("Signature du message dans MetaMask...");

      const signature = await window.ethereum.request<string>({
        method: "personal_sign",
        params: [nonceResponse.message, connectedWallet],
      });

      setStatus("Verification de la signature...");

      const verifyResponse = await verifyAuthSignature({
        walletAddress: connectedWallet,
        signature,
      });

      setAuthToken(verifyResponse.token);
      window.localStorage.setItem(SESSION_STORAGE_KEY, verifyResponse.token);
      window.dispatchEvent(new Event("synora-auth-change"));

      setUser(verifyResponse.user);
      setReputation(verifyResponse.reputation);

      setStatus("Mise a jour de la reputation...");

      const reputationResponse = await reportReputationEvent(
        {
          type: "SYN_BALANCE_CONNECTED",
        },
        verifyResponse.token
      );

      applyReputationProfile(reputationResponse.reputation);
      await refreshEvents(connectedWallet);
      setStatus("Authentifie avec succes");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Erreur inconnue pendant l'authentification.";

      setError(message);
      setStatus("Echec de l'authentification");
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshBalance() {
    if (!walletAddress) {
      setError("Connecte d'abord ton wallet.");
      return;
    }

    setIsLoading(true);
    setError("");
    setRewardAuthorizationStatus("");

    try {
      setStatus("Actualisation de la balance SYN...");
      const balance = await getSynBalance(walletAddress);
      setSynBalance(Number(balance.formattedBalance).toLocaleString("fr-FR"));
      await refreshEvents(walletAddress);
      setStatus(authToken ? "Authentifie avec succes" : "Balance actualisee");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Erreur inconnue pendant la lecture de balance.";

      setError(message);
      setStatus("Erreur lecture balance");
    } finally {
      setIsLoading(false);
    }
  }

  async function claimReward() {
    if (!walletAddress || !authToken) {
      setError("Connecte et authentifie ton wallet avant de reclamer une recompense.");
      return;
    }

    if (!canClaimReward) {
      setError("Score insuffisant pour reclamer une recompense MVP.");
      return;
    }

    setIsLoading(true);
    setError("");
    setRewardAuthorizationStatus("");

    try {
      setStatus("Claim recompense MVP...");

      const rewardResponse = await claimSynoraReward(authToken);
      window.dispatchEvent(new Event("synora-notifications-refresh"));

      applyReputationProfile(rewardResponse.reputation);
      await refreshEvents(walletAddress);
      setStatus("Recompense MVP enregistree");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Erreur inconnue pendant le claim recompense.";

      setError(message);
      setStatus("Echec claim recompense");
    } finally {
      setIsLoading(false);
    }
  }

  async function testRewardAuthorization() {
    if (!authToken) {
      setError("Connecte et authentifie ton wallet avant de tester l'autorisation rewards.");
      return;
    }

    setIsLoading(true);
    setError("");
    setRewardAuthorizationStatus("");

    try {
      setStatus("Generation autorisation rewards...");

      const response = await requestRewardAuthorization(authToken);

      setRewardAuthorizationStatus(
        `Autorisation OK: ${response.authorization.amount} wei, rewardId ${response.authorization.rewardId.slice(0, 10)}...`
      );

      setStatus("Autorisation rewards generee");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Erreur inconnue pendant l'autorisation rewards.";

      setError(message);
      setStatus("Echec autorisation rewards");
    } finally {
      setIsLoading(false);
    }
  }

  function disconnect() {
    setWalletAddress("");
    setAuthToken("");
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new Event("synora-auth-change"));
    setUser(null);
    setReputation(null);
    setEvents([]);
    setSynBalance("0");
    setStatus("Wallet non connecte");
    setError("");
    setRewardAuthorizationStatus("");
  }

  return (
    <div className="space-y-5">
      <OnboardingJourney
        locale={locale}
        walletAddress={walletAddress}
        authToken={authToken}
        score={score}
        events={events}
        onConnect={connectAndAuthenticate}
        isLoading={isLoading}
      />

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
      <div className="space-y-5">
        <section className="premium-panel overflow-hidden rounded-[28px] p-5 sm:p-7">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center">
            <div
              className="relative grid h-40 w-40 shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#43d9ff ${scoreProgress}%, rgba(255,255,255,0.06) ${scoreProgress}%)`,
              }}
            >
              <div className="grid h-[138px] w-[138px] place-items-center rounded-full bg-[#07101f] text-center">
                <div>
                  <p className="text-5xl font-black tracking-[-0.06em]">{score}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                    Synora Score
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-bold text-cyan-200">
                  {user?.level ?? "BRONZE"}
                </span>
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                    authToken
                      ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
                      : "border-white/10 bg-white/[0.03] text-slate-500"
                  }`}
                >
                  {authToken ? ui.verified : ui.disconnected}
                </span>
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                {ui.identity}
              </p>
              <h2 className="mt-2 break-all font-mono text-xl font-bold text-white sm:text-2xl">
                {shortWallet}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{status}</p>

              <div className="mt-6">
                <div className="flex justify-between gap-4 text-xs font-semibold text-slate-500">
                  <span>{ui.progress}</span>
                  <span>
                    {pointsToNextLevel} {ui.nextLevel} {nextLevel.label}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all duration-700"
                    style={{ width: `${scoreProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              [ui.balance, `${synBalance} SYN`],
              [ui.rewards, String(user?.rewardsClaimed ?? 0)],
              [ui.activity, String(reputation?.eventsCount ?? 0)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="premium-panel rounded-[28px] p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-400">
                {ui.activityTitle}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {reputation ? `${ui.updated} ${new Date(reputation.updatedAt).toLocaleString(locale)}` : ui.emptyActivity}
              </p>
            </div>
            <Link href="/reputation" className="text-xs font-bold text-cyan-300 hover:text-cyan-200">
              {locale === "en" ? "Full history →" : "Historique complet →"}
            </Link>
          </div>

          <div className="mt-6 space-y-1">
            {events.length > 0 ? (
              [...events].reverse().slice(0, 6).map((event, index) => (
                <div
                  key={`${event.type}-${event.createdAt}-${index}`}
                  className="flex items-center gap-4 border-b border-white/[0.05] py-4 last:border-0"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] text-xs font-black text-cyan-300">
                    +{getEventPoints(event.type) + (event.value ?? 0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-200">{formatEventType(event.type)}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {new Date(event.createdAt).toLocaleString(locale)}
                    </p>
                  </div>
                  <span className="hidden text-xs font-semibold text-emerald-400 sm:block">
                    VERIFIED
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-600">
                {ui.emptyActivity}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <section className="rounded-[28px] border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.08] via-[#0a1526] to-violet-400/[0.06] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
            {ui.recommended}
          </p>
          <h3 className="mt-4 text-2xl font-black">{ui.recommendedTitle}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">{ui.recommendedText}</p>

          <button
            type="button"
            onClick={
              authToken
                ? canClaimReward
                  ? claimReward
                  : refreshBalance
                : connectAndAuthenticate
            }
            disabled={isLoading}
            className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-[#03101b] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "..."
              : authToken
                ? canClaimReward
                  ? t.claimReward
                  : t.refreshBalance
                : t.connectSign}
          </button>

          <p className="mt-4 text-xs leading-5 text-slate-600">{ui.security}</p>
        </section>

        <section className="premium-panel rounded-[28px] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
            {ui.quickAccess}
          </p>
          <div className="mt-4 grid gap-2">
            {[
              ["/obtenir-syn", ui.beta, "100 SYN"],
              ["/staking", ui.staking, locale === "en" ? "Voting power" : "Poids DAO"],
              ["/governance", ui.governance, locale === "en" ? "Proposals" : "Propositions"],
            ].map(([href, label, meta]) => (
              <Link
                key={href}
                href={href}
                className="premium-card flex items-center justify-between rounded-2xl px-4 py-4"
              >
                <span className="font-bold text-slate-200">{label}</span>
                <span className="text-xs font-semibold text-slate-500">{meta} →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="premium-panel rounded-[28px] p-5 sm:p-6">
          <div className="grid gap-2">
            <button
              type="button"
              onClick={refreshBalance}
              disabled={isLoading || !walletAddress}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-40"
            >
              {t.refreshBalance}
            </button>
            <button
              type="button"
              onClick={testRewardAuthorization}
              disabled={isLoading || !authToken}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-400 transition hover:bg-white/[0.04] disabled:opacity-40"
            >
              {ui.technical}
            </button>
            {authToken ? (
              <button
                type="button"
                onClick={disconnect}
                className="rounded-xl px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-400/[0.05]"
              >
                {ui.disconnect}
              </button>
            ) : null}
          </div>
        </section>

        {rewardAuthorizationStatus ? (
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4 text-sm text-cyan-200">
            {rewardAuthorizationStatus}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
