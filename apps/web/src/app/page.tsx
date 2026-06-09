import Link from "next/link";

import { SynoraShell } from "@/components/SynoraShell";

export default function Home() {
  return (
    <SynoraShell
      title="Web3 reputation and rewards"
      subtitle="SYNORA connects wallet authentication, reputation scoring and on-chain rewards on Base Sepolia."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400"
        >
          <p className="text-sm text-slate-400">Main app</p>
          <h2 className="mt-2 text-2xl font-bold">Dashboard</h2>
          <p className="mt-3 text-slate-300">Connect wallet, read SYN balance and view reputation.</p>
        </Link>

        <Link
          href="/rewards"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400"
        >
          <p className="text-sm text-slate-400">Rewards</p>
          <h2 className="mt-2 text-2xl font-bold">On-chain claim</h2>
          <p className="mt-3 text-slate-300">Claim SYN rewards through RewardsDistributor.</p>
        </Link>

        <Link
          href="/status"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400"
        >
          <p className="text-sm text-slate-400">Infrastructure</p>
          <h2 className="mt-2 text-2xl font-bold">Status</h2>
          <p className="mt-3 text-slate-300">View public URLs, chain ID and contract addresses.</p>
        </Link>
      </div>
    </SynoraShell>
  );
}