"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ProtocolSectionTitle,
  ProtocolStat,
} from "@/components/ProtocolUi";
import { SynoraShell } from "@/components/SynoraShell";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Reputation",
    subtitle:
      "Un score vivant construit par les actions utiles, pas par la taille du wallet.",
    overview: "Identite comportementale",
    overviewTitle: "La confiance devient un actif mesurable",
    overviewDescription:
      "SYNORA combine activite verifiee, staking, rewards et regularite pour construire un profil evolutif.",
    engine: "Moteur",
    engineValue: "Regles verifiables",
    storage: "Stockage",
    storageValue: "PostgreSQL",
    levels: "Niveaux",
    levelsValue: "4 paliers",
    evolution: "Evolution",
    evolutionValue: "Score dynamique",
    formulaEyebrow: "Score SYNORA",
    formulaTitle: "Comment la reputation progresse",
    formulaDescription:
      "Chaque categorie est plafonnee pour eviter qu'une seule action domine tout le profil.",
    dashboard: "Voir mon score",
    leaderboard: "Ouvrir le classement",
    categories: [
      {
        label: "Identite verifiee",
        score: "+20",
        detail: "Profil et wallet authentifies.",
        accent: "cyan",
      },
      {
        label: "Activite utile",
        score: "+30",
        detail: "Interactions reelles avec les modules.",
        accent: "emerald",
      },
      {
        label: "Engagement",
        score: "+30",
        detail: "Staking, gouvernance et regularite.",
        accent: "violet",
      },
      {
        label: "Rewards",
        score: "+20",
        detail: "Recompenses eligibles et reclamees.",
        accent: "amber",
      },
    ],
    ladderEyebrow: "Progression",
    ladderTitle: "Les niveaux de confiance",
    ladderDescription:
      "Les niveaux rendent la reputation lisible sans exposer de donnees privees.",
    levelsList: [
      ["Bronze", "0 - 24", "Premiers signaux verifies"],
      ["Silver", "25 - 49", "Activite reguliere"],
      ["Gold", "50 - 74", "Contribution reconnue"],
      ["Platinum", "75 - 100", "Confiance ecosysteme elevee"],
    ],
    privacyTitle: "Reputation lisible, donnees protegees",
    privacyText:
      "Le score s'appuie sur des evenements publics et des preuves applicatives. Les donnees sensibles ne sont pas publiees on-chain.",
  },
  en: {
    title: "Reputation",
    subtitle:
      "A living score built by useful actions, not by wallet size.",
    overview: "Behavioral identity",
    overviewTitle: "Trust becomes a measurable asset",
    overviewDescription:
      "SYNORA combines verified activity, staking, rewards and consistency into an evolving profile.",
    engine: "Engine",
    engineValue: "Verifiable rules",
    storage: "Storage",
    storageValue: "PostgreSQL",
    levels: "Levels",
    levelsValue: "4 tiers",
    evolution: "Evolution",
    evolutionValue: "Dynamic score",
    formulaEyebrow: "SYNORA score",
    formulaTitle: "How reputation progresses",
    formulaDescription:
      "Each category is capped so that one action cannot dominate the entire profile.",
    dashboard: "View my score",
    leaderboard: "Open leaderboard",
    categories: [
      {
        label: "Verified identity",
        score: "+20",
        detail: "Authenticated profile and wallet.",
        accent: "cyan",
      },
      {
        label: "Useful activity",
        score: "+30",
        detail: "Real interactions across modules.",
        accent: "emerald",
      },
      {
        label: "Engagement",
        score: "+30",
        detail: "Staking, governance and consistency.",
        accent: "violet",
      },
      {
        label: "Rewards",
        score: "+20",
        detail: "Eligible and claimed rewards.",
        accent: "amber",
      },
    ],
    ladderEyebrow: "Progression",
    ladderTitle: "Trust levels",
    ladderDescription:
      "Levels make reputation readable without exposing private data.",
    levelsList: [
      ["Bronze", "0 - 24", "First verified signals"],
      ["Silver", "25 - 49", "Consistent activity"],
      ["Gold", "50 - 74", "Recognized contribution"],
      ["Platinum", "75 - 100", "High ecosystem trust"],
    ],
    privacyTitle: "Readable reputation, protected data",
    privacyText:
      "The score uses public events and application proofs. Sensitive data is not published on-chain.",
  },
} as const;

