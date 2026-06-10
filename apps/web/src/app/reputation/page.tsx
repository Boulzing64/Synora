import Link from "next/link";

import { SynoraShell } from "@/components/SynoraShell";

export default function ReputationPage() {
  return (
    <SynoraShell
      title="Reputation"
      subtitle="La reputation SYNORA est calculee a partir de l activite wallet authentifiee et stockee dans PostgreSQL."
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-2xl font-bold">Moteur de reputation</h2>

        <p className="mt-4 text-slate-300">
          Le score SYNORA evolue selon les evenements utilisateur verifies par l API.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Evenements</p>
            <p className="mt-2 text-slate-300">
              Profil cree, wallet authentifie, balance connectee et reward reclame.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Stockage</p>
            <p className="mt-2 text-slate-300">
              PostgreSQL Render avec migrations versionnees.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Niveaux</p>
            <p className="mt-2 text-slate-300">
              Bronze, Silver, Gold et Platinum selon le score.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Historique</p>
            <p className="mt-2 text-slate-300">
              Les derniers evenements sont visibles dans le dashboard utilisateur.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          Voir ma reputation
        </Link>
      </div>
    </SynoraShell>
  );
}

