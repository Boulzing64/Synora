"use client";

import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";

type Locale = "fr" | "en";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "Not configured";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ?? "Not configured";
const RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ?? "Not configured";
const SYN_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SYN_TOKEN_ADDRESS ?? "Not configured";
const REWARDS_DISTRIBUTOR_ADDRESS =
  process.env.NEXT_PUBLIC_REWARDS_DISTRIBUTOR_ADDRESS ?? "Not configured";

const text = {
  fr: {
    title: "Statut",
    subtitle: "Infrastructure publique, reseau et informations contrats.",
    frontend: "Frontend",
    api: "API",
    network: "Reseau",
    token: "Token SYNORA",
    rewardsDistributor: "RewardsDistributor",
    funded: "Finance avec 1000 SYN sur Base Sepolia.",
  },
  en: {
    title: "Status",
    subtitle: "Public infrastructure, network and contract information.",
    frontend: "Frontend",
    api: "API",
    network: "Network",
    token: "SYNORA Token",
    rewardsDistributor: "RewardsDistributor",
    funded: "Funded with 1000 SYN on Base Sepolia.",
  },
} as const;

export default function StatusPage() {
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
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">{t.frontend}</p>
          <p className="mt-2 text-2xl font-semibold">Vercel</p>
          <p className="mt-2 text-sm text-slate-300">https://synora-web.vercel.app</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">{t.api}</p>
          <p className="mt-2 break-all font-mono text-sm text-cyan-300">{API_URL}</p>
          <p className="mt-2 break-all font-mono text-sm text-cyan-300">
            {API_URL}/health
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">{t.network}</p>
          <p className="mt-2 text-2xl font-semibold">Base Sepolia</p>
          <p className="mt-2 text-sm text-slate-300">Chain ID: {CHAIN_ID}</p>
          <p className="mt-2 break-all font-mono text-sm text-cyan-300">{RPC_URL}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">{t.token}</p>
          <p className="mt-2 break-all font-mono text-sm text-cyan-300">
            {SYN_TOKEN_ADDRESS}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-2">
          <p className="text-sm text-slate-400">{t.rewardsDistributor}</p>
          <p className="mt-2 break-all font-mono text-sm text-cyan-300">
            {REWARDS_DISTRIBUTOR_ADDRESS}
          </p>
          <p className="mt-2 text-sm text-slate-300">{t.funded}</p>
        </div>
      </div>
    </SynoraShell>
  );
}