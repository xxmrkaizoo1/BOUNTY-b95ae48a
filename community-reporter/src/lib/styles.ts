/** Shared Tailwind class strings — chunky 3D "game" buttons and dark inputs. */
const base =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl border-b-4 px-4 py-2.5 font-game text-sm font-bold transition hover:brightness-110 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0";

export const buttonStyles = {
  primary: `${base} border-amber-700 bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/20`,
  secondary: `${base} border-black/40 bg-white/10 text-white ring-1 ring-inset ring-white/10 hover:bg-white/15`,
  danger: `${base} border-rose-900 bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20`,
  success: `${base} border-emerald-800 bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20`,
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white",
};

export const inputStyles =
  "w-full rounded-xl border-0 bg-black/30 px-3.5 py-2.5 text-sm text-white shadow-inner ring-1 ring-inset ring-white/15 placeholder:text-white/35 focus:ring-2 focus:ring-inset focus:ring-amber-400 focus:outline-none";

/** Glass panel used for cards. */
export const panel = "rounded-3xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-md shadow-xl shadow-black/20";
