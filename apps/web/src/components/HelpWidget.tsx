"use client";

import { useState } from "react";

const helpItems = [
  {
    question: "Comment connecter mon wallet ?",
    answer:
      "Va dans Dashboard, clique sur Connect wallet, accepte Base Sepolia dans MetaMask puis signe le message SYNORA.",
  },
  {
    question: "Pourquoi je ne vois pas mes SYN dans MetaMask ?",
    answer:
      "Verifie que tu es sur Base Sepolia chain ID 84532 et que le token SYNORA est importe avec la bonne adresse.",
  },
  {
    question: "Comment fonctionne le reward on-chain ?",
    answer:
      "SYNORA genere une autorisation EIP-712, puis MetaMask envoie une transaction vers RewardsDistributor.claimWithSignature.",
  },
  {
    question: "Que faire si une erreur 401 apparait ?",
    answer:
      "Le JWT est absent ou expire. Clique sur Reset puis reconnecte ton wallet et signe a nouveau.",
  },
];

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="mb-3 w-[min(360px,calc(100vw-2rem))] rounded-3xl border border-slate-700 bg-slate-950 p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Aide SYNORA
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Assistant utilisateur</h2>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-slate-700 px-3 py-1 text-sm text-slate-300"
            >
              Fermer
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-400">
            Guide rapide inspire d'un assistant ChatGPT. Connexion directe a ChatGPT possible plus tard via API.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {helpItems.map((item) => (
              <div key={item.question} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="font-semibold text-cyan-200">{item.question}</p>
                <p className="mt-2 text-sm text-slate-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="rounded-full bg-cyan-400 px-5 py-4 font-bold text-slate-950 shadow-2xl transition hover:bg-cyan-300"
      >
        Aide
      </button>
    </div>
  );
}
