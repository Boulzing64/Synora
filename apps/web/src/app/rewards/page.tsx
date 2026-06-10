"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Rewards",
    subtitle:
      "RewardsDistributor est deploye, finance et pret pour les rewards SYN sur Base Sepolia.",
    cardTitle: "Rewards on-chain actifs",
    description:
      "Utilise le dashboard pour connecter ton wallet et reclamer tes rewards via le flux on-chain.",
    distributor: "RewardsDistributor",
    funding: "Financement",
    fundedAmount: "1000 SYN",
    openDashboard: "Ouvrir le dashboard",
  },
  en: {
    title: "Rewards",
    subtitle:
      "RewardsDistributor is deployed, funded and ready for SYN rewards on Base Sepolia.",
    cardTitle: "On-chain rewards are active",
    description:
      "Use the dashboard to connect your wallet and claim rewards through the on-chain flow.",
    distributor: "RewardsDistributor",
    funding: "Funding",
    fundedAmount: "1000 SYN",
    openDashboard: "Open dashboard",
  },
} as const;

export default function RewardsPage() {
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
    </SynoraShell>
  );
}