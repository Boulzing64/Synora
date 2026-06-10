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

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone =
      "standalone" in window.navigator && Boolean(window.navigator.standalone);

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

    alert(
      "Installation manuelle :\n\nAndroid Chrome : menu ⋮ puis Ajouter à l'écran d'accueil.\n\niPhone Safari : Partager puis Sur l'écran d'accueil."
    );
  }

  if (isInstalled) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={install}
      className="w-full rounded-2xl border border-cyan-400/30 bg-cyan-950/30 p-4 text-left transition hover:border-cyan-400 hover:bg-cyan-900/40"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">📱</span>

        <div>
          <p className="font-semibold text-cyan-300">Installer SYNORA</p>
          <p className="text-xs text-slate-400">
            Ajouter l'application à l'écran d'accueil
          </p>
        </div>
      </div>
    </button>
  );
}