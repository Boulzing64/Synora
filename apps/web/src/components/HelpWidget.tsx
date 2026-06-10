"use client";

import { useState } from "react";

const quickActions = [
  "Comment connecter mon wallet ?",
  "Comment reclamer une recompense ?",
  "Pourquoi ma balance SYN ne s'affiche pas ?",
  "Comment fonctionne la reputation ?",
];

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="mb-4 w-[340px] rounded-3xl border border-cyan-400/30 bg-slate-950/95 p-5 text-white shadow-2xl shadow-cyan-950/40 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                SYNORA AI HELP
              </p>
              <h3 className="mt-2 text-xl font-bold">Centre d'aide</h3>
              <p className="mt-2 text-sm text-slate-300">
                Assistant guide pour comprendre le dashboard, les rewards et la reputation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
            >
              X
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {quickActions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => setSelectedQuestion(question)}
                className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm transition hover:border-cyan-400 hover:text-cyan-300"
              >
                {question}
              </button>
            ))}
          </div>

          {selectedQuestion ? (
            <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-4 text-sm text-cyan-100">
              <p className="font-bold">{selectedQuestion}</p>
              <p className="mt-2 text-slate-300">
                Cette aide est locale pour le moment. La prochaine evolution branchera un vrai assistant IA via l'API.
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
          <span className="text-xs uppercase tracking-[0.2em]">AI Help</span>
          <span className="text-sm">Besoin d'aide ?</span>
        </span>
      </button>
    </div>
  );
}