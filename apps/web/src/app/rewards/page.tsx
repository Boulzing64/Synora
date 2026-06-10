"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";
import { getRewardClaims, type RewardClaim } from "@/lib/api";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Rewards",
    subtitle: "Historique et statut des rewards SYNORA.",
    cardTitle: "Rewards on-chain actifs",
    description:
      "Utilise le dashboard pour connecter ton wallet et reclamer tes rewards via le flux on-chain.",
    distributor: "RewardsDistributor",
    funding: "Financement",
    fundedAmount: "1000 SYN",
    openDashboard: "Ouvrir le dashboard",
    wallet: "Wallet",
    loadHistory: "Charger historique",
    history: "Historique rewards",
    empty: "Aucun reward reclame pour ce wallet.",
    loading: "Chargement...",
    error: "Erreur rewards.",
  },
  en: {
    title: "Rewards",
    subtitle: "SYNORA rewards history and status.",
    cardTitle: "On-chain rewards are active",
    description:
      "Use the dashboard to connect your wallet and claim rewards through the on-chain flow.",
    distributor: "RewardsDistributor",
    funding: "Funding",
    fundedAmount: "1000 SYN",
    openDashboard: "Open dashboard",
    wallet: "Wallet",
    loadHistory: "Load history",
    history: "Rewards history",
    empty: "No reward claimed for this wallet.",
    loading: "Loading...",
    error: "Rewards error.",
  },
} as const;

export default function RewardsPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [walletAddress, setWalletAddress] = useState("");
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("synora.locale");

    if (savedLocale === "fr" || savedLocale === "en") {
      setLocale(savedLocale);
    }

    function onLocaleChange(event: Event) {
      const customEvent = event as CustomEvent<Locale>;

      if (customEvent.detail === "fr" || customEvent.detail === "en") {
        setLocale(customEvent.detail);
      }
    }

    window.addEventListener("synora-locale-change", onLocaleChange);

    return () => {
      window.removeEventListener("synora-locale-change", onLocaleChange);
    };
  }, []);

  async function loadHistory() {
    try {
      setStatus(text[locale].loading);
      const response = await getRewardClaims(walletAddress);
      setClaims(response.claims);
      setStatus("");
    } catch {
      setStatus(text[locale].error);
    }
  }

  const t = text[locale];

  return (
    <SynoraShell title={t.title} subtitle={t.subtitle}>
      <div className="grid gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">{t.cardTitle}</h2>

          <p className="mt-4 text-slate-300">{t.description}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">{t.distributor}</p>
              <p className="mt-2 break-all font-mono text-sm text-cyan-300">
                0xADbAA2ABF6b40a3705FAA54A41bF3010768A8443
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">{t.funding}</p>
              <p className="mt-2 text-2xl font-bold">{t.fundedAmount}</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            {t.openDashboard}
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">{t.history}</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              placeholder={t.wallet}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={loadHistory}
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              {t.loadHistory}
            </button>
          </div>

          {status ? <p className="mt-4 text-sm text-slate-300">{status}</p> : null}

          <div className="mt-5 grid gap-3">
            {claims.length === 0 ? (
              <p className="text-slate-400">{t.empty}</p>
            ) : (
              claims.map((claim) => (
                <div
                  key={claim.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="font-bold">{claim.rewardType}</p>
                  <p className="text-slate-300">{claim.amount} SYN</p>
                  <p className="text-sm text-slate-400">{claim.status}</p>
                  <p className="text-sm text-slate-400">
                    {new Date(claim.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SynoraShell>
  );
}
