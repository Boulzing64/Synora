"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ProtocolNotice,
  ProtocolSectionTitle,
} from "@/components/ProtocolUi";
import { SynoraShell } from "@/components/SynoraShell";
import {
  getMyBetaFeedback,
  submitBetaFeedback,
  type BetaFeedbackCategory,
} from "@/lib/api";

const SESSION_STORAGE_KEY = "synora.authToken";

const missions = [
  ["ONBOARDING", "Connexion et premiers pas"],
  ["WALLET", "Wallet et transactions"],
  ["REWARDS", "SYN, staking et rewards"],
  ["GENERAL", "Experience generale"],
] as const;

const devices = [
  "Ordinateur - Chrome",
  "Ordinateur - Edge",
  "Android",
  "iPhone / iPad",
  "Autre",
];

export default function FeedbackPage() {
  const [token, setToken] = useState("");
  const [rating, setRating] = useState(0);
  const [category, setCategory] =
    useState<BetaFeedbackCategory>("ONBOARDING");
  const [device, setDevice] = useState(devices[0]);
  const [completed, setCompleted] = useState("Parcours partiel");
  const [blocker, setBlocker] = useState("");
  const [positive, setPositive] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(SESSION_STORAGE_KEY) ?? "";
    queueMicrotask(() => setToken(savedToken));

    if (!savedToken) return;

    getMyBetaFeedback(savedToken)
      .then((response) => {
        if (!response.feedback) return;
        setRating(response.feedback.rating);
        setCategory(response.feedback.category);
        setStatus("Un retour existe deja. Tu peux envoyer une version mise a jour.");
      })
      .catch(() => {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        setToken("");
      });
  }, []);

  const structuredComment = useMemo(
    () =>
      [
        `Appareil: ${device}`,
        `Progression: ${completed}`,
        `Blocage: ${blocker.trim() || "Aucun blocage signale"}`,
        `Point positif: ${positive.trim() || "Non precise"}`,
        `Priorite: ${priority.trim() || "Non precisee"}`,
      ].join("\n"),
    [blocker, completed, device, positive, priority]
  );

  async function sendFeedback() {
    if (!token) {
      setError("Authentifie ton wallet avant d'envoyer ton retour.");
      return;
    }

    if (rating === 0) {
      setError("Choisis une note globale entre 1 et 5.");
      return;
    }

    if (positive.trim().length < 3 || priority.trim().length < 3) {
      setError("Complete le point positif et l'amelioration prioritaire.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Enregistrement de ton retour...");
      await submitBetaFeedback(
        {
          rating,
          category,
          comment: structuredComment,
        },
        token
      );
      setStatus(
        "Merci. Ton retour est enregistre et visible dans le centre de pilotage SYNORA."
      );
    } catch (caughtError) {
      setStatus("");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible d'enregistrer le retour."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SynoraShell
      title="Retour Founding Beta"
      subtitle="Quelques questions precises pour transformer ton test en ameliorations produit concretes."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="premium-panel rounded-[28px] p-5 sm:p-7">
          <ProtocolSectionTitle
            eyebrow="5 minutes"
            title="Comment s'est passe ton test ?"
            description="Ton wallet sert uniquement a relier le retour a ta progression beta."
          />

          {!token ? (
            <div className="mt-6">
              <ProtocolNotice tone="amber" title="Wallet requis">
                Authentifie ton wallet depuis le dashboard, puis reviens sur cette page.
              </ProtocolNotice>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950"
              >
                Authentifier mon wallet
              </Link>
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              <fieldset>
                <legend className="text-sm font-bold text-white">
                  Note globale
                </legend>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`rounded-xl border py-3 text-sm font-black transition ${
                        rating >= value
                          ? "border-amber-300/30 bg-amber-300/15 text-amber-200"
                          : "border-white/[0.08] bg-white/[0.025] text-slate-500"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-300">
                  Mission principalement testee
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as BetaFeedbackCategory)
                    }
                    className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#07101f] px-3 py-3 text-sm text-white"
                  >
                    {missions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold text-slate-300">
                  Appareil utilise
                  <select
                    value={device}
                    onChange={(event) => setDevice(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#07101f] px-3 py-3 text-sm text-white"
                  >
                    {devices.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset>
                <legend className="text-sm font-bold text-slate-300">
                  Progression atteinte
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {["Parcours partiel", "Parcours termine", "Bloque"].map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCompleted(value)}
                        className={`rounded-xl border px-3 py-3 text-sm font-bold ${
                          completed === value
                            ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                            : "border-white/[0.08] text-slate-500"
                        }`}
                      >
                        {value}
                      </button>
                    )
                  )}
                </div>
              </fieldset>

              <FeedbackField
                label="Qu'est-ce qui t'a bloque ou fait hesiter ?"
                value={blocker}
                onChange={setBlocker}
                placeholder="Etape, message d'erreur ou action difficile..."
              />
              <FeedbackField
                label="Quel est le point le plus reussi ?"
                value={positive}
                onChange={setPositive}
                placeholder="Ce qui t'a semble clair, utile ou agreable..."
              />
              <FeedbackField
                label="Quelle amelioration doit passer en premier ?"
                value={priority}
                onChange={setPriority}
                placeholder="Une seule priorite concrete..."
              />

              <button
                type="button"
                onClick={sendFeedback}
                disabled={loading}
                className="w-full rounded-2xl bg-violet-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-violet-200 disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : "Envoyer mon retour"}
              </button>
            </div>
          )}

          {status ? (
            <div className="mt-5">
              <ProtocolNotice tone="emerald">{status}</ProtocolNotice>
            </div>
          ) : null}
          {error ? (
            <div className="mt-5">
              <ProtocolNotice tone="red">{error}</ProtocolNotice>
            </div>
          ) : null}
        </section>

        <aside className="premium-panel rounded-[28px] p-5 sm:p-7">
          <ProtocolSectionTitle
            eyebrow="Pourquoi ces questions ?"
            title="Des decisions, pas seulement une note"
            description="Chaque reponse aide a classer les problemes par appareil, etape du parcours et impact utilisateur."
          />
          <div className="mt-6 space-y-3">
            {[
              ["Blocage", "Identifier les etapes qui empechent de terminer le test."],
              ["Point fort", "Conserver ce qui apporte deja de la valeur."],
              ["Priorite", "Choisir la prochaine amelioration a fort impact."],
            ].map(([title, detail], index) => (
              <div key={title} className="premium-card flex gap-4 rounded-2xl p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-xs font-black text-cyan-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-bold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/beta"
            className="mt-6 inline-flex text-sm font-bold text-cyan-200 hover:text-white"
          >
            Retourner au parcours beta -&gt;
          </Link>
        </aside>
      </div>
    </SynoraShell>
  );
}

function FeedbackField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm font-bold text-slate-300">
      {label}
      <textarea
        value={value}
        maxLength={220}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-24 w-full resize-y rounded-xl border border-white/[0.08] bg-[#07101f] px-3 py-3 text-sm font-normal text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/30"
      />
    </label>
  );
}
