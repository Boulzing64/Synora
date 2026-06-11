"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { HelpWidget } from "@/components/HelpWidget";
import { InstallPwaButton } from "@/components/InstallPwaButton";
import { NotificationCenter } from "@/components/NotificationCenter";

type SynoraShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "default" | "landing";
};

type Locale = "fr" | "en";

const primaryNavigation = [
  { href: "/", labelFr: "Accueil", labelEn: "Home", icon: "home" },
  { href: "/dashboard", labelFr: "Dashboard", labelEn: "Dashboard", icon: "grid" },
  { href: "/obtenir-syn", labelFr: "Obtenir SYN", labelEn: "Get SYN", icon: "spark" },
] as const;

const ecosystemNavigation = [
  { href: "/reputation", labelFr: "Reputation", labelEn: "Reputation", icon: "score" },
  { href: "/rewards", labelFr: "Rewards", labelEn: "Rewards", icon: "gift" },
  { href: "/staking", labelFr: "Staking", labelEn: "Staking", icon: "layers" },
  { href: "/governance", labelFr: "Gouvernance", labelEn: "Governance", icon: "vote" },
  { href: "/badges", labelFr: "Badges", labelEn: "Badges", icon: "badge" },
  { href: "/leaderboard", labelFr: "Classement", labelEn: "Leaderboard", icon: "chart" },
] as const;

const insightNavigation = [
  { href: "/analytics", labelFr: "Analytics", labelEn: "Analytics", icon: "pulse" },
  { href: "/status", labelFr: "Infrastructure", labelEn: "Infrastructure", icon: "status" },
] as const;

type IconName =
  | (typeof primaryNavigation)[number]["icon"]
  | (typeof ecosystemNavigation)[number]["icon"]
  | (typeof insightNavigation)[number]["icon"];

function NavIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    spark: <><path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>,
    score: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    gift: <><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18M7.5 8C5 8 5 4 7.5 4 10 4 12 8 12 8M16.5 8C19 8 19 4 16.5 4 14 4 12 8 12 8" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    vote: <><path d="M5 4h14v16H5z" /><path d="m8 10 2 2 5-5M8 16h8" /></>,
    badge: <><circle cx="12" cy="9" r="6" /><path d="m8 14-2 7 6-3 6 3-2-7" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    pulse: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>,
    status: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export function SynoraShell({
  title,
  subtitle,
  children,
  variant = "default",
}: SynoraShellProps) {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>("fr");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("synora.locale");

    if (savedLocale === "en" || savedLocale === "fr") {
      queueMicrotask(() => setLocale(savedLocale));
    }
  }, []);

  function changeLanguage(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem("synora.locale", nextLocale);
    window.dispatchEvent(new CustomEvent("synora-locale-change", { detail: nextLocale }));
  }

  function navigationGroup(
    label: string,
    items: readonly {
      href: string;
      labelFr: string;
      labelEn: string;
      icon: IconName;
    }[]
  ) {
    return (
      <div className="mt-7">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-600">
          {label}
        </p>
        <div className="mt-2 flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/20"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className={active ? "text-cyan-300" : "text-slate-500"}>
                  <NavIcon name={item.icon} />
                </span>
                {locale === "en" ? item.labelEn : item.labelFr}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const sidebar = (
    <>
      <Link href="/" className="flex items-center gap-3 px-2">
        <span className="relative h-11 w-11 overflow-hidden rounded-xl border border-cyan-400/20 bg-slate-950">
          <Image
            src="/logo (3).png"
            alt="SYNORA"
            fill
            sizes="44px"
            className="object-cover"
          />
        </span>
        <span>
          <span className="block text-lg font-black tracking-[0.16em] text-white">SYNORA</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
            Intelligence Protocol
          </span>
        </span>
      </Link>

      {navigationGroup(locale === "en" ? "Core" : "Principal", primaryNavigation)}
      {navigationGroup(locale === "en" ? "Ecosystem" : "Ecosysteme", ecosystemNavigation)}
      {navigationGroup(locale === "en" ? "Insights" : "Donnees", insightNavigation)}

      <div className="mt-8 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
          Base Sepolia
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {locale === "en" ? "Testnet infrastructure operational" : "Infrastructure testnet operationnelle"}
        </p>
      </div>
    </>
  );

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="synora-grid pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-[272px] shrink-0 border-r border-white/[0.06] bg-[#050a14]/80 px-5 py-7 backdrop-blur-xl lg:block">
          <div className="sticky top-7">{sidebar}</div>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative h-full w-[min(86vw,320px)] overflow-y-auto border-r border-white/10 bg-[#060b16] p-6 shadow-2xl">
              {sidebar}
            </aside>
          </div>
        ) : null}

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 flex h-20 items-center border-b border-white/[0.06] bg-[#050a14]/70 px-4 backdrop-blur-xl sm:px-7">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="mr-3 grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300 lg:hidden"
              aria-label="Open navigation"
            >
              <span className="text-xl">≡</span>
            </button>

            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <span className="text-sm font-black tracking-[0.18em]">SYNORA</span>
            </Link>

            <div className="ml-auto flex items-center gap-3">
              <Link
                href="/connexion"
                className="hidden rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-bold text-slate-300 transition hover:text-white md:block"
              >
                {locale === "en" ? "Sign in" : "Connexion"}
              </Link>

              <Link
                href="/obtenir-syn"
                className="hidden rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-400/10 sm:block"
              >
                {locale === "en" ? "Join beta" : "Rejoindre la beta"}
              </Link>

              <InstallPwaButton compact />

              <NotificationCenter locale={locale} />

              <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                {(["fr", "en"] as const).map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => changeLanguage(language)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition ${
                      locale === language
                        ? "bg-white/[0.09] text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className={`px-4 pb-20 pt-6 sm:px-7 sm:pt-8 xl:px-10 ${variant === "landing" ? "max-w-none" : ""}`}>
            {variant === "default" ? (
              <div className="premium-panel mb-8 overflow-hidden rounded-[28px] p-6 sm:p-8">
                <div className="glow-line h-px w-40" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">
                  SYNORA Protocol
                </p>
                <h1 className="mt-3 break-words text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            ) : null}

            {children}
          </div>
        </section>
      </div>

      <HelpWidget />
    </main>
  );
}
