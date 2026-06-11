"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getBetaStatus,
  getMyBetaFeedback,
  submitBetaFeedback,
  type BetaFeedbackCategory,
  type SynoraReputationEvent,
} from "@/lib/api";
import { getStakingOnChainProfile } from "@/lib/synStaking";

type Locale = "fr" | "en";

const GOVERNANCE_VISIT_PREFIX = "synora.onboarding.governance";

type OnboardingJourneyProps = {
  locale: Locale;
  walletAddress: string;
  authToken: string;
  score: number;
  events: SynoraReputationEvent[];
  onConnect: () => void;
  isLoading: boolean;
};

function governanceVisitKey(walletAddress: string) {
  return `${GOVERNANCE_VISIT_PREFIX}.${walletAddress.toLowerCase()}`;
}

export function OnboardingJourney({
  locale,
  walletAddress,
  authToken,
  score,
  events,
  onConnect,
  isLoading,
}: OnboardingJourneyProps) {
  const [betaClaimed, setBetaClaimed] = useState(false);
  const [stakedSyn, setStakedSyn] = useState(0);
  const [governanceVisited, setGovernanceVisited] = useState(false);
  const [rating, setRating] = useState(0);
  const [category, setCategory] =
    useState<BetaFeedbackCategory>("ONBOARDING");
  const [comment, setComment] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      if (!walletAddress || !authToken) {
        return;
      }

      const [betaResponse, stakingResponse, feedbackResponse] =
        await Promise.allSettled([
          getBetaStatus(authToken),
          getStakingOnChainProfile(walletAddress),
          getMyBetaFeedback(authToken),
        ]);

      if (!active) return;

      if (betaResponse.status === "fulfilled") {
        setBetaClaimed(betaResponse.value.distribution?.status === "CLAIMED");
      }

      if (stakingResponse.status === "fulfilled") {
        setStakedSyn(Number(stakingResponse.value.formattedStakedBalance));
      }

      if (
        feedbackResponse.status === "fulfilled" &&
        feedbackResponse.value.feedback
      ) {
        setRating(feedbackResponse.value.feedback.rating);
        setCategory(feedbackResponse.value.feedback.category);
        setComment(feedbackResponse.value.feedback.comment);
        setFeedbackStatus(
          locale === "fr"
            ? "Ton dernier retour est charge."
            : "Your latest feedback is loaded."
        );
      }

      setGovernanceVisited(
        window.localStorage.getItem(governanceVisitKey(walletAddress)) === "true"
      );
    }

    const timeout = window.setTimeout(() => void loadProgress(), 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [authToken, locale, walletAddress]);

  const balanceConnected = events.some(
    (event) => event.type === "SYN_BALANCE_CONNECTED"
  );
  const steps = useMemo(
    () => [
      {
        id: "wallet",
        complete: Boolean(authToken && walletAddress),
        title: locale === "fr" ? "Authentifier le wallet" : "Authenticate wallet",
        detail:
          locale === "fr"
            ? "Connexion securisee par signature, sans cle privee."
            : "Secure signature login, without a private key.",
        action: locale === "fr" ? "Connecter" : "Connect",
        href: "",
      },
      {
        id: "balance",
        complete: balanceConnected,
        title:
          locale === "fr" ? "Verifier la balance SYN" : "Verify SYN balance",
        detail:
          locale === "fr"
            ? "Le dashboard confirme ta premiere interaction utile."
            : "The dashboard confirms your first useful interaction.",
        action: locale === "fr" ? "Dashboard" : "Dashboard",
        href: "/dashboard",
      },
      {
        id: "beta",
        complete: betaClaimed,
        title:
          locale === "fr" ? "Reclamer les 100 SYN beta" : "Claim 100 beta SYN",
        detail:
          locale === "fr"
            ? "Rejoins la cohorte des Founding Beta Testers."
            : "Join the Founding Beta Testers cohort.",
        action: locale === "fr" ? "Obtenir SYN" : "Get SYN",
        href: "/obtenir-syn",
      },
      {
        id: "staking",
        complete: stakedSyn > 0,
        title:
          locale === "fr" ? "Staker ses premiers SYN" : "Stake your first SYN",
        detail:
          locale === "fr"
            ? `${stakedSyn.toLocaleString(locale)} SYN actuellement stakes.`
            : `${stakedSyn.toLocaleString(locale)} SYN currently staked.`,
        action: "Staking",
        href: "/staking",
      },
      {
        id: "reputation",
        complete: score >= 60,
        title:
          locale === "fr"
            ? "Atteindre 60 de reputation"
            : "Reach 60 reputation",
        detail:
          locale === "fr"
            ? `Score actuel : ${score}. Ce seuil debloque les rewards.`
            : `Current score: ${score}. This threshold unlocks rewards.`,
        action: locale === "fr" ? "Reputation" : "Reputation",
        href: "/reputation",
      },
      {
        id: "governance",
        complete: governanceVisited,
        title:
          locale === "fr"
            ? "Decouvrir la gouvernance"
            : "Discover governance",
        detail:
          locale === "fr"
            ? "Comprends le quorum, les propositions et le poids de vote."
            : "Understand quorum, proposals and voting weight.",
        action: locale === "fr" ? "Explorer" : "Explore",
        href: "/governance",
      },
    ],
    [
      authToken,
      balanceConnected,
      betaClaimed,
      governanceVisited,
      locale,
      score,
      stakedSyn,
      walletAddress,
    ]
  );
  const completedSteps = steps.filter((step) => step.complete).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  function markGovernanceVisited() {
    if (!walletAddress) return;
    window.localStorage.setItem(governanceVisitKey(walletAddress), "true");
    setGovernanceVisited(true);
  }

  async function sendFeedback() {
    if (!authToken) {
      setFeedbackStatus(
        locale === "fr"
          ? "Authentifie ton wallet avant d'envoyer ton retour."
          : "Authenticate your wallet before sending feedback."
      );
      return;
    }

    if (rating === 0 || comment.trim().length < 3) {
      setFeedbackStatus(
        locale === "fr"
          ? "Choisis une note et ajoute un commentaire."
          : "Choose a rating and add a comment."
      );
      return;
    }

    try {
      setFeedbackLoading(true);
      setFeedbackStatus(locale === "fr" ? "Envoi..." : "Sending...");
      await submitBetaFeedback(
        {
          rating,
          category,
          comment: comment.trim(),
        },
        authToken
      );
      setFeedbackStatus(
        locale === "fr"
          ? "Merci. Ton retour beta est enregistre."
          : "Thank you. Your beta feedback is saved."
      );
    } catch (error) {
      setFeedbackStatus(
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible d'envoyer le retour."
            : "Unable to send feedback."
      );
    } finally {
      setFeedbackLoading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="premium-panel rounded-[28px] p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
              {locale === "fr" ? "Premiers pas" : "Getting started"}
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
              {locale === "fr"
                ? "Ton parcours SYNORA"
                : "Your SYNORA journey"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {locale === "fr"
                ? "Une seule action a la fois. Les etapes se valident automatiquement."
                : "One action at a time. Steps validate automatically."}
            </p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <p className="text-3xl font-black text-white">{progress}%</p>
            <p className="text-xs text-slate-500">
              {completedSteps}/{steps.length}{" "}
              {locale === "fr" ? "etapes terminees" : "steps completed"}
            </p>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {steps.map((step, index) => (
            <article
              key={step.id}
              className={`rounded-2xl border p-4 transition ${
                step.complete
                  ? "border-emerald-300/20 bg-emerald-300/[0.045]"
                  : "border-white/[0.07] bg-white/[0.02]"
              }`}
            >
              <div className="flex gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black ${
                    step.complete
                      ? "bg-emerald-300 text-slate-950"
                      : "bg-white/[0.06] text-slate-400"
                  }`}
                >
                  {step.complete ? "OK" : String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {step.detail}
                  </p>
                  {!step.complete ? (
                    step.id === "wallet" ? (
                      <button
                        type="button"
                        onClick={onConnect}
                        disabled={isLoading}
                        className="mt-3 text-xs font-bold text-cyan-200 hover:text-white disabled:opacity-50"
                      >
                        {step.action} →
                      </button>
                    ) : (
                      <Link
                        href={step.href}
                        onClick={
                          step.id === "governance"
                            ? markGovernanceVisited
                            : undefined
                        }
                        className="mt-3 inline-flex text-xs font-bold text-cyan-200 hover:text-white"
                      >
                        {step.action} →
                      </Link>
                    )
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="premium-panel rounded-[28px] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
          Beta feedback
        </p>
        <h2 className="mt-3 text-2xl font-black text-white">
          {locale === "fr" ? "Comment ca se passe ?" : "How is it going?"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {locale === "fr"
            ? "Ton retour nous aide a prioriser les prochaines ameliorations."
            : "Your feedback helps us prioritize the next improvements."}
        </p>

        <div className="mt-5 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value}/5`}
              className={`grid h-10 flex-1 place-items-center rounded-xl border text-sm font-black transition ${
                rating >= value
                  ? "border-amber-300/30 bg-amber-300/15 text-amber-200"
                  : "border-white/[0.08] bg-white/[0.025] text-slate-500 hover:text-white"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as BetaFeedbackCategory)
          }
          className="mt-4 w-full rounded-xl border border-white/[0.08] bg-[#07101f] px-3 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300/30"
        >
          <option value="ONBOARDING">
            {locale === "fr" ? "Premiers pas" : "Onboarding"}
          </option>
          <option value="WALLET">Wallet</option>
          <option value="REWARDS">Rewards</option>
          <option value="GENERAL">
            {locale === "fr" ? "Experience generale" : "General experience"}
          </option>
        </select>

        <textarea
          value={comment}
          maxLength={1000}
          onChange={(event) => setComment(event.target.value)}
          placeholder={
            locale === "fr"
              ? "Ce qui est clair, bloquant ou frustrant..."
              : "What feels clear, blocked or frustrating..."
          }
          className="mt-3 min-h-28 w-full resize-y rounded-xl border border-white/[0.08] bg-[#07101f] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/30"
        />

        <button
          type="button"
          onClick={sendFeedback}
          disabled={feedbackLoading || !authToken}
          className="mt-3 w-full rounded-xl bg-violet-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {feedbackLoading
            ? "..."
            : locale === "fr"
              ? "Envoyer mon retour"
              : "Send feedback"}
        </button>

        {feedbackStatus ? (
          <p className="mt-3 text-xs leading-5 text-slate-400">
            {feedbackStatus}
          </p>
        ) : null}
      </section>
    </div>
  );
}
