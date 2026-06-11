"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ProtocolNotice,
  ProtocolSectionTitle,
  ProtocolStat,
} from "@/components/ProtocolUi";
import { SynoraShell } from "@/components/SynoraShell";
import {
  createGovernanceProposal,
  getGovernanceProposals,
  getGovernanceVotes,
  voteGovernanceProposal,
  type GovernanceProposal,
  type GovernanceVote,
} from "@/lib/api";

type Locale = "fr" | "en";

const SESSION_STORAGE_KEY = "synora.authToken";

const text = {
  fr: {
    title: "Gouvernance",
    subtitle:
      "Transforme la reputation et le staking en decisions collectives mesurables.",
    overview: "Pilotage collectif",
    overviewTitle: "La gouvernance utile, pas seulement symbolique",
    overviewDescription:
      "Les propositions, le quorum et le poids de vote restent lisibles pour toute la communaute.",
    proposals: "Propositions",
    active: "Actives",
    participation: "Poids total",
    passedCount: "Adoptees",
    createEyebrow: "Nouvelle proposition",
    createTitle: "Soumettre une decision",
    createDescription:
      "Une session wallet authentifiee et au moins 10 SYN stakes sont requis.",
    proposalTitle: "Titre clair de la proposition",
    proposalDescription: "Contexte, impact attendu et critere de reussite",
    create: "Publier la proposition",
    refresh: "Actualiser",
    voteFor: "Voter POUR",
    voteAgainst: "Voter CONTRE",
    for: "Pour",
    against: "Contre",
    totalVotes: "Poids vote",
    quorum: "Quorum",
    quorumReached: "Quorum atteint",
    quorumMissing: "Quorum en cours",
    remaining: "Temps restant",
    voteHistory: "Historique des votes",
    showVotes: "Voir les votes",
    emptyVotes: "Aucun vote pour le moment.",
    empty: "Aucune proposition pour le moment.",
    loading: "Mise a jour de la gouvernance...",
    error: "Impossible de terminer cette action.",
    authRequired: "Connecte et authentifie ton wallet depuis le dashboard.",
    fieldsRequired: "Ajoute un titre et une description avant de publier.",
    created: "Proposition publiee avec succes.",
    voted: "Vote enregistre avec succes.",
    passed: "Adoptee",
    rejected: "Rejetee",
    expired: "Expiree",
    activeStatus: "Active",
    rulesTitle: "Regles de participation",
    rules: [
      "10 SYN stakes minimum pour proposer",
      "Un seul vote par wallet et par proposition",
      "Le poids depend de la position de staking",
      "Le resultat exige le quorum defini",
    ],
  },
  en: {
    title: "Governance",
    subtitle:
      "Turn reputation and staking into measurable collective decisions.",
    overview: "Collective steering",
    overviewTitle: "Useful governance, not symbolic governance",
    overviewDescription:
      "Proposals, quorum and voting weight remain readable for the whole community.",
    proposals: "Proposals",
    active: "Active",
    participation: "Total weight",
    passedCount: "Passed",
    createEyebrow: "New proposal",
    createTitle: "Submit a decision",
    createDescription:
      "An authenticated wallet session and at least 10 staked SYN are required.",
    proposalTitle: "Clear proposal title",
    proposalDescription: "Context, expected impact and success criteria",
    create: "Publish proposal",
    refresh: "Refresh",
    voteFor: "Vote FOR",
    voteAgainst: "Vote AGAINST",
    for: "For",
    against: "Against",
    totalVotes: "Voting weight",
    quorum: "Quorum",
    quorumReached: "Quorum reached",
    quorumMissing: "Quorum pending",
    remaining: "Time remaining",
    voteHistory: "Vote history",
    showVotes: "Show votes",
    emptyVotes: "No votes yet.",
    empty: "No proposal yet.",
    loading: "Updating governance...",
    error: "Unable to complete this action.",
    authRequired: "Connect and authenticate your wallet from the dashboard.",
    fieldsRequired: "Add a title and description before publishing.",
    created: "Proposal published successfully.",
    voted: "Vote recorded successfully.",
    passed: "Passed",
    rejected: "Rejected",
    expired: "Expired",
    activeStatus: "Active",
    rulesTitle: "Participation rules",
    rules: [
      "At least 10 staked SYN to propose",
      "One vote per wallet and proposal",
      "Voting weight depends on the staking position",
      "The outcome must reach the defined quorum",
    ],
  },
} as const;