const accentClasses = {
  cyan: "border-cyan-300/20 bg-cyan-300/8 text-cyan-200",
  emerald: "border-emerald-300/20 bg-emerald-300/8 text-emerald-200",
  violet: "border-violet-300/20 bg-violet-300/8 text-violet-200",
  amber: "border-amber-300/20 bg-amber-300/8 text-amber-200",
};

export default function ReputationPage() {
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("synora.locale");
    if (savedLocale === "fr" || savedLocale === "en") {
      queueMicrotask(() => setLocale(savedLocale));
    }

    function onLocaleChange(event: Event) {
      const customEvent = event as CustomEvent<Locale>;
      if (customEvent.detail === "fr" || customEvent.detail === "en") {
        setLocale(customEvent.detail);
      }
    }

    window.addEventListener("synora-locale-change", onLocaleChange);
    return () => window.removeEventListener("synora-locale-change", onLocaleChange);
  }, []);

  const t = text[locale];

  return (
    <SynoraShell title={t.title} subtitle={t.subtitle}>
      <div className="grid gap-6">
        <section className="premium-panel overflow-hidden rounded-[28px] p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <ProtocolSectionTitle
              eyebrow={t.overview}
              title={t.overviewTitle}
              description={t.overviewDescription}
            />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
              >
                {t.dashboard}
              </Link>
              <Link
                href="/leaderboard"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                {t.leaderboard}
              </Link>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ProtocolStat
              label={t.engine}
              value={t.engineValue}
              detail="Scoring v1"
            />
            <ProtocolStat
              label={t.storage}
              value={t.storageValue}
              detail="Historique persistant"
              accent="violet"
            />
            <ProtocolStat
              label={t.levels}
              value={t.levelsValue}
              detail="Bronze a Platinum"
              accent="amber"
            />
            <ProtocolStat
              label={t.evolution}
              value={t.evolutionValue}
              detail="Actions verifiees"
              accent="emerald"
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="premium-panel rounded-[28px] p-5 sm:p-7">
            <ProtocolSectionTitle
              eyebrow={t.formulaEyebrow}
              title={t.formulaTitle}
              description={t.formulaDescription}
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {t.categories.map((category) => (
                <article
                  key={category.label}
                  className="premium-card rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-white">{category.label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {category.detail}
                      </p>
                    </div>
                    <span
                      className={`rounded-xl border px-3 py-2 font-mono text-sm font-bold ${
                        accentClasses[
                          category.accent as keyof typeof accentClasses
                        ]
                      }`}
                    >
                      {category.score}
                    </span>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
              <div className="flex h-full">
                <span className="w-[20%] bg-cyan-300" />
                <span className="w-[30%] bg-emerald-300" />
                <span className="w-[30%] bg-violet-300" />
                <span className="w-[20%] bg-amber-300" />
              </div>
            </div>
          </div>

          <aside className="premium-panel rounded-[28px] p-5 sm:p-7">
            <ProtocolSectionTitle
              eyebrow={t.ladderEyebrow}
              title={t.ladderTitle}
              description={t.ladderDescription}
            />
            <div className="mt-6 space-y-3">
              {t.levelsList.map(([level, range, detail], index) => (
                <div
                  key={level}
                  className="premium-card flex items-center gap-4 rounded-2xl p-4"
                >
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full ${
                      [
                        "bg-amber-700",
                        "bg-slate-300",
                        "bg-amber-300",
                        "bg-cyan-300",
                      ][index]
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-white">{level}</p>
                      <span className="font-mono text-xs text-slate-400">{range}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="premium-panel rounded-[28px] p-5 sm:p-7">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-5">
            <p className="font-bold text-white">{t.privacyTitle}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              {t.privacyText}
            </p>
          </div>
        </section>
      </div>
    </SynoraShell>
  );
}
