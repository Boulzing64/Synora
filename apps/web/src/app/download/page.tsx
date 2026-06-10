import Link from "next/link";

import { SynoraShell } from "@/components/SynoraShell";

export default function DownloadPage() {
  return (
    <SynoraShell
      title="Download SYNORA"
      subtitle="Telecharge l'application Android Beta de SYNORA."
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-2xl font-bold">Application Android Beta</h2>

        <p className="mt-4 text-slate-300">
          Cette version APK est destinee aux tests Beta sur Android. Elle n'est pas encore la version Play Store officielle.
        </p>

        <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-950/30 p-4 text-sm text-yellow-100">
          Installe uniquement cette APK si tu fais partie des testeurs SYNORA. Ne partage jamais ta cle privee ni ta seed phrase.
        </div>

        <a
          href="/downloads/synora-beta-debug.apk"
          download
          className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          Telecharger APK Android
        </a>

        <div className="mt-6">
          <Link href="/" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Retour accueil
          </Link>
        </div>
      </div>
    </SynoraShell>
  );
}