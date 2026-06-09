import Link from "next/link";

import { SynoraShell } from "@/components/SynoraShell";

export default function RewardsPage() {
  return (
    <SynoraShell
      title="Rewards"
      subtitle="RewardsDistributor is deployed, funded and ready for SYN rewards on Base Sepolia."
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-2xl font-bold">On-chain rewards are active</h2>

        <p className="mt-4 text-slate-300">
          Use the dashboard to connect your wallet and claim rewards through the on-chain flow.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">RewardsDistributor</p>
            <p className="mt-2 break-all font-mono text-sm text-cyan-300">
              0xADbAA2ABF6b40a3705FAA54A41bF3010768A8443
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Funding</p>
            <p className="mt-2 text-2xl font-bold">1000 SYN</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          Open dashboard
        </Link>
      </div>
    </SynoraShell>
  );
}