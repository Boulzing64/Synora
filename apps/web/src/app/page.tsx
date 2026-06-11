"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";
import { getBetaProgram, type BetaProgramStatus } from "@/lib/api";

type Locale = "fr" | "en";

const text = {
  fr: {
    eyebrow: "Protocole de reputation Web3 intelligent",
    titleStart: "La reputation on-chain,",
    titleAccent: "rendue vivante.",
    subtitle:
      "SYNORA transforme l'activite utile d'un wallet en score dynamique, rewards, pouvoir de gouvernance et recommandations intelligentes.",
    primaryCta: "Rejoindre la beta",
    secondaryCta: "Explorer le dashboard",
    network: "En direct sur Base Sepolia",
    betaPlaces: "places restantes",
    betaClosed: "Cohorte complete",
    trustTitle: "Une infrastructure testnet deja operationnelle",
    trustText:
      "Contrats deployes, authentification par signature, rewards EIP-712 et donnees persistantes.",
    featureEyebrow: "Un protocole, quatre dimensions",
    featureTitle: "La valeur d'un wallet ne se resume pas a son solde.",
    features: [
      {
        number: "01",
        title: "Reputation dynamique",
        text: "Un score evolutif fonde sur les actions utiles, avec niveaux, historique et badges.",
      },
      {
        number: "02",
        title: "Rewards verifies",
        text: "Des recompenses signees par le backend et reclamees directement on-chain.",
      },
      {
        number: "03",
        title: "Staking utile",
        text: "Le staking augmente le poids de gouvernance et prepare les mecanismes futurs.",
      },
      {
        number: "04",
        title: "Gouvernance mesuree",
        text: "Propositions, quorum et votes ponderes par une participation blockchain reelle.",
      },
    ],
    journeyEyebrow: "Parcours beta",
    journeyTitle: "De wallet inconnu a membre actif en trois etapes.",
    steps: [
      ["Connecter", "Authentifie ton wallet par signature, sans partager ta cle privee."],
      ["Construire", "Developpe ton score par tes actions, ton staking et ta participation."],
      ["Influencer", "Reclame tes rewards et utilise ton poids dans la gouvernance SYNORA."],
    ],
    proofScore: "Score comportemental",
    proofLevel: "Niveau actuel",
    proofPower: "Pouvoir DAO",
    proofActivity: "Activite verifiee",
    finalTitle: "Fais partie des 100 premiers wallets SYNORA.",
    finalText:
      "Rejoins une beta controlee, teste le protocole et contribue a definir les futures regles de reputation.",
    finalCta: "Obtenir mes 100 SYN de test",
    disclaimer: "Les SYN de testnet n'ont aucune valeur financiere garantie.",
  },
  en: {
    eyebrow: "Intelligent Web3 reputation protocol",
    titleStart: "On-chain reputation,",
    titleAccent: "made alive.",
    subtitle:
      "SYNORA transforms useful wallet activity into a dynamic score, rewards, governance power and intelligent recommendations.",
    primaryCta: "Join the beta",
    secondaryCta: "Explore dashboard",
    network: "Live on Base Sepolia",
    betaPlaces: "spots remaining",
    betaClosed: "Cohort complete",
    trustTitle: "An operational testnet infrastructure",
    trustText:
      "Deployed contracts, signature authentication, EIP-712 rewards and persistent data.",
    featureEyebrow: "One protocol, four dimensions",
    featureTitle: "A wallet's value is more than its balance.",
    features: [
      {
        number: "01",
        title: "Dynamic reputation",
        text: "An evolving score based on useful actions, with levels, history and badges.",
      },
      {
        number: "02",
        title: "Verified rewards",
        text: "Backend-signed rewards claimed directly on-chain by the user.",
      },
      {
        number: "03",
        title: "Useful staking",
        text: "Staking increases governance power and prepares future mechanisms.",
      },
      {
        number: "04",
        title: "Measured governance",
        text: "Proposals, quorum and votes weighted by real blockchain participation.",
      },
    ],
    journeyEyebrow: "Beta journey",
    journeyTitle: "From unknown wallet to active member in three steps.",
    steps: [
      ["Connect", "Authenticate your wallet by signature without sharing your private key."],
      ["Build", "Grow your score through actions, staking and participation."],
      ["Influence", "Claim rewards and use your weight in SYNORA governance."],
    ],
    proofScore: "Behavior score",
    proofLevel: "Current level",
    proofPower: "DAO power",
    proofActivity: "Verified activity",
    finalTitle: "Become one of the first 100 SYNORA wallets.",
    finalText:
      "Join a controlled beta, test the protocol and help define future reputation rules.",
    finalCta: "Get my 100 test SYN",
    disclaimer: "Testnet SYN have no guaranteed financial value.",
  },
} as const;

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-black ${accent ? "text-cyan-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [program, setProgram] = useState<BetaProgramStatus | null>(null);

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
    getBetaProgram().then((response) => setProgram(response.program)).catch(() => null);

    return () => window.removeEventListener("synora-locale-change", onLocaleChange);
  }, []);

  const t = text[locale];
  const usedPlaces = program ? program.maxTesters - program.remainingPlaces : 0;
  const betaProgress = program ? (usedPlaces / program.maxTesters) * 100 : 0;

  return (
    <SynoraShell title="" variant="landing">
      <section className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#07101f]/70 px-5 py-10 sm:px-8 sm:py-14 xl:px-14 xl:py-20">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-400/[0.08] blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/[0.08] blur-[90px]" />

        <div className="relative grid items-center gap-12 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2 text-xs font-bold text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
              {t.eyebrow}
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl xl:text-[76px]">
              {t.titleStart}
              <span className="text-gradient block">{t.titleAccent}</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
              {t.subtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/obtenir-syn"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3.5 text-sm font-black text-[#03101b] shadow-[0_14px_45px_rgba(67,217,255,0.18)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
              >
                {t.primaryCta}
                <span className="ml-2">→</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.07]"
              >
                {t.secondaryCta}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {t.network}
              </span>
              <span>ERC-20</span>
              <span>EIP-712</span>
              <span>PostgreSQL</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="float-soft premium-panel relative overflow-hidden rounded-[30px] p-5 sm:p-7">
              <div className="absolute right-5 top-5 h-24 w-24 opacity-10">
                <Image src="/logo (3).png" alt="" fill sizes="96px" className="object-cover" />
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    SYNORA Identity
                  </p>
                  <p className="mt-2 font-mono text-xs text-slate-400">0x9046...711A</p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-bold text-emerald-300">
                  VERIFIED
                </span>
              </div>

              <div className="mt-10 flex items-end gap-5">
                <div className="pulse-ring grid h-28 w-28 shrink-0 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/[0.04]">
                  <div className="text-center">
                    <p className="text-4xl font-black text-white">742</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                      Score
                    </p>
                  </div>
                </div>
                <div className="min-w-0 flex-1 pb-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>GOLD</span>
                    <span>742 / 1000</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-[74.2%] rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    +18 points this week from staking and governance.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <Metric label={t.proofLevel} value="GOLD" accent />
                <Metric label={t.proofPower} value="1,240" />
                <Metric label={t.proofActivity} value="28 events" />
                <Metric label="SYN staked" value="1,000" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="premium-panel rounded-[26px] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">
                Founding Beta
              </p>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                {program?.registrationOpen === false ? t.betaClosed : `${program?.remainingPlaces ?? "..."} ${t.betaPlaces}`}
              </h2>
              <p className="mt-2 text-sm text-slate-500">100 SYN testnet par wallet confirme</p>
            </div>
            <Link
              href="/obtenir-syn"
              className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-3 text-center text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/10"
            >
              {t.primaryCta}
            </Link>
          </div>
          <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all duration-700"
              style={{ width: `${betaProgress}%` }}
            />
          </div>
        </div>

        <div className="premium-panel rounded-[26px] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300">
              ✓
            </span>
            <div>
              <h2 className="font-black">{t.trustTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{t.trustText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">
          {t.featureEyebrow}
        </p>
        <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          {t.featureTitle}
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {t.features.map((feature) => (
            <article key={feature.number} className="premium-card group rounded-[26px] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <span className="text-xs font-black text-cyan-400">{feature.number}</span>
                <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <h3 className="mt-8 text-2xl font-black">{feature.title}</h3>
              <p className="mt-3 max-w-xl leading-7 text-slate-500">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="premium-panel rounded-[30px] p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-300">
          {t.journeyEyebrow}
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.035em] sm:text-4xl">
          {t.journeyTitle}
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {t.steps.map(([stepTitle, stepText], index) => (
            <div key={stepTitle} className="relative">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] text-sm font-black text-violet-200">
                {index + 1}
              </span>
              <h3 className="mt-5 text-xl font-black">{stepTitle}</h3>
              <p className="mt-3 leading-7 text-slate-500">{stepText}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative my-20 overflow-hidden rounded-[32px] border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.08] via-[#081120] to-violet-400/[0.08] p-7 text-center sm:p-12">
        <div className="pointer-events-none absolute inset-x-1/4 top-0 h-24 bg-cyan-300/10 blur-[70px]" />
        <h2 className="relative mx-auto max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">
          {t.finalTitle}
        </h2>
        <p className="relative mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
          {t.finalText}
        </p>
        <Link
          href="/obtenir-syn"
          className="relative mt-8 inline-flex rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
        >
          {t.finalCta}
        </Link>
        <p className="relative mt-5 text-xs text-slate-600">{t.disclaimer}</p>
      </section>
    </SynoraShell>
  );
}
