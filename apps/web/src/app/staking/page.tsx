"use client";

import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";
import { getStakingProfile, type StakingResponse } from "@/lib/api";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Staking",
    subtitle: "Le staking SYN prepare la reputation avancee et la future gouvernance SYNORA.",
    walletPlaceholder: "Adresse wallet",
    load: "Charger staking",
    staked: "SYN stakes",
    boost: "Bonus reputation",
    governance: "Poids gouvernance",
    status: "Statut",
    idle: "Entre une adresse wallet pour consulter le staking.",
    loading: "Chargement du staking...",
    error: "Impossible de charger le staking.",
  },
  en: {
    title: "Staking",
    subtitle: "SYN staking prepares advanced reputation and future SYNORA governance.",
    walletPlaceholder: "Wallet address",
    load: "Load staking",
    staked: "Staked SYN",
    boost: "Reputation boost",
    governance: "Governance weight",
    status: "Status",
    idle: "Enter a wallet address to view staking.",
    loading: "Loading staking...",
    error: "Unable to load staking.",
  },
} as const;

export default function StakingPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [walletAddress, setWalletAddress] = useState("");
  const [staking, setStaking] = useState<StakingResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

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

  async function loadStaking() {
    if (!walletAddress.trim()) {
      return;
    }

    try {
      setStatus("loading");
      const response = await getStakingProfile(walletAddress.trim());
      setStaking(response);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  const t = text[locale];

  return (
    <SynoraShell title={t.title} subtitle={t.subtitle}>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={walletAddress}
            onChange={(event) => setWalletAddress(event.target.value)}
            placeholder={t.walletPlaceholder}
            className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />

          <button
            type="button"
            onClick={loadStaking}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            {t.load}
          </button>
        </div>

        {status === "idle" ? <p className="mt-6 text-slate-300">{t.idle}</p> : null}
        {status === "loading" ? <p className="mt-6 text-slate-300">{t.loading}</p> : null}
        {status === "error" ? <p className="mt-6 text-red-300">{t.error}</p> : null}

        {status === "ready" && staking ? (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">{t.staked}</p>
              <p className="mt-2 text-3xl font-bold">{staking.stakedBalance}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">{t.boost}</p>
              <p className="mt-2 text-3xl font-bold">{staking.stakingScoreBoost}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">{t.governance}</p>
              <p className="mt-2 text-3xl font-bold">{staking.governanceWeight}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">{t.status}</p>
              <p className="mt-2 break-words text-sm font-bold text-cyan-300">
                {staking.status}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </SynoraShell>
  );
}