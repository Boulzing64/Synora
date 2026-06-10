"use client";

import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";
import { getBadges, type SynoraBadge } from "@/lib/api";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Badges",
    subtitle: "Les badges valorisent les actions importantes dans SYNORA.",
    walletPlaceholder: "Adresse wallet",
    load: "Charger les badges",
    unlocked: "Debloque",
    locked: "Verrouille",
    loading: "Chargement...",
    empty: "Entre une adresse wallet pour consulter les badges.",
    error: "Impossible de charger les badges.",
  },
  en: {
    title: "Badges",
    subtitle: "Badges highlight meaningful actions inside SYNORA.",
    walletPlaceholder: "Wallet address",
    load: "Load badges",
    unlocked: "Unlocked",
    locked: "Locked",
    loading: "Loading...",
    empty: "Enter a wallet address to view badges.",
    error: "Unable to load badges.",
  },
} as const;

export default function BadgesPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [walletAddress, setWalletAddress] = useState("");
  const [badges, setBadges] = useState<SynoraBadge[]>([]);
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

  async function loadBadges() {
    if (!walletAddress) {
      return;
    }

    try {
      setStatus("loading");
      const response = await getBadges(walletAddress);
      setBadges(response.badges);
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
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />

          <button
            type="button"
            onClick={loadBadges}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            {t.load}
          </button>
        </div>

        {status === "idle" ? (
          <p className="mt-6 text-slate-300">{t.empty}</p>
        ) : null}

        {status === "loading" ? (
          <p className="mt-6 text-slate-300">{t.loading}</p>
        ) : null}

        {status === "error" ? (
          <p className="mt-6 text-red-300">{t.error}</p>
        ) : null}

        {status === "ready" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-2xl border p-5 ${
                  badge.unlocked
                    ? "border-cyan-400 bg-cyan-950/30"
                    : "border-slate-800 bg-slate-950"
                }`}
              >
                <p className="text-lg font-bold">{badge.label}</p>
                <p className="mt-2 text-sm text-slate-300">{badge.description}</p>
                <p className="mt-4 text-sm font-bold">
                  {badge.unlocked ? t.unlocked : t.locked}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </SynoraShell>
  );
}