"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ProtocolNotice,
  ProtocolSectionTitle,
  ProtocolStat,
} from "@/components/ProtocolUi";
import { SynoraShell } from "@/components/SynoraShell";
import {
  getBetaProgram,
  type BetaAcquisitionSource,
  type BetaProgramStatus,
} from "@/lib/api";

type Locale = "fr" | "en";

const BETA_SOURCE_KEY = "synora.betaSource";
const VALID_SOURCES: BetaAcquisitionSource[] = [
  "direct",
  "founder",
  "community",
  "social",
  "partner",
];

function normalizeSource(value: string | null): BetaAcquisitionSource {
  return VALID_SOURCES.includes(value as BetaAcquisitionSource)
    ? (value as BetaAcquisitionSource)
    : "direct";
}

export default function BetaPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [program, setProgram] = useState<BetaProgramStatus | null>(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("synora.locale");
    const source = normalizeSource(
      new URLSearchParams(window.location.search).get("source")
    );
    const savedSource = window.localStorage.getItem(BETA_SOURCE_KEY);

    if (!savedSource || normalizeSource(savedSource) === "direct") {
      window.localStorage.setItem(BETA_SOURCE_KEY, source);
    }

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
    getBetaProgram()
      .then((response) => setProgram(response.program))
      .catch(() => null);

    return () =>
      window.removeEventListener("synora-locale-change", onLocaleChange);
  }, []);

  const isFrench = locale === "fr";
  const registrations = program?.totalBetaRegistrations ?? 0;
  const capacity = program?.maxTesters ?? 100;
  const progress = Math.min(100, (registrations / capacity) * 100);

  async function shareBeta() {
    const url = `${window.location.origin}/beta?source=community`;
    const title = isFrench
      ? "Rejoins la beta SYNORA"
      : "Join the SYNORA beta";
    const text = isFrench
      ? "Teste un protocole Web3 de reputation et fais partie des 100 premiers wallets."
      : "Test a Web3 reputation protocol and become one of the first 100 wallets.";

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setShareStatus(isFrench ? "Invitation partagee." : "Invitation shared.");
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus(
          isFrench ? "Lien copie dans le presse-papiers." : "Link copied."
        );
      }
    } catch {
      setShareStatus("");
    }
  }

  const steps = isFrench
    ? [
        ["Creer ton acces", "Utilise ton email ou passe directement par ton wallet."],
        ["Authentifier ton wallet", "Signe un message gratuit, sans transaction ni cle privee."],
        ["Recevoir 100 SYN", "Reclame tes tokens de test sur Base Sepolia."],
        ["Tester le protocole", "Essaie reputation, staking, rewards et gouvernance."],
        ["Partager ton retour", "Note ton experience depuis le dashboard pour guider le produit."],
      ]
    : [
        ["Create access", "Use your email or go directly through your wallet."],
        ["Authenticate wallet", "Sign a free message, without a transaction or private key."],
        ["Receive 100 SYN", "Claim your test tokens on Base Sepolia."],
        ["Test the protocol", "Try reputation, staking, rewards and governance."],
        ["Share feedback", "Rate your experience from the dashboard to guide the product."],
      ];

  return (
    <SynoraShell
      title={isFrench ? "Founding Beta SYNORA" : "SYNORA Founding Beta"}
      subtitle={
        isFrench
          ? "Un programme limite a 100 testeurs pour construire un protocole de reputation Web3 utile, mesurable et transparent."
          : "A 100-tester program to build a useful, measurable and transparent Web3 reputation protocol."
      }
    >
      <div className="grid gap-6">
        <section className="premium-panel overflow-hidden rounded-[28px] p-5 sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-2 text-xs font-bold text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                {program?.registrationOpen === false
                  ? isFrench
                    ? "Liste d'attente"
                    : "Waitlist"
                  : isFrench
                    ? "Inscriptions ouvertes"
                    : "Applications open"}
              </div>
              <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                {isFrench
                  ? "Aide-nous a tester la reputation on-chain de demain."
                  : "Help us test the on-chain reputation of tomorrow."}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                {isFrench
                  ? "Tu testes un produit reel sur testnet, accomplis des missions simples et nous aides a identifier ce qui doit devenir plus clair, plus rapide et plus utile."
                  : "Test a real product on testnet, complete simple missions and help us identify what should become clearer, faster and more useful."}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/connexion"
                  className="inline-flex justify-center rounded-2xl bg-cyan-300 px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
                >
                  {isFrench ? "Commencer avec mon email" : "Start with email"}
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.07]"
                >
                  {isFrench ? "Commencer avec mon wallet" : "Start with wallet"}
                </Link>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-600">
                {isFrench
                  ? "Aucun achat requis. Les SYN utilises pendant la beta sont des tokens de testnet sans valeur financiere garantie."
                  : "No purchase required. SYN used during beta are testnet tokens with no guaranteed financial value."}
              </p>
            </div>

            <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/[0.04] p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                {isFrench ? "Cohorte en direct" : "Live cohort"}
              </p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-black text-white">
                    {program?.remainingPlaces ?? "..."}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {isFrench ? "places restantes" : "spots remaining"}
                  </p>
                </div>
                <p className="font-mono text-sm text-slate-500">
                  {registrations}/{capacity}
                </p>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <ProtocolStat
                  label={isFrench ? "Confirmes" : "Confirmed"}
                  value={program?.totalBetaTesters ?? "..."}
                  detail={isFrench ? "claims on-chain" : "on-chain claims"}
                  accent="emerald"
                />
                <ProtocolStat
                  label="SYN"
                  value={program?.totalBetaSynDistributed ?? "..."}
                  detail={isFrench ? "distribues" : "distributed"}
                  accent="violet"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="premium-panel rounded-[28px] p-5 sm:p-7">
          <ProtocolSectionTitle
            eyebrow={isFrench ? "Parcours testeur" : "Tester journey"}
            title={
              isFrench
                ? "Cinq etapes, guidees une par une"
                : "Five steps, guided one at a time"
            }
            description={
              isFrench
                ? "Ton dashboard suit automatiquement ta progression et te montre toujours la prochaine action."
                : "Your dashboard automatically tracks progress and always shows the next action."
            }
          />
          <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {steps.map(([title, detail], index) => (
              <article key={title} className="premium-card rounded-2xl p-4">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-300/10 text-xs font-black text-violet-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-bold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="premium-panel rounded-[28px] p-5 sm:p-7">
            <ProtocolSectionTitle
              eyebrow={isFrench ? "Ce que nous attendons" : "What we expect"}
              title={
                isFrench
                  ? "Un testeur utile, pas un expert blockchain"
                  : "A useful tester, not a blockchain expert"
              }
            />
            <div className="mt-6 space-y-3">
              {(isFrench
                ? [
                    "Consacrer environ 20 a 30 minutes au parcours initial.",
                    "Tester depuis un ordinateur ou un mobile compatible wallet.",
                    "Signaler les blocages avec des mots simples.",
                    "Ne jamais partager sa cle privee ou sa phrase de recuperation.",
                  ]
                : [
                    "Spend about 20 to 30 minutes on the initial journey.",
                    "Test from a computer or wallet-compatible mobile device.",
                    "Report blockers using simple words.",
                    "Never share a private key or recovery phrase.",
                  ]
              ).map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <span className="font-black text-emerald-300">OK</span>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-panel rounded-[28px] p-5 sm:p-7">
            <ProtocolSectionTitle
              eyebrow={isFrench ? "Effet reseau" : "Network effect"}
              title={isFrench ? "Invite un autre testeur" : "Invite another tester"}
              description={
                isFrench
                  ? "Le lien partage est mesure comme canal communautaire, sans collecter de donnee personnelle supplementaire."
                  : "The shared link is measured as a community channel without collecting extra personal data."
              }
            />
            <button
              type="button"
              onClick={shareBeta}
              className="mt-6 w-full rounded-2xl bg-violet-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-violet-200"
            >
              {isFrench ? "Partager l'invitation" : "Share invitation"}
            </button>
            {shareStatus ? (
              <p className="mt-3 text-center text-xs text-emerald-200">
                {shareStatus}
              </p>
            ) : null}
            <div className="mt-5">
              <ProtocolNotice tone="amber" title={isFrench ? "Securite" : "Security"}>
                {isFrench
                  ? "SYNORA ne demandera jamais ta phrase de recuperation, ton mot de passe wallet ou ta cle privee."
                  : "SYNORA will never ask for your recovery phrase, wallet password or private key."}
              </ProtocolNotice>
            </div>
          </div>
        </section>
      </div>
    </SynoraShell>
  );
}
