import Link from "next/link";

type SynoraShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const navigation = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/rewards", label: "Rewards" },
  { href: "/reputation", label: "Reputation" },
  { href: "/status", label: "Status" },
];

export function SynoraShell({ title, subtitle, children }: SynoraShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-6 md:block">
          <div className="sticky top-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              SYNORA
            </p>

            <nav className="mt-8 flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-slate-800 px-4 py-3 font-semibold text-slate-200 transition hover:border-cyan-400 hover:bg-slate-900 hover:text-cyan-300"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <section className="flex-1 px-6 py-8">
          <div className="mb-6 flex flex-wrap gap-2 md:hidden">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-slate-800 px-3 py-2 text-sm font-semibold text-slate-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              SYNORA MVP Beta
            </p>

            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>

            {subtitle ? (
              <p className="mt-6 max-w-3xl text-lg text-slate-300">{subtitle}</p>
            ) : null}
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}