function formatRemaining(seconds: number, locale: Locale) {
  if (seconds <= 0) return "0h";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}${locale === "fr" ? "j" : "d"} ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatWallet(walletAddress: string) {
  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

export default function GovernancePage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [votesByProposal, setVotesByProposal] = useState<
    Record<string, GovernanceVote[]>
  >({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const loadProposals = useCallback(async () => {
    try {
      const response = await getGovernanceProposals();
      setProposals(response.proposals);
      setIsError(false);
      setStatus("");
    } catch {
      setIsError(true);
      setStatus(text[locale].error);
    }
  }, [locale]);

  useEffect(() => {
    queueMicrotask(() => void loadProposals());
    const interval = window.setInterval(() => void loadProposals(), 30000);
    return () => window.clearInterval(interval);
  }, [loadProposals]);

  function getSessionToken() {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  }

  async function submitProposal() {
    const token = getSessionToken();

    if (!token) {
      setIsError(true);
      setStatus(text[locale].authRequired);
      return;
    }

    if (!title.trim() || !description.trim()) {
      setIsError(true);
      setStatus(text[locale].fieldsRequired);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setStatus(text[locale].loading);
      await createGovernanceProposal(
        { title: title.trim(), description: description.trim() },
        token
      );
      setTitle("");
      setDescription("");
      await loadProposals();
      setStatus(text[locale].created);
    } catch (caughtError) {
      setIsError(true);
      setStatus(
        caughtError instanceof Error ? caughtError.message : text[locale].error
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function vote(proposalId: string, choice: "FOR" | "AGAINST") {
    const token = getSessionToken();

    if (!token) {
      setIsError(true);
      setStatus(text[locale].authRequired);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setStatus(text[locale].loading);
      await voteGovernanceProposal({ proposalId, choice }, token);
      await loadProposals();
      setStatus(text[locale].voted);
    } catch (caughtError) {
      setIsError(true);
      setStatus(
        caughtError instanceof Error ? caughtError.message : text[locale].error
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function loadVotes(proposalId: string) {
    try {
      const response = await getGovernanceVotes(proposalId);
      setVotesByProposal((current) => ({
        ...current,
        [proposalId]: response.votes,
      }));
    } catch {
      setIsError(true);
      setStatus(text[locale].error);
    }
  }

  const t = text[locale];
  const stats = useMemo(
    () => ({
      active: proposals.filter((proposal) => proposal.status === "ACTIVE").length,
      passed: proposals.filter((proposal) => proposal.status === "PASSED").length,
      totalWeight: proposals.reduce(
        (total, proposal) => total + proposal.totalVotes,
        0
      ),
    }),
    [proposals]
  );

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
            <button
              type="button"
              onClick={() => void loadProposals()}
              disabled={isLoading}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:opacity-40"
            >
              {t.refresh}
            </button>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ProtocolStat label={t.proposals} value={proposals.length} detail="All time" />
            <ProtocolStat
              label={t.active}
              value={stats.active}
              detail="Vote ouvert"
              accent="emerald"
            />
            <ProtocolStat
              label={t.participation}
              value={stats.totalWeight}
              detail="SYN de poids cumule"
              accent="violet"
            />
            <ProtocolStat
              label={t.passedCount}
              value={stats.passed}
              detail="Quorum et majorite"
              accent="amber"
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="premium-panel rounded-[28px] p-5 sm:p-7">
            <ProtocolSectionTitle
              eyebrow={t.createEyebrow}
              title={t.createTitle}
              description={t.createDescription}
            />
            <div className="mt-6 grid gap-3">
              <input
                value={title}
                maxLength={120}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t.proposalTitle}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
              />
              <textarea
                value={description}
                maxLength={1500}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t.proposalDescription}
                className="min-h-32 resize-y rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
              />
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  {description.length}/1500
                </span>
                <button
                  type="button"
                  onClick={submitProposal}
                  disabled={isLoading}
                  className="rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
                >
                  {t.create}
                </button>
              </div>
            </div>
            {status ? (
              <div className="mt-5">
                <ProtocolNotice tone={isError ? "red" : "cyan"}>{status}</ProtocolNotice>
              </div>
            ) : null}
          </div>

          <aside className="premium-panel rounded-[28px] p-5 sm:p-7">
            <ProtocolSectionTitle eyebrow="Protocol" title={t.rulesTitle} />
            <div className="mt-6 space-y-4">
              {t.rules.map((rule, index) => (
                <div key={rule} className="premium-card flex gap-4 rounded-2xl p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-300/10 text-xs font-bold text-violet-200">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-300">{rule}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="grid gap-4">
          {proposals.length === 0 ? (
            <div className="premium-panel rounded-[28px] px-6 py-12 text-center text-slate-400">
              {t.empty}
            </div>
          ) : (
            proposals.map((proposal) => {
              const directionalTotal = proposal.votesFor + proposal.votesAgainst;
              const forPercent =
                directionalTotal > 0
                  ? (proposal.votesFor / directionalTotal) * 100
                  : 0;
              const againstPercent =
                directionalTotal > 0
                  ? (proposal.votesAgainst / directionalTotal) * 100
                  : 0;
              const quorumPercent = Math.min(
                100,
                proposal.quorum > 0
                  ? (proposal.totalVotes / proposal.quorum) * 100
                  : 0
              );

              return (
                <article
                  key={proposal.id}
                  className="premium-panel rounded-[28px] p-5 sm:p-7"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            proposal.status === "ACTIVE"
                              ? "border-emerald-300/20 bg-emerald-300/8 text-emerald-200"
                              : proposal.status === "PASSED"
                                ? "border-cyan-300/20 bg-cyan-300/8 text-cyan-200"
                                : proposal.status === "REJECTED"
                                  ? "border-red-300/20 bg-red-300/8 text-red-200"
                                  : "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          {proposal.status === "ACTIVE"
                            ? t.activeStatus
                            : proposal.status === "PASSED"
                              ? t.passed
                              : proposal.status === "REJECTED"
                                ? t.rejected
                                : t.expired}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {formatWallet(proposal.creatorWallet)}
                        </span>
                      </div>
                      <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
                        {proposal.title}
                      </h2>
                      <p className="mt-3 leading-7 text-slate-300">
                        {proposal.description}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm">
                      <p className="text-slate-500">{t.remaining}</p>
                      <p className="mt-1 font-bold text-white">
                        {formatRemaining(proposal.remainingSeconds, locale)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-5 lg:grid-cols-2">
                    <div>
                      <div className="mb-2 flex justify-between text-xs text-slate-400">
                        <span>{t.quorum}</span>
                        <span>
                          {proposal.totalVotes}/{proposal.quorum}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-cyan-300"
                          style={{ width: `${quorumPercent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {proposal.quorumReached ? t.quorumReached : t.quorumMissing}
                      </p>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-xs text-slate-400">
                        <span>
                          {t.for} {forPercent.toFixed(1)}%
                        </span>
                        <span>
                          {t.against} {againstPercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="bg-emerald-400"
                          style={{ width: `${forPercent}%` }}
                        />
                        <div
                          className="bg-red-400"
                          style={{ width: `${againstPercent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {t.totalVotes}: {proposal.totalVotes}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => vote(proposal.id, "FOR")}
                      disabled={isLoading || proposal.status !== "ACTIVE"}
                      className="rounded-2xl bg-emerald-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t.voteFor}
                    </button>
                    <button
                      type="button"
                      onClick={() => vote(proposal.id, "AGAINST")}
                      disabled={isLoading || proposal.status !== "ACTIVE"}
                      className="rounded-2xl border border-red-300/25 bg-red-300/8 px-5 py-3 font-bold text-red-100 transition hover:bg-red-300/15 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t.voteAgainst}
                    </button>
                    <button
                      type="button"
                      onClick={() => loadVotes(proposal.id)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
                    >
                      {t.showVotes}
                    </button>
                  </div>

                  {votesByProposal[proposal.id] ? (
                    <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/40 p-4">
                      <p className="font-bold text-white">{t.voteHistory}</p>
                      <div className="mt-3 grid gap-2">
                        {votesByProposal[proposal.id].length === 0 ? (
                          <p className="text-sm text-slate-400">{t.emptyVotes}</p>
                        ) : (
                          votesByProposal[proposal.id].map((item) => (
                            <div
                              key={`${item.walletAddress}-${item.createdAt}`}
                              className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.025] p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                            >
                              <span className="font-mono text-slate-400">
                                {formatWallet(item.walletAddress)}
                              </span>
                              <span className="font-bold text-white">
                                {item.choice} · {item.weight} SYN
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(item.createdAt).toLocaleString(locale)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </section>
      </div>
    </SynoraShell>
  );
}
