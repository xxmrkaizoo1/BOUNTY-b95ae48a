import { useEffect, useState } from "react";
import { useAppState } from "../state/AppState";
import { levelInfo, rankTitle } from "../state/core";

type Toast = { id: number; kind: "xp" | "level"; amount: number; level: number };

/**
 * Watches the player's points and celebrates gains: a "+N XP" pop for every
 * reward and a LEVEL UP banner when a new level is reached.
 */
export default function RewardToasts() {
  const { user, points, loading } = useAppState();
  const [prev, setPrev] = useState({ userId: user.id, points, loading, seq: 0 });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Adjust state while rendering when points change (React's recommended pattern
  // instead of an effect). Skip the jump that happens while data is loading.
  if (prev.userId !== user.id || prev.points !== points || prev.loading !== loading) {
    let seq = prev.seq;
    if (prev.userId === user.id && !prev.loading && !loading && points > prev.points) {
      const gained = points - prev.points;
      const next: Toast[] = [{ id: ++seq, kind: "xp", amount: gained, level: 0 }];
      const before = levelInfo(prev.points).level;
      const after = levelInfo(points).level;
      if (after > before) next.push({ id: ++seq, kind: "level", amount: 0, level: after });
      setToasts((list) => [...list, ...next].slice(-4));
    }
    setPrev({ userId: user.id, points, loading, seq });
  }

  useEffect(() => {
    if (toasts.length === 0) return;
    const oldest = toasts[0];
    const timer = setTimeout(
      () => setToasts((list) => list.filter((t) => t.id !== oldest.id)),
      oldest.kind === "level" ? 3600 : 1800
    );
    return () => clearTimeout(timer);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((toast) =>
        toast.kind === "xp" ? (
          <div
            key={toast.id}
            className="anim-pop font-game flex items-center gap-2 rounded-full border-b-4 border-amber-700 bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-2 text-lg font-bold text-amber-950 shadow-xl shadow-amber-500/30"
          >
            <span aria-hidden>⭐</span>+{toast.amount} XP
          </div>
        ) : (
          <div
            key={toast.id}
            className="anim-pop anim-glow flex items-center gap-3 rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-white shadow-2xl ring-2 ring-amber-300"
          >
            <span className="anim-bob text-3xl" aria-hidden>
              🏆
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.25em] text-amber-200">Level up!</span>
              <span className="font-game block text-xl font-bold">
                Level {toast.level} · {rankTitle(toast.level)}
              </span>
            </span>
          </div>
        )
      )}
    </div>
  );
}
