import { useState } from "react";
import type { ReportCategory, ReportStatus } from "../data/mockReports";
import { CATEGORY_META, STATUS_META } from "../lib/meta";
import { STATUS_FLOW, fallbackAvatar, levelInfo } from "../state/core";
import { panel } from "../lib/styles";

export function StatusBadge({ status, size = "sm" }: { status: ReportStatus; size?: "sm" | "md" }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${meta.tone} ${
        size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: ReportCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${meta.tone}`}
    >
      <span aria-hidden>{meta.icon}</span>
      {category}
    </span>
  );
}

export function Avatar({
  src,
  name,
  seed,
  size = "h-9 w-9",
}: {
  src: string;
  name: string;
  seed?: string;
  size?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? fallbackAvatar(seed ?? name) : src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${size} shrink-0 rounded-full bg-white/10 object-cover ring-2 ring-white/20`}
    />
  );
}

/** Horizontal progress through Open → Acknowledged → In Progress → Closed. */
export function StatusStepper({ status }: { status: ReportStatus }) {
  const current = STATUS_FLOW.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {STATUS_FLOW.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step} className="min-w-0">
            <div
              className={`h-1.5 rounded-full ${done ? STATUS_META[status].bar : "bg-white/15"}`}
            />
            <p
              className={`mt-2 truncate text-xs font-semibold ${
                index === current ? "text-white" : done ? "text-white/70" : "text-white/40"
              }`}
            >
              {step}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center">
      <p className="anim-bob text-4xl" aria-hidden>
        {icon}
      </p>
      <p className="font-game mt-2 text-lg font-bold text-white">{title}</p>
      {children && <div className="mt-1 text-sm text-white/55">{children}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`${panel} p-5 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-white">{children}</h2>
      {action}
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Gold level coin, e.g. on avatars. */
export function LevelBadge({ points, className = "" }: { points: number; className?: string }) {
  const { level } = levelInfo(points);
  return (
    <span
      key={level}
      className={`anim-pop font-game grid h-6 min-w-6 place-items-center rounded-full border-2 border-[#0c0a24] bg-gradient-to-b from-amber-300 to-amber-500 px-1 text-[11px] font-bold text-amber-950 ${className}`}
      title={`Level ${level}`}
    >
      {level}
    </span>
  );
}

/** Shiny XP progress bar towards the next level. */
export function XpBar({ points, compact = false }: { points: number; compact?: boolean }) {
  const { level, into, needed } = levelInfo(points);
  return (
    <div className="min-w-0 flex-1">
      {!compact && (
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
          <span className="text-white/60">Lv {level}</span>
          <span className="text-amber-300">
            {into}/{needed} XP
          </span>
        </div>
      )}
      <div className={`relative overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10 ${compact ? "h-2" : "mt-1 h-3"}`}>
        <div
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 transition-all duration-700"
          style={{ width: `${(into / needed) * 100}%` }}
        >
          <span className="anim-shine pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-white/40 blur-sm" aria-hidden />
        </div>
      </div>
    </div>
  );
}
