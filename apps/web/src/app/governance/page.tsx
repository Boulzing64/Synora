"use client";

import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";
import {
  createGovernanceProposal,
  getGovernanceProposals,
  voteGovernanceProposal,
  type GovernanceProposal,
} from "@/lib/api";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Gouvernance",
    subtitle: "Propositions et votes SYNORA V1 en mode testnet.",
    proposalTitle: "Titre",
    proposalDescription: "Description",
    creatorWallet: "Wallet createur",
    create: "Creer proposition",
    refresh: "Actualiser",
    voteFor: "Voter POUR",
    voteAgainst: "Voter CONTRE",
    voterWallet: "Wallet votant",
    weight: "Poids vote",
    for: "Pour",
    against: "Contre",
    empty: "Aucune proposition pour le moment.",
    loading: "Chargement...",
    error: "Erreur gouvernance.",
  },
  en: {
    title: "Governance",
    subtitle: "SYNORA V1 proposals and votes in testnet mode.",
    proposalTitle: "Title",
    proposalDescription: "Description",
    creatorWallet: "Creator wallet",
    create: "Create proposal",
    refresh: "Refresh",
    voteFor: "Vote FOR",
    voteAgainst: "Vote AGAINST",
    voterWallet: "Voter wallet",
    weight: "Vote weight",
    for: "For",
    against: "Against",
    empty: "No proposal yet.",
    loading: "Loading...",
    error: "Governance error.",
  },
} as const;

export default function GovernancePage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorWallet, setCreatorWallet] = useState("");
  const [voterWallet, setVoterWallet] = useState("");
  const [weight, setWeight] = useState("1");
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
  }, []);

  async function submitProposal() {
    try {
      setStatus(text[locale].loading);

      await createGovernanceProposal({
        title,
        description,
        creatorWallet,
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
        walletAddress: voterWallet,
        choice,
        weight: Number(weight),
      });

      await loadProposals();
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

            <input
              value={creatorWallet}
              onChange={(event) => setCreatorWallet(event.target.value)}
              placeholder={t.creatorWallet}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
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
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <input
              value={voterWallet}
              onChange={(event) => setVoterWallet(event.target.value)}
              placeholder={t.voterWallet}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <input
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder={t.weight}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

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
                  <p className="text-xl font-bold">{proposal.title}</p>
                  <p className="mt-2 text-slate-300">{proposal.description}</p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 p-3">
                      {t.for}: {proposal.votesFor}
                    </div>

                    <div className="rounded-xl border border-slate-800 p-3">
                      {t.against}: {proposal.votesAgainst}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row">
                    <button
                      type="button"
                      onClick={() => vote(proposal.id, "FOR")}
                      className="rounded-2xl border border-emerald-500 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-950"
                    >
                      {t.voteFor}
                    </button>

                    <button
                      type="button"
                      onClick={() => vote(proposal.id, "AGAINST")}
                      className="rounded-2xl border border-red-500 px-5 py-3 font-bold text-red-200 transition hover:bg-red-950"
                    >
                      {t.voteAgainst}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SynoraShell>
  );
}