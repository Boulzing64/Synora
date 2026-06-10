"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = "standalone" in window.navigator && Boolean(window.navigator.standalone);

    if (standalone || iosStandalone) {
      setIsInstalled(true);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function install() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    setShowHelp((current) => !current);
  }

  if (isInstalled) {
    return null;
  }

  return (
    <div className="w-full rounded-2xl border border-cyan-400/30 bg-cyan-950/30 p-4 text-left">
      <button
        type="button"
        onClick={install}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>

          <div>
            <p className="font-semibold text-cyan-300">Installer SYNORA</p>
            <p className="text-xs text-slate-400">
              Ajouter l'application a l'ecran d'accueil
            </p>
          </div>
        </div>
      </button>

      {showHelp ? (
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-300">
          <p className="font-bold text-cyan-300">Installation mobile</p>
          <p className="mt-2">
            Android Chrome : menu ⋮ puis Ajouter a l'ecran d'accueil.
          </p>
          <p className="mt-2">
            iPhone Safari : bouton Partager puis Sur l'ecran d'accueil.
          </p>
          <p className="mt-2 text-slate-500">
            Si le bouton natif ne s'ouvre pas, supprime l'ancienne installation puis recharge la page.
          </p>
        </div>
      ) : null}
    </div>
  );
}