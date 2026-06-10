"use client";

import { useEffect, useState } from "react";

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

const text = {
  fr: {
    title: "Gouvernance",
    subtitle: "Propositions, quorum, votes et statut SYNORA.",
    proposalTitle: "Titre",
    proposalDescription: "Description",
    create: "Créer proposition",
    refresh: "Actualiser",
    voteFor: "Voter POUR",
    voteAgainst: "Voter CONTRE",
    for: "Pour",
    against: "Contre",
    totalVotes: "Total votes",
    quorum: "Quorum",
    quorumReached: "Quorum atteint",
    quorumMissing: "Quorum non atteint",
    remaining: "Temps restant",
    closed: "Fermée",
    active: "Active",
    voteHistory: "Historique des votes",
    showVotes: "Voir votes",
    emptyVotes: "Aucun vote pour le moment.",
    empty: "Aucune proposition pour le moment.",
    loading: "Chargement...",
    error: "Erreur gouvernance.",
  },
  en: {
    title: "Governance",
    subtitle: "SYNORA proposals, quorum, votes and status.",
    proposalTitle: "Title",
    proposalDescription: "Description",
    create: "Create proposal",
    refresh: "Refresh",
    voteFor: "Vote FOR",
    voteAgainst: "Vote AGAINST",
    for: "For",
    against: "Against",
    totalVotes: "Total votes",
    quorum: "Quorum",
    quorumReached: "Quorum reached",
    quorumMissing: "Quorum not reached",
    remaining: "Remaining time",
    closed: "Closed",
    active: "Active",
    voteHistory: "Vote history",
    showVotes: "Show votes",
    emptyVotes: "No votes yet.",
    empty: "No proposal yet.",
    loading: "Loading...",
    error: "Governance error.",
  },
} as const;

function formatRemaining(seconds: number) {
  if (seconds <= 0) return "0h";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function GovernancePage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [votesByProposal, setVotesByProposal] = useState<Record<string, GovernanceVote[]>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

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

  async function loadProposals() {
    try {
      setStatus(text[locale].loading);
      const response = await getGovernanceProposals();
      setProposals(response.proposals);
      setStatus("");
    } catch {
      setStatus(text[locale].error);
    }
  }

  useEffect(() => {
    loadProposals();

    const interval = window.setInterval(() => {
      loadProposals();
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  async function submitProposal() {
    try {
      setStatus(text[locale].loading);

      await createGovernanceProposal({
        title,
        description,
        creatorWallet: "",
      });

      setTitle("");
      setDescription("");
      await loadProposals();
    } catch {
      setStatus(text[locale].error);
    }
  }

  async function vote(proposalId: string, choice: "FOR" | "AGAINST") {
    try {
      setStatus(text[locale].loading);

      await voteGovernanceProposal({
        proposalId,
        walletAddress: "",
        choice,
      });

      await loadProposals();
    } catch {
      setStatus(text[locale].error);
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
      setStatus(text[locale].error);
    }
  }

  const t = text[locale];

  return (
    <SynoraShell title={t.title} subtitle={t.subtitle}>
      <div className="grid gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t.proposalTitle}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t.proposalDescription}
              className="min-h-28 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={submitProposal}
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              {t.create}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={loadProposals}
              className="rounded-2xl border border-slate-700 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
            >
              {t.refresh}
            </button>
          </div>

          {status ? <p className="mb-4 text-sm text-slate-300">{status}</p> : null}

          {proposals.length === 0 ? (
            <p className="text-slate-300">{t.empty}</p>
          ) : (
            <div className="grid gap-4">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xl font-bold">{proposal.title}</p>
                      <p className="mt-2 text-slate-300">{proposal.description}</p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        proposal.status === "ACTIVE"
                          ? "bg-emerald-950 text-emerald-200"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {proposal.status === "ACTIVE" ? t.active : t.closed}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 p-3">
                      {t.for}: {proposal.votesFor}
                    </div>

                    <div className="rounded-xl border border-slate-800 p-3">
                      {t.against}: {proposal.votesAgainst}
                    </div>

                    <div className="rounded-xl border border-slate-800 p-3">
                      {t.totalVotes}: {proposal.totalVotes}
                    </div>

                    <div className="rounded-xl border border-slate-800 p-3">
                      {t.quorum}: {proposal.totalVotes}/{proposal.quorum}
                    </div>

                    <div className="rounded-xl border border-slate-800 p-3">
                      {proposal.quorumReached ? t.quorumReached : t.quorumMissing}
                    </div>

                    <div className="rounded-xl border border-slate-800 p-3">
                      {t.remaining}: {formatRemaining(proposal.remainingSeconds)}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row">
                    <button
                      type="button"
                      onClick={() => vote(proposal.id, "FOR")}
                      disabled={proposal.status !== "ACTIVE"}
                      className="rounded-2xl border border-emerald-500 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t.voteFor}
                    </button>

                    <button
                      type="button"
                      onClick={() => vote(proposal.id, "AGAINST")}
                      disabled={proposal.status !== "ACTIVE"}
                      className="rounded-2xl border border-red-500 px-5 py-3 font-bold text-red-200 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t.voteAgainst}
                    </button>

                    <button
                      type="button"
                      onClick={() => loadVotes(proposal.id)}
                      className="rounded-2xl border border-slate-700 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
                    >
                      {t.showVotes}
                    </button>
                  </div>

                  {votesByProposal[proposal.id] ? (
                    <div className="mt-5 rounded-2xl border border-slate-800 p-4">
                      <p className="mb-3 font-bold">{t.voteHistory}</p>

                      {votesByProposal[proposal.id].length === 0 ? (
                        <p className="text-sm text-slate-400">{t.emptyVotes}</p>
                      ) : (
                        <div className="grid gap-2">
                          {votesByProposal[proposal.id].map((vote) => (
                            <div
                              key={`${vote.walletAddress}-${vote.createdAt}`}
                              className="rounded-xl bg-slate-900 p-3 text-sm text-slate-300"
                            >
                              <p>{vote.walletAddress}</p>
                              <p>
                                {vote.choice} - {vote.weight}
                              </p>
                              <p>{new Date(vote.createdAt).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SynoraShell>
  );
}
