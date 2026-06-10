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
    mainAppText:
      "Connecte ton wallet, lis ta balance SYN et consulte ta reputation.",
    rewardsLabel: "Rewards",
    rewardsTitle: "Claim on-chain",
    rewardsText:
      "Reclame des rewards SYN via le contrat RewardsDistributor.",
    statusLabel: "Infrastructure",
    statusTitle: "Statut",
    statusText:
      "Consulte les URLs publiques, le chain ID et les adresses de contrats.",
  },
  en: {
    title: "Web3 reputation and rewards",
    subtitle:
      "SYNORA connects wallet authentication, reputation scoring and on-chain rewards on Base Sepolia.",
    mainAppLabel: "Main app",
    mainAppTitle: "Dashboard",
    mainAppText:
      "Connect your wallet, read your SYN balance and view your reputation.",
    rewardsLabel: "Rewards",
    rewardsTitle: "On-chain claim",
    rewardsText:
      "Claim SYN rewards through the RewardsDistributor contract.",
    statusLabel: "Infrastructure",
    statusTitle: "Status",
    statusText:
      "View public URLs, chain ID and contract addresses.",
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
    </SynoraShell>
  );
}