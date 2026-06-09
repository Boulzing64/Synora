"use client";

import { useEffect, useMemo, useState } from "react";

import {
  claimSynoraReward,
  requestRewardAuthorization,
  getAuthenticatedUser,
  getReputationEvents,
  reportReputationEvent,
  requestAuthNonce,
  type SynoraReputationEvent,
  type SynoraReputationProfile,
  type SynoraUser,
  verifyAuthSignature,
} from "@/lib/api";
import {
  BASE_SEPOLIA_CHAIN_ID_HEX,
  BASE_SEPOLIA_EXPLORER_URL,
  BASE_SEPOLIA_RPC_URL,
} from "@/lib/chain";
import { getSynBalance } from "@/lib/synToken";
import { getInitialLocale, translations, type SynoraLocale } from "@/lib/i18n";

const SESSION_STORAGE_KEY = "synora.authToken";

function formatEventType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export function WalletAuthCard() {
    const [locale, setLocale] = useState<SynoraLocale>("fr");
  const t = translations[locale];

  useEffect(() => {
    setLocale(getInitialLocale());
  }, []);

  function changeLocale(nextLocale: SynoraLocale) {
    setLocale(nextLocale);
    window.localStorage.setItem("synora.locale", nextLocale);
  }
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [user, setUser] = useState<SynoraUser | null>(null);
  const [reputation, setReputation] = useState<SynoraReputationProfile | null>(null);
  const [events, setEvents] = useState<SynoraReputationEvent[]>([]);
  const [synBalance, setSynBalance] = useState<string>("0");
  const [status, setStatus] = useState<string>("Wallet non connectÃƒÆ'Ã†a€™Ãƒa€š©");
  const [error, setError] = useState<string>("");
  const [rewardAuthorizationStatus, setRewardAuthorizationStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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

        setStatus("Session restaurÃƒÆ'Ã†a€™Ãƒa€š©e");
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);

        if (isMounted) {
          setStatus("Wallet non connectÃƒÆ'Ã†a€™Ãƒa€š©");
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
      return "Non connectÃƒÆ'Ã†a€™Ãƒa€š©";
    }

    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const canClaimReward = Boolean(authToken && user && user.score >= 60);

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

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask est introuvable.");
      }

      setStatus("Connexion au rÃƒÆ'Ã†a€™Ãƒa€š©seau Base Sepolia...");
      await ensureBaseSepoliaNetwork();

      setStatus("Connexion au wallet...");

      const accounts = await window.ethereum.request<string[]>({
        method: "eth_requestAccounts",
      });

      const connectedWallet = accounts[0];

      if (!connectedWallet) {
        throw new Error("Aucun wallet connectÃƒÆ'Ã†a€™Ãƒa€š©.");
      }

      setWalletAddress(connectedWallet);
      setStatus("Lecture de la balance SYN...");

      const balance = await getSynBalance(connectedWallet);
      setSynBalance(Number(balance.formattedBalance).toLocaleString("fr-FR"));

      setStatus("CrÃƒÆ'Ã†a€™Ãƒa€š©ation du message de signature...");

      const nonceResponse = await requestAuthNonce(connectedWallet);

      setStatus("Signature du message dans MetaMask...");

      const signature = await window.ethereum.request<string>({
        method: "personal_sign",
        params: [nonceResponse.message, connectedWallet],
      });

      setStatus("VÃƒÆ'Ã†a€™Ãƒa€š©rification de la signature...");

      const verifyResponse = await verifyAuthSignature({
        walletAddress: connectedWallet,
        signature,
      });

      setAuthToken(verifyResponse.token);
      window.localStorage.setItem(SESSION_STORAGE_KEY, verifyResponse.token);

      setUser(verifyResponse.user);
      setReputation(verifyResponse.reputation);

      setStatus("Mise ÃƒÆ'Ã†a€™Ãƒa€š  jour de la rÃƒÆ'Ã†a€™Ãƒa€š©putation...");

      const reputationResponse = await reportReputationEvent(
        {
          type: "SYN_BALANCE_CONNECTED",
        },
        verifyResponse.token
      );

      applyReputationProfile(reputationResponse.reputation);
      await refreshEvents(connectedWallet);
      setStatus("AuthentifiÃƒÆ'Ã†a€™Ãƒa€š© avec succÃƒÆ'Ã†a€™Ãƒa€š¨s");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Erreur inconnue pendant l'authentification.";

      setError(message);
      setStatus("ÃƒÆ'Ã†a€™aaa€š¬°chec de l'authentification");
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

    try {
      setStatus("Actualisation de la balance SYN...");
      const balance = await getSynBalance(walletAddress);
      setSynBalance(Number(balance.formattedBalance).toLocaleString("fr-FR"));
      await refreshEvents(walletAddress);
      setStatus(authToken ? "AuthentifiÃƒÆ'Ã†a€™Ãƒa€š© avec succÃƒÆ'Ã†a€™Ãƒa€š¨s" : "Balance actualisÃƒÆ'Ã†a€™Ãƒa€š©e");
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
      setError("Connecte et authentifie ton wallet avant de rÃƒÆ'Ã†a€™Ãƒa€š©clamer une rÃƒÆ'Ã†a€™Ãƒa€š©compense.");
      return;
    }

    if (!canClaimReward) {
      setError("Score insuffisant pour rÃƒÆ'Ã†a€™Ãƒa€š©clamer une rÃƒÆ'Ã†a€™Ãƒa€š©compense MVP.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setStatus("Claim rÃƒÆ'Ã†a€™Ãƒa€š©compense MVP...");

      const rewardResponse = await claimSynoraReward(authToken);

      applyReputationProfile(rewardResponse.reputation);
      await refreshEvents(walletAddress);
      setStatus("RÃƒÆ'Ã†a€™Ãƒa€š©compense MVP enregistrÃƒÆ'Ã†a€™Ãƒa€š©e");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Erreur inconnue pendant le claim rÃƒÆ'Ã†a€™Ãƒa€š©compense.";

      setError(message);
      setStatus("ÃƒÆ'Ã†a€™aaa€š¬°chec claim rÃƒÆ'Ã†a€™Ãƒa€š©compense");
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
      setStatus("Ãƒa€°chec autorisation rewards");
    } finally {
      setIsLoading(false);
    }
  }
  function disconnect() {
    setWalletAddress("");
    setAuthToken("");
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    setReputation(null);
    setEvents([]);
    setSynBalance("0");
    setStatus("Wallet non connectÃƒÆ'Ã†a€™Ãƒa€š©");
    setError("");
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
          <div className="mt-4 flex gap-2">
  <button
    type="button"
    onClick={() => changeLocale("fr")}
    className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold"
  >
    FR
  </button>

  <button
    type="button"
    onClick={() => changeLocale("en")}
    className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold"
  >
    EN
  </button>
</div>
            Dashboard utilisateur
          </p>

          <h2 className="mt-3 text-3xl font-bold">Wallet, SYN et rÃƒÆ'Ã†a€™Ãƒa€š©putation</h2>

          <p className="mt-3 text-slate-300">
            SYNORA lit la balance SYN, authentifie le wallet, affiche lÃƒÆ'¢aaa‚¬Å¡¬aaa‚¬Å¾¢historique rÃƒÆ'Ã†a€™Ãƒa€š©cent
            et permet un claim de rÃƒÆ'Ã†a€™Ãƒa€š©compense MVP off-chain.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Wallet</p>
            <p className="mt-2 break-all font-mono text-sm text-cyan-300">{shortWallet}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Balance SYN</p>
            <p className="mt-2 text-2xl font-bold">{synBalance}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Statut</p>
            <p className="mt-2 text-sm font-semibold">{status}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Session</p>
            <p className="mt-2 text-sm font-semibold">
              {authToken ? "JWT reÃƒÆ'Ã†a€™Ãƒa€š§u" : "Non authentifiÃƒÆ'Ã†a€™Ãƒa€š©"}
            </p>
          </div>
        </div>

        {user ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Score</p>
              <p className="mt-2 text-3xl font-bold">{user.score}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Niveau</p>
              <p className="mt-2 text-3xl font-bold">{user.level}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">RÃƒÆ'Ã†a€™Ãƒa€š©compenses</p>
              <p className="mt-2 text-3xl font-bold">{user.rewardsClaimed}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">ÃƒÆ'Ã†a€™aaa€š¬°vÃƒÆ'Ã†a€™Ãƒa€š©nements</p>
              <p className="mt-2 text-3xl font-bold">{reputation?.eventsCount ?? 0}</p>
            </div>
          </div>
        ) : null}

        {reputation ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            DerniÃƒÆ'Ã†a€™Ãƒa€š¨re mise ÃƒÆ'Ã†a€™Ãƒa€š  jour rÃƒÆ'Ã†a€™Ãƒa€š©putation :{" "}
            <span className="font-mono text-cyan-300">{reputation.updatedAt}</span>
          </div>
        ) : null}

        {events.length > 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Historique rÃƒÆ'Ã†a€™Ãƒa€š©cent
            </p>

            <div className="mt-4 flex flex-col gap-3">
              {events.map((event, index) => (
                <div
                  key={`${event.type}-${event.createdAt}-${index}`}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                >
                  <p className="font-semibold">{formatEventType(event.type)}</p>
                  <p className="mt-1 text-sm text-slate-400">{event.createdAt}</p>
                  {typeof event.value === "number" ? (
                    <p className="mt-1 text-sm text-cyan-300">Valeur: {event.value}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {rewardAuthorizationStatus ? (
          <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/40 p-4 text-sm text-cyan-200">
            {rewardAuthorizationStatus}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={connectAndAuthenticate}
            disabled={isLoading}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Connexion..." : "Connecter, lire SYN et signer"}
          </button>

          <button
            type="button"
            onClick={refreshBalance}
            disabled={isLoading || !walletAddress}
            className="rounded-2xl border border-slate-700 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Actualiser balance
          </button>

          <button
            type="button"
            onClick={claimReward}
            disabled={isLoading || !canClaimReward}
            className="rounded-2xl border border-cyan-500 px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Claim rÃƒÆ'Ã†a€™Ãƒa€š©compense MVP
          </button>

          <button
            type="button"
            onClick={testRewardAuthorization}
            disabled={isLoading || !authToken}
            className="rounded-2xl border border-emerald-500 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tester autorisation rewards
          </button>

          <button
            type="button"
            onClick={disconnect}
            className="rounded-2xl border border-slate-700 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
          >
            RÃƒÆ'Ã†a€™Ãƒa€š©initialiser
          </button>
        </div>

        <p className="text-sm text-slate-400">
          Condition MVP claim : session authentifiÃƒÆ'Ã†a€™Ãƒa€š©e et score supÃƒÆ'Ã†a€™Ãƒa€š©rieur ou ÃƒÆ'Ã†a€™Ãƒa€š©gal ÃƒÆ'Ã†a€™Ãƒa€š  60.
          Ce claim est off-chain et sert ÃƒÆ'Ã†a€™Ãƒa€š  valider le parcours rÃƒÆ'Ã†a€™Ãƒa€š©compense avant un contrat rewards.
        </p>
      </div>
    </section>
  );
}