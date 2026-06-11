import type { ReactNode } from "react";

type Accent = "cyan" | "emerald" | "violet" | "amber";

const accentStyles: Record<Accent, string> = {
  cyan: "border-cyan-400/20 bg-cyan-400/8 text-cyan-200",
  emerald: "border-emerald-400/20 bg-emerald-400/8 text-emerald-200",
  violet: "border-violet-400/20 bg-violet-400/8 text-violet-200",
  amber: "border-amber-400/20 bg-amber-400/8 text-amber-200",
};

export function ProtocolStat({
  label,
  value,
  detail,
  accent = "cyan",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accent?: Accent;
}) {
  return (
    <div className="premium-card rounded-2xl p-5">
      <div
        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${accentStyles[accent]}`}
      >
        {label}
      </div>
      <div className="mt-4 text-2xl font-bold tracking-tight text-white">{value}</div>
      {detail ? <div className="mt-2 text-sm text-slate-400">{detail}</div> : null}
    </div>
  );
}

export function ProtocolNotice({
  title,
  children,
  tone = "cyan",
}: {
  title?: string;
  children: ReactNode;
  tone?: Accent | "red";
}) {
  const styles =
    tone === "red"
      ? "border-red-400/20 bg-red-400/8 text-red-100"
      : accentStyles[tone];

  return (
    <div className={`rounded-2xl border p-4 text-sm ${styles}`}>
      {title ? <p className="mb-1 font-bold text-white">{title}</p> : null}
      {children}
    </div>
  );
}

export function ProtocolSectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}
