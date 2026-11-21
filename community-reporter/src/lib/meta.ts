import type { ReportCategory, ReportStatus } from "../data/mockReports";

export const CATEGORY_META: Record<
  ReportCategory,
  { icon: string; tone: string; tile: string; hint: string }
> = {
  Road: {
    icon: "🚧",
    tone: "bg-orange-500/15 text-orange-300 ring-orange-400/40",
    tile: "bg-orange-500/20",
    hint: "Potholes, signs, crossings",
  },
  Trash: {
    icon: "🗑️",
    tone: "bg-lime-500/15 text-lime-300 ring-lime-400/40",
    tile: "bg-lime-500/20",
    hint: "Bins, dumping, litter",
  },
  Lighting: {
    icon: "💡",
    tone: "bg-yellow-500/15 text-yellow-300 ring-yellow-400/40",
    tile: "bg-yellow-500/20",
    hint: "Street lights, dark areas",
  },
  Water: {
    icon: "💧",
    tone: "bg-sky-500/15 text-sky-300 ring-sky-400/40",
    tile: "bg-sky-500/20",
    hint: "Leaks, floods, drains",
  },
  Safety: {
    icon: "⚠️",
    tone: "bg-red-500/15 text-red-300 ring-red-400/40",
    tile: "bg-red-500/20",
    hint: "Hazards, broken railings",
  },
  Other: {
    icon: "📌",
    tone: "bg-white/10 text-white/80 ring-white/10",
    tile: "bg-white/10",
    hint: "Anything else",
  },
};

export const CATEGORIES = Object.keys(CATEGORY_META) as ReportCategory[];

export const STATUS_META: Record<
  ReportStatus,
  { tone: string; dot: string; bar: string; hint: string }
> = {
  Open: {
    tone: "bg-rose-500/15 text-rose-300 ring-rose-400/40",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
    hint: "Reported and waiting for someone to pick it up.",
  },
  Acknowledged: {
    tone: "bg-blue-500/15 text-blue-300 ring-blue-400/40",
    dot: "bg-blue-500",
    bar: "bg-blue-500",
    hint: "Seen by the responsible party.",
  },
  "In Progress": {
    tone: "bg-amber-500/15 text-amber-300 ring-amber-400/40",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    hint: "Work on a fix has started.",
  },
  Closed: {
    tone: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/40",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    hint: "Marked fixed — neighbours can confirm it.",
  },
};
