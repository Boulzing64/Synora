import { SynoraShell } from "@/components/SynoraShell";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "Non configure";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ?? "Non configure";
const RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ?? "Non configure";
const SYN_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SYN_TOKEN_ADDRESS ?? "Non configure";
const REWARDS_DISTRIBUTOR_ADDRESS =
  process.env.NEXT_PUBLIC_REWARDS_DISTRIBUTOR_ADDRESS ?? "Non configure";

export default function StatusPage() {
  return (
    <SynoraShell
      title="Status SYNORA"
      subtitle="Informations publiques sur le frontend, l API, le reseau et les contrats."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Frontend</p>
          <p className="mt-2 text-2xl font-semibold">Vercel</p>
          <p className="mt-2 text-sm text-slate-300">https://synora-web.vercel.app</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">API</p>
          <p className="mt-2 break-all font-mono text-sm text-cyan-300">{API_URL}</p>
          <p className="mt-2 break-all font-mono text-sm text-cyan-300">
            {API_URL}/health
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Reseau</p>
          <p className="mt-2 text-2xl font-semibold">Base Sepolia</p>
          <p className="mt-2 text-sm text-slate-300">Chain ID: {CHAIN_ID}</p>
          <p className="mt-2 break-all font-mono text-sm text-cyan-300">{RPC_URL}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Token SYNORA</p>
          <p className="mt-2 break-all font-mono text-sm text-cyan-300">
            {SYN_TOKEN_ADDRESS}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-2">
          <p className="text-sm text-slate-400">RewardsDistributor</p>
          <p className="mt-2 break-all font-mono text-sm text-cyan-300">
            {REWARDS_DISTRIBUTOR_ADDRESS}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Finance avec 1000 SYN sur Base Sepolia.
          </p>
        </div>
      </div>
    </SynoraShell>
  );
}