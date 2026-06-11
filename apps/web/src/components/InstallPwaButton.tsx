"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPwaButton({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone =
      "standalone" in window.navigator && Boolean(window.navigator.standalone);

    if (standalone || iosStandalone) {
      queueMicrotask(() => setIsInstalled(true));
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function install() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      return;
    }

    setShowInstructions(true);
  }

  if (isInstalled) {
    return compact ? null : (
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4 text-sm text-emerald-200">
        SYNORA est installee sur cet appareil.
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={install}
        className={
          compact
            ? "hidden rounded-xl border border-violet-300/20 bg-violet-300/[0.06] px-4 py-2 text-xs font-bold text-violet-100 transition hover:bg-violet-300/10 sm:block"
            : "w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
        }
      >
        {compact ? "Installer l'app" : "Installer SYNORA"}
      </button>

      {showInstructions ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="premium-panel w-full max-w-md rounded-[28px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Installation
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Ajouter SYNORA
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-white"
                aria-label="Fermer"
              >
                X
              </button>
            </div>

            <div className="mt-6 space-y-3 text-sm leading-6 text-slate-300">
              <p>
                <strong className="text-white">Android Chrome :</strong> ouvre le
                menu du navigateur, puis choisis &quot;Installer
                l&apos;application&quot;.
              </p>
              <p>
                <strong className="text-white">iPhone Safari :</strong> touche
                Partager, puis &quot;Sur l&apos;ecran d&apos;accueil&quot;.
              </p>
              <p>
                <strong className="text-white">Ordinateur :</strong> utilise
                l&apos;icone d&apos;installation situee dans la barre
                d&apos;adresse.
              </p>
            </div>

            <Link
              href="/download"
              onClick={() => setShowInstructions(false)}
              className="mt-6 inline-flex text-sm font-bold text-cyan-200 hover:text-white"
            >
              Ouvrir le guide complet →
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
