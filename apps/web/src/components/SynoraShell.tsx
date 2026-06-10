"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HelpWidget } from "@/components/HelpWidget";


type SynoraShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

type Locale = "fr" | "en";

const navigation = [
  { href: "/", labelFr: "Accueil", labelEn: "Home" },
  { href: "/dashboard", labelFr: "Dashboard", labelEn: "Dashboard" },
  { href: "/leaderboard", labelFr: "Classement", labelEn: "Leaderboard" },
  { href: "/badges", labelFr: "Badges", labelEn: "Badges" },
  { href: "/rewards", labelFr: "Rewards", labelEn: "Rewards" },
  { href: "/reputation", labelFr: "Reputation", labelEn: "Reputation" },
  { href: "/analytics", labelFr: "Analytics", labelEn: "Analytics" },
  { href: "/staking", labelFr: "Staking", labelEn: "Staking" },
  { href: "/status", labelFr: "Statut", labelEn: "Status" },
  
];

export function SynoraShell({ title, subtitle, children }: SynoraShellProps) {
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("synora.locale");

    if (savedLocale === "en" || savedLocale === "fr") {
      setLocale(savedLocale);
    }
  }, []);

  function changeLanguage(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem("synora.locale", nextLocale);
    window.dispatchEvent(new CustomEvent("synora-locale-change", { detail: nextLocale }));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-6 md:block">
          <div className="sticky top-6">
            <Link
              href="/"
              className="block rounded-2xl border border-cyan-400/40 bg-slate-900 p-4 transition hover:bg-slate-800"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                SYNORA
              </p>
              <p className="mt-2 text-xs text-slate-400">MVP Beta</p>
            </Link>

            

            <nav className="mt-6 flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-slate-800 px-4 py-3 font-semibold text-slate-200 transition hover:border-cyan-400 hover:bg-slate-900 hover:text-cyan-300"
                >
                  {locale === "en" ? item.labelEn : item.labelFr}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-2 md:hidden">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-slate-800 px-3 py-2 text-sm font-semibold text-slate-200"
                >
                  {locale === "en" ? item.labelEn : item.labelFr}
                </Link>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
            
              <button
                type="button"
                onClick={() => changeLanguage("fr")}
                className={`rounded-xl border px-3 py-2 text-sm font-bold ${
                  locale === "fr"
                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                    : "border-slate-700 text-slate-200 hover:bg-slate-800"
                }`}
              >
                FR
              </button>

              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`rounded-xl border px-3 py-2 text-sm font-bold ${
                  locale === "en"
                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                    : "border-slate-700 text-slate-200 hover:bg-slate-800"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl sm:p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              SYNORA MVP Beta
            </p>

            <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
              {title}
            </h1>

            {subtitle ? (
              <p className="mt-6 max-w-3xl text-lg text-slate-300">{subtitle}</p>
            ) : null}
          </div>


          {children}

          </section>
      </div>

      <HelpWidget />
    </main>
  );
}