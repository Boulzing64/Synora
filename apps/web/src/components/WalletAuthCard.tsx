"use client";

import { useEffect, useMemo, useState } from "react";

import {
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

const SESSION_STORAGE_KEY = "synora.authToken";

function formatEventType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export function WalletAuthCard() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [user, setUser] = useState<SynoraUser | null>(null);
  const [reputation, setReputation] = useState<SynoraReputationProfile | null>(null);
  const [events, setEvents] = useState<SynoraReputationEvent[]>([]);
  const [synBalance, setSynBalance] = useState<string>("0");
  const [status, setStatus] = useState<string>("Wallet non connecté");
  const [error, setError] = useState<string>("");
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

        setStatus("Session restaurée");
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);

        if (isMounted) {
          setStatus("Wallet non connecté");
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
      return "Non connecté";
    }

    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  async function refreshEvents(currentWalletAddress: string) {
    const eventsResponse = await getReputationEvents(currentWalletAddress);
    setEvents(eventsResponse.events);
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

      setStatus("Connexion au réseau Base Sepolia...");
      await ensureBaseSepoliaNetwork();

      setStatus("Connexion au wallet...");

      const accounts = await window.ethereum.request<string[]>({
        method: "eth_requestAccounts",
      });

      const connectedWallet = accounts[0];

      if (!connectedWallet) {
        throw new Error("Aucun wallet connecté.");
      }

      setWalletAddress(connectedWallet);
      setStatus("Lecture de la balance SYN...");

      const balance = await getSynBalance(connectedWallet);
      setSynBalance(Number(balance.formattedBalance).toLocaleString("fr-FR"));

      setStatus("Création du message de signature...");

      const nonceResponse = await requestAuthNonce(connectedWallet);

      setStatus("Signature du message dans MetaMask...");

      const signature = await window.ethereum.request<string>({
        method: "personal_sign",
        params: [nonceResponse.message, connectedWallet],
      });

      setStatus("Vérification de la signature...");

      const verifyResponse = await verifyAuthSignature({
        walletAddress: connectedWallet,
        signature,
      });

      setAuthToken(verifyResponse.token);
      window.localStorage.setItem(SESSION_STORAGE_KEY, verifyResponse.token);

      setUser(verifyResponse.user);
      setReputation(verifyResponse.reputation);

      setStatus("Mise à jour de la réputation...");

      const reputationResponse = await reportReputationEvent(
        {
          type: "SYN_BALANCE_CONNECTED",
        },
        verifyResponse.token
      );

      setUser({
        walletAddress: reputationResponse.reputation.walletAddress,
        score: reputationResponse.reputation.score,
        level: reputationResponse.reputation.level,
        rewardsClaimed: reputationResponse.reputation.rewardsClaimed,
      });

      setReputation(reputationResponse.reputation);
      await refreshEvents(connectedWallet);
      setStatus("Authentifié avec succès");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Erreur inconnue pendant l'authentification.";

      setError(message);
      setStatus("Échec de l'authentification");
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
      setStatus(authToken ? "Authentifié avec succès" : "Balance actualisée");
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

  function disconnect() {
    setWalletAddress("");
    setAuthToken("");
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    setReputation(null);
    setEvents([]);
    setSynBalance("0");
    setStatus("Wallet non connecté");
    setError("");
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Dashboard utilisateur
          </p>

          <h2 className="mt-3 text-3xl font-bold">Wallet, SYN et réputation</h2>

          <p className="mt-3 text-slate-300">
            SYNORA lit la balance SYN, authentifie le wallet et affiche l’historique récent
            des événements de réputation.
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
              {authToken ? "JWT reçu" : "Non authentifié"}
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
              <p className="text-sm text-slate-400">Récompenses</p>
              <p className="mt-2 text-3xl font-bold">{user.rewardsClaimed}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Événements</p>
              <p className="mt-2 text-3xl font-bold">{reputation?.eventsCount ?? 0}</p>
            </div>
          </div>
        ) : null}

        {reputation ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            Dernière mise à jour réputation :{" "}
            <span className="font-mono text-cyan-300">{reputation.updatedAt}</span>
          </div>
        ) : null}

        {events.length > 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Historique récent
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

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
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
            onClick={disconnect}
            className="rounded-2xl border border-slate-700 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </section>
  );
}