"use client";

import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";
import {
  confirmBetaClaim,
  getBetaStatus,
  requestBetaAuthorization,
  type BetaDistribution,
} from "@/lib/api";
import { BASE_SEPOLIA_CHAIN_ID_HEX } from "@/lib/chain";
import { claimRewardOnChain } from "@/lib/rewardsDistributor";

const SESSION_STORAGE_KEY = "synora.authToken";

export default function GetSynPage() {
  const [distribution, setDistribution] = useState<BetaDistribution | null>(null);
  const [status, setStatus] = useState("Connecte et authentifie ton wallet depuis le dashboard.");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!token) {
      return;
    }

    getBetaStatus(token)
      .then((response) => {
        setDistribution(response.distribution);
        setStatus(
          response.distribution?.status === "CLAIMED"
            ? "Tes 100 SYN de test ont deja ete reclames."
            : "Ton wallet est eligible au programme beta."
        );
      })
      .catch(() => {
        setStatus("Ta session a expire. Reconnecte ton wallet depuis le dashboard.");
      });
  }, []);

  async function claimBetaTokens() {
    const token = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!token) {
      setError("Authentifie d'abord ton wallet depuis le dashboard.");
      return;
    }

    if (!window.ethereum) {
      setError("MetaMask est introuvable.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setStatus("Preparation de ton autorisation unique...");
      const response = await requestBetaAuthorization(token);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID_HEX }],
      });
      const accounts = await window.ethereum.request<string[]>({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];

      if (
        !walletAddress ||
        walletAddress.toLowerCase() !== response.authorization.walletAddress.toLowerCase()
      ) {
        throw new Error("Le wallet MetaMask ne correspond pas a la session SYNORA.");
      }

      setStatus("Confirme le claim de 100 SYN dans MetaMask...");
      const transactionHash = await claimRewardOnChain({
        walletAddress,
        rewardId: response.authorization.rewardId,
        amount: response.authorization.amount,
        signature: response.authorization.signature,
      });

      setStatus("Verification de la transaction sur Base Sepolia...");
      const confirmation = await confirmBetaClaim(token, transactionHash);
      setDistribution(confirmation.distribution);
      setStatus("Bienvenue parmi les Founding Beta Testers SYNORA.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Le claim beta a echoue.");
      setStatus("Le claim n'a pas ete finalise.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SynoraShell
      title="Obtenir 100 SYN de test"
      subtitle="Programme Founding Beta Tester sur Base Sepolia."
    >
      <section className="rounded-3xl border border-cyan-400/40 bg-slate-900 p-6">
        <p className="text-slate-300">
          Ces SYN servent uniquement a tester le staking, les rewards et la gouvernance. Ils ne
          constituent pas une promesse de valeur financiere.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-400">Statut</p>
          <p className="mt-2 font-semibold">{status}</p>

          {distribution?.transactionHash ? (
            <p className="mt-3 break-all text-sm text-cyan-300">
              Transaction: {distribution.transactionHash}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          disabled={isLoading || distribution?.status === "CLAIMED"}
          onClick={claimBetaTokens}
          className="mt-6 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Traitement..." : "Reclamer mes 100 SYN"}
        </button>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </section>
    </SynoraShell>
  );
}
