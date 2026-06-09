const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "Non configuré";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ?? "Non configuré";
const RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ?? "Non configuré";
const SYN_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SYN_TOKEN_ADDRESS ?? "Non configuré";

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            SYNORA STATUS
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            État du MVP SYNORA
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Cette page affiche les endpoints publics et paramètres réseau utilisés par le frontend.
          </p>
        </div>

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
            <p className="text-sm text-slate-400">Réseau</p>
            <p className="mt-2 text-2xl font-semibold">Base Sepolia</p>
            <p className="mt-2 text-sm text-slate-300">Chain ID: {CHAIN_ID}</p>
            <p className="mt-2 break-all font-mono text-sm text-cyan-300">{RPC_URL}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Contrat SYNORA</p>
            <p className="mt-2 break-all font-mono text-sm text-cyan-300">
              {SYN_TOKEN_ADDRESS}
            </p>
            <p className="mt-2 break-all font-mono text-sm text-slate-300">
              https://sepolia.basescan.org/address/{SYN_TOKEN_ADDRESS}
            </p>
          </div>
        </div>

        <a
          href="/"
          className="w-fit rounded-2xl border border-slate-700 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
        >
          Retour au dashboard
        </a>
      </section>
    </main>
  );
}