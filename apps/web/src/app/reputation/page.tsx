import Link from "next/link";

import { SynoraShell } from "@/components/SynoraShell";

export default function ReputationPage() {
  return (
    <SynoraShell
      title="Reputation"
      subtitle="SYNORA reputation is computed from authenticated wallet activity and persisted in PostgreSQL."
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-2xl font-bold">Reputation engine</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Events</p>
            <p className="mt-2 text-slate-300">
              Profile created, wallet authenticated, balance connected and reward claimed.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Storage</p>
            <p className="mt-2 text-slate-300">PostgreSQL Render with versioned migrations.</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          View my reputation
        </Link>
      </div>
    </SynoraShell>
  );
}