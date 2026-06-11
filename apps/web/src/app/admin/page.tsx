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
  getAdminDashboard,
  type AdminDashboardResponse,
} from "@/lib/api";

type Locale = "fr" | "en";

const WALLET_SESSION_KEY = "synora.authToken";

function shortWallet(walletAddress: string) {
  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

function conversionRate(value: number, base: number) {
  return base > 0 ? Math.round((value / base) * 100) : 0;
}

export default function AdminPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [error, setError] = useState("");

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

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const token = window.localStorage.getItem(WALLET_SESSION_KEY);

      if (!token) {
        if (active) {
          setStatus("error");
          setError("WALLET_SESSION_REQUIRED");
        }
        return;
      }

      try {
        const response = await getAdminDashboard(token);
        if (active) {
          setDashboard(response);
          setStatus("ready");
        }
      } catch (caughtError) {
        if (active) {
          setStatus("error");
          setError(
            caughtError instanceof Error ? caughtError.message : "ADMIN_ERROR"
          );
        }
      }
    }

    const timeout = window.setTimeout(() => void loadDashboard(), 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);

  const isFrench = locale === "fr";
  const funnel = dashboard
    ? [
        [
          isFrench ? "Comptes email" : "Email accounts",
          dashboard.funnel.emailAccounts,
        ],
        [
          isFrench ? "Emails + wallet" : "Email + wallet",
          dashboard.funnel.linkedEmailAccounts,
        ],
        [
          isFrench ? "Wallets authentifies" : "Authenticated wallets",
          dashboard.funnel.authenticatedWallets,
        ],
        [
          isFrench ? "Balance connectee" : "Balance connected",
          dashboard.funnel.balanceConnectedWallets,
        ],
        [
          isFrench ? "Inscriptions beta" : "Beta registrations",
          dashboard.funnel.betaRegistrations,
        ],
        [
          isFrench ? "Claims beta confirmes" : "Confirmed beta claims",
          dashboard.funnel.betaClaimedWallets,
        ],
        [
          isFrench ? "Score 60+" : "Score 60+",
          dashboard.funnel.reputationQualifiedWallets,
        ],
        [
          isFrench ? "Claimers reward" : "Reward claimers",
          dashboard.funnel.rewardClaimers,
        ],
        [
          isFrench ? "Votants gouvernance" : "Governance voters",
          dashboard.funnel.governanceVoters,
        ],
      ]
    : [];
  const funnelBase = Math.max(
    dashboard?.funnel.emailAccounts ?? 0,
    dashboard?.funnel.authenticatedWallets ?? 0,
    dashboard?.funnel.betaRegistrations ?? 0,
    1
  );

  return (
    <SynoraShell
      title={isFrench ? "Pilotage beta" : "Beta operations"}
      subtitle={
        isFrench
          ? "Suis la conversion des testeurs, leurs retours et les points de friction du parcours SYNORA."
          : "Track tester conversion, feedback and friction across the SYNORA journey."
      }
    >
      {status === "loading" ? (
        <div className="premium-panel rounded-[28px] p-8 text-center text-slate-400">
          {isFrench
            ? "Chargement du centre de pilotage..."
            : "Loading operations center..."}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="premium-panel rounded-[28px] p-6">
          <ProtocolNotice tone="red" title={isFrench ? "Acces protege" : "Protected access"}>
            {error === "WALLET_SESSION_REQUIRED"
              ? isFrench
                ? "Authentifie ton wallet depuis le dashboard avant d'ouvrir l'administration."
                : "Authenticate your wallet from the dashboard before opening administration."
              : error === "ADMIN_NOT_CONFIGURED"
                ? isFrench
                  ? "Le wallet administrateur doit encore etre configure dans Render."
                  : "The administrator wallet still needs to be configured in Render."
                : error === "ADMIN_ACCESS_DENIED"
                  ? isFrench
                    ? "Ce wallet n'est pas autorise a consulter les donnees administrateur."
                    : "This wallet is not authorized to view administrator data."
                  : error}
          </ProtocolNotice>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950"
          >
            {isFrench ? "Ouvrir le dashboard" : "Open dashboard"}
          </Link>
        </div>
      ) : null}

      {status === "ready" && dashboard ? (
        <div className="grid gap-6">
          <section className="premium-panel rounded-[28px] p-5 sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <ProtocolSectionTitle
                eyebrow="Control center"
                title={isFrench ? "Vue de la cohorte" : "Cohort overview"}
                description={
                  isFrench
                    ? `Donnees generees le ${new Date(
                        dashboard.generatedAt
                      ).toLocaleString("fr-FR")}.`
                    : `Data generated ${new Date(
                        dashboard.generatedAt
                      ).toLocaleString("en")}.`
                }
              />
              <span className="font-mono text-xs text-slate-500">
                Admin {shortWallet(dashboard.adminWallet)}
              </span>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
              <ProtocolStat
                label={isFrench ? "Wallets" : "Wallets"}
                value={dashboard.overview.totalWallets}
                detail={`${dashboard.overview.totalEvents} events`}
              />
              <ProtocolStat
                label="Beta SYN"
                value={dashboard.overview.totalBetaSynDistributed}
                detail={isFrench ? "distribues" : "distributed"}
                accent="emerald"
              />
              <ProtocolStat
                label={isFrench ? "Feedbacks" : "Feedback"}
                value={dashboard.overview.feedbackCount}
                detail={`${dashboard.overview.averageFeedbackRating.toFixed(1)}/5`}
                accent="violet"
              />
              <ProtocolStat
                label={isFrench ? "DAO actives" : "Active DAO"}
                value={dashboard.overview.activeGovernanceProposals}
                detail={isFrench ? "propositions" : "proposals"}
                accent="amber"
              />
              <ProtocolStat
                label={isFrench ? "Beta inscrits" : "Beta signups"}
                value={dashboard.funnel.betaRegistrations}
                detail="/ 100"
              />
              <ProtocolStat
                label={isFrench ? "Beta confirmes" : "Beta confirmed"}
                value={dashboard.funnel.betaClaimedWallets}
                detail={`${conversionRate(
                  dashboard.funnel.betaClaimedWallets,
                  dashboard.funnel.betaRegistrations
                )}%`}
                accent="emerald"
              />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="premium-panel rounded-[28px] p-5 sm:p-7">
              <ProtocolSectionTitle
                eyebrow="Funnel"
                title={
                  isFrench ? "Conversion des testeurs" : "Tester conversion"
                }
                description={
                  isFrench
                    ? "Chaque barre compare le volume au plus grand point d'entree actuel."
                    : "Each bar compares volume with the current largest entry point."
                }
              />
              <div className="mt-6 space-y-4">
                {funnel.map(([label, rawValue]) => {
                  const value = Number(rawValue);
                  const width = Math.max(2, (value / funnelBase) * 100);

                  return (
                    <div key={String(label)}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-slate-300">
                          {label}
                        </span>
                        <span className="font-mono font-bold text-white">
                          {value}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="premium-panel rounded-[28px] p-5 sm:p-7">
              <ProtocolSectionTitle
                eyebrow="Voice of user"
                title={isFrench ? "Retours recents" : "Recent feedback"}
                description={
                  isFrench
                    ? "Les commentaires sont classes du plus recent au plus ancien."
                    : "Comments are sorted from newest to oldest."
                }
              />
              <div className="mt-6 max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {dashboard.recentFeedback.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                    {isFrench
                      ? "Aucun feedback pour le moment."
                      : "No feedback yet."}
                  </p>
                ) : (
                  dashboard.recentFeedback.map((feedback) => (
                    <article
                      key={`${feedback.walletAddress}-${feedback.updatedAt}`}
                      className="premium-card rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
                          {feedback.rating}/5
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-200">
                          {feedback.category}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {feedback.comment}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-600">
                        <span className="font-mono">
                          {shortWallet(feedback.walletAddress)}
                        </span>
                        <span>
                          {new Date(feedback.updatedAt).toLocaleDateString(locale)}
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="premium-panel rounded-[28px] p-5 sm:p-7">
              <ProtocolSectionTitle
                eyebrow="Email"
                title={isFrench ? "Comptes recents" : "Recent accounts"}
              />
              <div className="mt-5 space-y-2">
                {dashboard.recentEmailAccounts.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    {isFrench ? "Aucun compte email." : "No email account."}
                  </p>
                ) : (
                  dashboard.recentEmailAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {account.email}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(account.createdAt).toLocaleDateString(locale)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          account.walletAddress
                            ? "bg-emerald-300/10 text-emerald-200"
                            : "bg-white/[0.05] text-slate-500"
                        }`}
                      >
                        {account.walletAddress
                          ? shortWallet(account.walletAddress)
                          : isFrench
                            ? "Sans wallet"
                            : "No wallet"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="premium-panel rounded-[28px] p-5 sm:p-7">
              <ProtocolSectionTitle
                eyebrow="Wallet"
                title={isFrench ? "Activite recente" : "Recent activity"}
              />
              <div className="mt-5 space-y-2">
                {dashboard.recentWallets.map((wallet) => (
                  <div
                    key={wallet.walletAddress}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-white">
                        {shortWallet(wallet.walletAddress)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {wallet.eventsCount} events
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Score</p>
                      <p className="font-bold text-cyan-200">{wallet.score}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Rewards</p>
                      <p className="font-bold text-emerald-200">
                        {wallet.rewardsClaimed}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </SynoraShell>
  );
}
