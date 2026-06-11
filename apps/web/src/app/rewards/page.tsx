"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ProtocolNotice,
  ProtocolSectionTitle,
  ProtocolStat,
} from "@/components/ProtocolUi";
import { SynoraShell } from "@/components/SynoraShell";
import { getRewardClaims, type RewardClaim } from "@/lib/api";
import { BASE_SEPOLIA_EXPLORER_URL } from "@/lib/chain";

type Locale = "fr" | "en";

const DISTRIBUTOR_ADDRESS = "0xADbAA2ABF6b40a3705FAA54A41bF3010768A8443";

const text = {
  fr: {
    title: "Rewards",
    subtitle:
      "Des recompenses verifiables pour les contributions utiles a l'ecosysteme.",
    overview: "Distribution on-chain",
    overviewTitle: "Une reserve prete pour les beta-testeurs",
    overviewDescription:
      "Chaque claim est signe, verifie et protege contre la double reclamation.",
    reserve: "Reserve financee",
    network: "Reseau",
    networkValue: "Base Sepolia",
    protection: "Protection",
    protectionValue: "Signature EIP-712",
    capacity: "Programme beta",
    capacityValue: "100 places",
    distributor: "RewardsDistributor",
    viewContract: "Voir le contrat",
    openDashboard: "Reclamer depuis le dashboard",
    joinBeta: "Rejoindre la beta",
    historyEyebrow: "Transparence",
    history: "Verifier un historique",
    historyDescription:
      "Entre une adresse publique pour consulter les recompenses deja enregistrees.",
    wallet: "Adresse wallet 0x...",
    loadHistory: "Charger",
    empty: "Aucun reward enregistre pour ce wallet.",
    loading: "Chargement de l'historique...",
    error: "Impossible de charger les rewards.",
    invalidWallet: "Entre une adresse wallet valide.",
    amount: "Montant",
    status: "Statut",
    date: "Date",
    trustTitle: "Un flux de reward controle",
    trustItems: [
      "Montant calcule par le backend SYNORA",
      "Signature unique liee au wallet",
      "Verification publique sur Base Sepolia",
    ],
  },
  en: {
    title: "Rewards",
    subtitle:
      "Verifiable rewards for contributions that help the ecosystem.",
    overview: "On-chain distribution",
    overviewTitle: "A reserve ready for beta testers",
    overviewDescription:
      "Every claim is signed, verified and protected against double claiming.",
    reserve: "Funded reserve",
    network: "Network",
    networkValue: "Base Sepolia",
    protection: "Protection",
    protectionValue: "EIP-712 signature",
    capacity: "Beta program",
    capacityValue: "100 seats",
    distributor: "RewardsDistributor",
    viewContract: "View contract",
    openDashboard: "Claim from dashboard",
    joinBeta: "Join beta",
    historyEyebrow: "Transparency",
    history: "Check a reward history",
    historyDescription:
      "Enter a public address to review its recorded reward claims.",
    wallet: "Wallet address 0x...",
    loadHistory: "Load",
    empty: "No reward recorded for this wallet.",
    loading: "Loading reward history...",
    error: "Unable to load rewards.",
    invalidWallet: "Enter a valid wallet address.",
    amount: "Amount",
    status: "Status",
    date: "Date",
    trustTitle: "A controlled reward flow",
    trustItems: [
      "Amount computed by the SYNORA backend",
      "Unique signature bound to the wallet",
      "Public verification on Base Sepolia",
    ],
  },
} as const;

export default function RewardsPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [walletAddress, setWalletAddress] = useState("");
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);

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

  async function loadHistory() {
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
      setIsError(true);
      setStatus(text[locale].invalidWallet);
      return;
    }

    try {
      setIsError(false);
      setStatus(text[locale].loading);
      const response = await getRewardClaims(walletAddress.trim());
      setClaims(response.claims);
      setStatus("");
    } catch {
      setIsError(true);
      setStatus(text[locale].error);
    }
  }

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
                {t.openDashboard}
              </Link>
              <Link
                href="/beta"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                {t.joinBeta}
              </Link>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ProtocolStat
              label={t.reserve}
              value="21 000 SYN"
              detail={t.distributor}
              accent="emerald"
            />
            <ProtocolStat
              label={t.network}
              value={t.networkValue}
              detail="Chain ID 84532"
            />
            <ProtocolStat
              label={t.protection}
              value={t.protectionValue}
              detail="Anti double-claim"
              accent="violet"
            />
            <ProtocolStat
              label={t.capacity}
              value={t.capacityValue}
              detail="Acces progressif"
              accent="amber"
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/8 bg-slate-950/45 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                {t.distributor}
              </p>
              <p className="mt-2 truncate font-mono text-sm text-cyan-200">
                {DISTRIBUTOR_ADDRESS}
              </p>
            </div>
            <a
              href={`${BASE_SEPOLIA_EXPLORER_URL}/address/${DISTRIBUTOR_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-xl border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/15"
            >
              {t.viewContract}
            </a>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="premium-panel rounded-[28px] p-5 sm:p-7">
            <ProtocolSectionTitle
              eyebrow={t.historyEyebrow}
              title={t.history}
              description={t.historyDescription}
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={walletAddress}
                onChange={(event) => setWalletAddress(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void loadHistory();
                }}
                placeholder={t.wallet}
                className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-sm text-white outline-none transition focus:border-cyan-300/40"
              />
              <button
                type="button"
                onClick={loadHistory}
                className="rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
              >
                {t.loadHistory}
              </button>
            </div>

            {status ? (
              <div className="mt-4">
                <ProtocolNotice tone={isError ? "red" : "cyan"}>{status}</ProtocolNotice>
              </div>
            ) : null}

            <div className="mt-5 grid gap-3">
              {claims.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center text-sm text-slate-400">
                  {t.empty}
                </div>
              ) : (
                claims.map((claim) => (
                  <article
                    key={claim.id}
                    className="premium-card rounded-2xl p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bold text-white">{claim.rewardType}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {new Date(claim.createdAt).toLocaleString(locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1 text-xs font-bold text-emerald-200">
                          {claim.status}
                        </span>
                        <span className="text-lg font-bold text-white">
                          {claim.amount} SYN
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="premium-panel rounded-[28px] p-5 sm:p-7">
            <ProtocolSectionTitle eyebrow="Trust layer" title={t.trustTitle} />
            <div className="mt-6 space-y-4">
              {t.trustItems.map((item, index) => (
                <div key={item} className="premium-card flex gap-4 rounded-2xl p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-300/10 text-xs font-bold text-emerald-200">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </SynoraShell>
  );
}
