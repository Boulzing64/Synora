"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Reputation Web3 et rewards",
    subtitle:
      "SYNORA connecte authentification wallet, score de reputation et rewards on-chain sur Base Sepolia.",
    mainAppLabel: "Application",
    mainAppTitle: "Dashboard",
    mainAppText: "Connecte ton wallet, lis ta balance SYN et consulte ta reputation.",
    rewardsLabel: "Rewards",
    rewardsTitle: "Claim on-chain",
    rewardsText: "Reclame des rewards SYN via le contrat RewardsDistributor.",
    statusLabel: "Infrastructure",
    statusTitle: "Statut",
    statusText: "Consulte les URLs publiques, le chain ID et les adresses de contrats.",
    betaLabel: "Beta testeurs",
    betaTitle: "Rejoins la beta SYNORA",
    betaText:
      "Chaque beta-testeur recevra 100 SYN de test pour essayer le staking, les rewards et la gouvernance DAO.",
    betaButton: "Commencer avec le dashboard",
  },

  en: {
    title: "Web3 reputation and rewards",
    subtitle:
      "SYNORA connects wallet authentication, reputation scoring and on-chain rewards on Base Sepolia.",
    mainAppLabel: "Main app",
    mainAppTitle: "Dashboard",
    mainAppText: "Connect your wallet, read your SYN balance and view your reputation.",
    rewardsLabel: "Rewards",
    rewardsTitle: "On-chain claim",
    rewardsText: "Claim SYN rewards through the RewardsDistributor contract.",
    statusLabel: "Infrastructure",
    statusTitle: "Status",
    statusText: "View public URLs, chain ID and contract addresses.",
    betaLabel: "Beta testers",
    betaTitle: "Join the SYNORA beta",
    betaText:
      "Each beta tester will receive 100 test SYN to try staking, rewards and DAO governance.",
    betaButton: "Start with the dashboard",
  },
} as const;

export default function Home() {
  const [locale, setLocale] = useState<Locale>("fr");

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

  const t = text[locale];

  return (
    <SynoraShell title={t.title} subtitle={t.subtitle}>
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400"
        >
          <p className="text-sm text-slate-400">{t.mainAppLabel}</p>
          <h2 className="mt-2 text-2xl font-bold">{t.mainAppTitle}</h2>
          <p className="mt-3 text-slate-300">{t.mainAppText}</p>
        </Link>

        <Link
          href="/rewards"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400"
        >
          <p className="text-sm text-slate-400">{t.rewardsLabel}</p>
          <h2 className="mt-2 text-2xl font-bold">{t.rewardsTitle}</h2>
          <p className="mt-3 text-slate-300">{t.rewardsText}</p>
        </Link>

        <Link
          href="/status"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400"
        >
          <p className="text-sm text-slate-400">{t.statusLabel}</p>
          <h2 className="mt-2 text-2xl font-bold">{t.statusTitle}</h2>
          <p className="mt-3 text-slate-300">{t.statusText}</p>
        </Link>
      </div>
      <div className="mt-6 rounded-3xl border border-cyan-400/40 bg-slate-900 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          {t.betaLabel}
        </p>

        <h2 className="mt-3 text-3xl font-bold">{t.betaTitle}</h2>

        <p className="mt-4 max-w-3xl text-slate-300">{t.betaText}</p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-3xl font-bold text-cyan-300">100 SYN</p>
            <p className="mt-2 text-sm text-slate-400">Offerts en testnet</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-3xl font-bold text-cyan-300">DAO</p>
            <p className="mt-2 text-sm text-slate-400">Votes et gouvernance</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-3xl font-bold text-cyan-300">Staking</p>
            <p className="mt-2 text-sm text-slate-400">Poids de vote</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          {t.betaButton}
        </Link>
      </div>
    </SynoraShell>
  );
}
