"use client";

import { useEffect, useState } from "react";

import { askAssistant } from "@/lib/api";

type Locale = "fr" | "en";

const text = {
  fr: {
    badge: "Aide IA",
    title: "Centre d'aide SYNORA",
    subtitle:
      "Pose une question sur le wallet, les rewards, la reputation ou Base Sepolia.",
    buttonSmall: "AI Help",
    buttonMain: "Besoin d'aide ?",
    placeholder: "Ecris ta question...",
    send: "Envoyer",
    loading: "Reponse en cours...",
    fallback:
      "Je peux t'aider a comprendre SYNORA, ton wallet, les rewards et la reputation.",
    close: "X",
    questions: [
      "Comment connecter mon wallet ?",
      "Comment reclamer une recompense on-chain ?",
      "Pourquoi ma balance SYN ne s'affiche pas ?",
      "Comment fonctionne la reputation ?",
    ],
  },
  en: {
    badge: "AI Help",
    title: "SYNORA Help Center",
    subtitle:
      "Ask a question about wallet, rewards, reputation or Base Sepolia.",
    buttonSmall: "AI Help",
    buttonMain: "Need help?",
    placeholder: "Type your question...",
    send: "Send",
    loading: "Answering...",
    fallback:
      "I can help you understand SYNORA, your wallet, rewards and reputation.",
    close: "X",
    questions: [
      "How do I connect my wallet?",
      "How do I claim an on-chain reward?",
      "Why is my SYN balance not displayed?",
      "How does reputation work?",
    ],
  },
} as const;

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [locale, setLocale] = useState<Locale>("fr");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("synora.locale");

    if (savedLocale === "fr" || savedLocale === "en") {
      setLocale(savedLocale);
    }

    function onLocaleChange(event: Event) {
      const customEvent = event as CustomEvent<Locale>;

      if (customEvent.detail === "fr" || customEvent.detail === "en") {
        setLocale(customEvent.detail);
        setSelectedQuestion("");
        setCustomQuestion("");
        setAnswer("");
      }
    }

    window.addEventListener("synora-locale-change", onLocaleChange);

    return () => {
      window.removeEventListener("synora-locale-change", onLocaleChange);
    };
  }, []);

  const t = text[locale];

  async function sendQuestion(question: string) {
    if (!question.trim()) {
      return;
    }

    setSelectedQuestion(question);
    setIsLoading(true);
    setAnswer("");

    try {
      const response = await askAssistant(question);
      setAnswer(response.answer || t.fallback);
    } catch {
      setAnswer(t.fallback);
    } finally {
      setIsLoading(false);
    }
  }

  async function submitCustomQuestion() {
    await sendQuestion(customQuestion);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="mb-4 w-[360px] rounded-3xl border border-cyan-400/30 bg-slate-950/95 p-5 text-white shadow-2xl shadow-cyan-950/40 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                {t.badge}
              </p>
              <h3 className="mt-2 text-xl font-bold">{t.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{t.subtitle}</p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
            >
              {t.close}
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {t.questions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendQuestion(question)}
                className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm transition hover:border-cyan-400 hover:text-cyan-300"
              >
                {question}
              </button>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <input
              value={customQuestion}
              onChange={(event) => setCustomQuestion(event.target.value)}
              placeholder={t.placeholder}
              className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={submitCustomQuestion}
              disabled={isLoading}
              className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {t.send}
            </button>
          </div>

          {(selectedQuestion || isLoading || answer) ? (
            <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-4 text-sm text-cyan-100">
              {selectedQuestion ? <p className="font-bold">{selectedQuestion}</p> : null}
              <p className="mt-2 whitespace-pre-wrap text-slate-300">
                {isLoading ? t.loading : answer}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="group flex items-center gap-3 rounded-full border border-cyan-400/40 bg-cyan-400 px-5 py-4 font-bold text-slate-950 shadow-2xl shadow-cyan-950/40 transition hover:scale-105 hover:bg-cyan-300"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-lg text-cyan-300">
          ?
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-xs uppercase tracking-[0.2em]">{t.buttonSmall}</span>
          <span className="text-sm">{t.buttonMain}</span>
        </span>
      </button>
    </div>
  );
}