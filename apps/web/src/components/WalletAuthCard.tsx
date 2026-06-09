"use client";

import { useMemo, useState } from "react";

import {
  requestAuthNonce,
  type SynoraUser,
  verifyAuthSignature,
} from "@/lib/api";

export function WalletAuthCard() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [user, setUser] = useState<SynoraUser | null>(null);
  const [status, setStatus] = useState<string>("Wallet non connecté");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const shortWallet = useMemo(() => {
    if (!walletAddress) {
      return "Non connecté";
    }

    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  async function connectAndAuthenticate() {
    setIsLoading(true);
    setError("");

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask est introuvable.");
      }

      setStatus("Connexion au wallet...");

      const accounts = await window.ethereum.request<string[]>({
        method: "eth_requestAccounts",
      });

      const connectedWallet = accounts[0];

      if (!connectedWallet) {
        throw new Error("Aucun wallet connecté.");
      }

      setWalletAddress(connectedWallet);
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
      setUser(verifyResponse.user);
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

  function disconnect() {
    setWalletAddress("");
    setAuthToken("");
    setUser(null);
    setStatus("Wallet non connecté");
    setError("");
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Authentification wallet
          </p>

          <h2 className="mt-3 text-3xl font-bold">Connexion MetaMask</h2>

          <p className="mt-3 text-slate-300">
            SYNORA demande une signature hors-chain. Cette action ne coûte pas de gas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Wallet</p>
            <p className="mt-2 break-all font-mono text-sm text-cyan-300">{shortWallet}</p>
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
          <div className="grid gap-4 md:grid-cols-3">
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
            {isLoading ? "Connexion..." : "Connecter et signer"}
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