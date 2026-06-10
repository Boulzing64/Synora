"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Reputation",
    subtitle:
      "La reputation SYNORA est calculee a partir de l'activite wallet authentifiee et persistee dans PostgreSQL.",
    cardTitle: "Moteur de reputation",
    eventsLabel: "Evenements",
    eventsText:
      "Profil cree, wallet authentifie, balance connectee et reward reclame.",
    storageLabel: "Stockage",
    storageText:
      "PostgreSQL Render avec migrations versionnees.",
    viewReputation: "Voir ma reputation",
  },
  en: {
    title: "Reputation",
    subtitle:
      "SYNORA reputation is computed from authenticated wallet activity and persisted in PostgreSQL.",
    cardTitle: "Reputation engine",
    eventsLabel: "Events",
    eventsText:
      "Profile created, wallet authenticated, balance connected and reward claimed.",
    storageLabel: "Storage",
    storageText:
      "PostgreSQL Render with versioned migrations.",
    viewReputation: "View my reputation",
  },
} as const;

export default function ReputationPage() {
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">{t.eventsLabel}</p>
            <p className="mt-2 text-slate-300">{t.eventsText}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">{t.storageLabel}</p>
            <p className="mt-2 text-slate-300">{t.storageText}</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          {t.viewReputation}
        </Link>
      </div>
    </SynoraShell>
  );
}