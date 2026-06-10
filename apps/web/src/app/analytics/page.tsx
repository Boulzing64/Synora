"use client";

import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";
import { getAnalytics, type AnalyticsSummary } from "@/lib/api";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Analytics",
    subtitle: "Vue globale de l'activite SYNORA.",
    wallets: "Wallets",
    events: "Evenements",
    rewards: "Rewards claims",
    topScore: "Top score",
    synDistributed: "SYN distribues",
    loading: "Chargement des analytics...",
    error: "Impossible de charger les analytics.",
  },
  en: {
    title: "Analytics",
    subtitle: "Global overview of SYNORA activity.",
    wallets: "Wallets",
    events: "Events",
    rewards: "Reward claims",
    topScore: "Top score",
    synDistributed: "SYN distributed",
    loading: "Loading analytics...",
    error: "Unable to load analytics.",
  },
} as const;

export default function AnalyticsPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

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

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setStatus("loading");
        const response = await getAnalytics();
        setAnalytics(response.analytics);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    loadAnalytics();
  }, []);

  const t = text[locale];

  return (
    <SynoraShell title={t.title} subtitle={t.subtitle}>
      {status === "loading" ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
          {t.loading}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-3xl border border-red-500/40 bg-red-950/40 p-6 text-red-200">
          {t.error}
        </div>
      ) : null}

      {status === "ready" && analytics ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">{t.wallets}</p>
            <p className="mt-2 text-4xl font-bold">{analytics.totalWallets}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">{t.events}</p>
            <p className="mt-2 text-4xl font-bold">{analytics.totalEvents}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">{t.rewards}</p>
            <p className="mt-2 text-4xl font-bold">{analytics.totalRewardsClaimed}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">{t.topScore}</p>
            <p className="mt-2 text-4xl font-bold">{analytics.topScore}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-2">
            <p className="text-sm text-slate-400">{t.synDistributed}</p>
            <p className="mt-2 text-4xl font-bold">
              {analytics.totalSynDistributed} SYN
            </p>
          </div>
        </div>
      ) : null}
    </SynoraShell>
  );
}