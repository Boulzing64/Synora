import { WalletAuthCard } from "@/components/WalletAuthCard";

export default function Home() {
  const tokenAddress = process.env.NEXT_PUBLIC_SYN_TOKEN_ADDRESS ?? "Non configuré";
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID ?? "Non configuré";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            SYNORA MVP
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Réputation Web3, récompenses SYN et dashboard utilisateur.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Connecte ton wallet MetaMask, signe un message hors-chain et récupère ton profil
            SYNORA depuis l’API.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Réseau</p>
            <p className="mt-2 text-2xl font-semibold">Base Sepolia</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Chain ID</p>
            <p className="mt-2 text-2xl font-semibold">{chainId}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Token</p>
            <p className="mt-2 break-all font-mono text-sm text-cyan-300">{tokenAddress}</p>
          </div>
        </div>

        <WalletAuthCard />
      </section>
    </main>
  );
}