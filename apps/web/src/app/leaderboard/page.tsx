"use client";

import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Leaderboard",
    subtitle: "Classement des wallets SYNORA par score, rewards et activite.",
    rank: "Rang",
    wallet: "Wallet",
    score: "Score",
    rewards: "Rewards",
    events: "Evenements",
    updated: "Mis a jour",
    loading: "Chargement du leaderboard...",
    empty: "Aucun utilisateur classe pour le moment.",
    error: "Impossible de charger le leaderboard.",
  },
  en: {
    title: "Leaderboard",
    subtitle: "SYNORA wallet ranking by score, rewards and activity.",
    rank: "Rank",
    wallet: "Wallet",
    score: "Score",
    rewards: "Rewards",
    events: "Events",
    updated: "Updated",
    loading: "Loading leaderboard...",
    empty: "No ranked user yet.",
    error: "Unable to load leaderboard.",
  },
} as const;

function shortWallet(walletAddress: string) {
  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

export default function LeaderboardPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
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
    async function loadLeaderboard() {
      try {
        setStatus("loading");
        const response = await getLeaderboard(20);
        setEntries(response.leaderboard);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    loadLeaderboard();
  }, []);

  const t = text[locale];

  return (
    <SynoraShell title={t.title} subtitle={t.subtitle}>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        {status === "loading" ? (
          <p className="text-slate-300">{t.loading}</p>
        ) : null}

        {status === "error" ? (
          <p className="text-red-300">{t.error}</p>
        ) : null}

        {status === "ready" && entries.length === 0 ? (
          <p className="text-slate-300">{t.empty}</p>
        ) : null}

        {status === "ready" && entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-slate-400">
                  <th className="px-4">{t.rank}</th>
                  <th className="px-4">{t.wallet}</th>
                  <th className="px-4">{t.score}</th>
                  <th className="px-4">{t.rewards}</th>
                  <th className="px-4">{t.events}</th>
                  <th className="px-4">{t.updated}</th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.walletAddress} className="bg-slate-950">
                    <td className="rounded-l-2xl px-4 py-4 font-bold text-cyan-300">
                      #{index + 1}
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-slate-200">
                      {shortWallet(entry.walletAddress)}
                    </td>
                    <td className="px-4 py-4 font-bold">{entry.score}</td>
                    <td className="px-4 py-4">{entry.rewardsClaimed}</td>
                    <td className="px-4 py-4">{entry.eventsCount}</td>
                    <td className="rounded-r-2xl px-4 py-4 text-sm text-slate-400">
                      {entry.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </SynoraShell>
  );
}