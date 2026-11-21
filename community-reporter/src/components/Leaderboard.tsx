import { useMemo } from "react";
import { useAppState } from "../state/AppState";
import { computePoints, levelInfo, rankTitle } from "../state/core";
import { Avatar, Card } from "./ui";

const MEDALS = ["🥇", "🥈", "🥉"];

/** Top players by XP, computed from everyone's reports, comments and confirmations. */
export default function Leaderboard({ limit = 5 }: { limit?: number }) {
  const { reports, updates, getUser, user } = useAppState();

  const ranking = useMemo(() => {
    const ids = new Set<string>();
    reports.forEach((r) => {
      ids.add(r.creatorId);
      r.resolutionConfirmations.forEach((id) => ids.add(id));
    });
    updates.forEach((u) => ids.add(u.userId));
    ids.delete("guest");
    return [...ids]
      .map((id) => ({ id, points: computePoints(reports, updates, id) }))
      .filter((p) => p.points > 0)
      .sort((a, b) => b.points - a.points);
  }, [reports, updates]);

  const top = ranking.slice(0, limit);
  const myRank = ranking.findIndex((p) => p.id === user.id);

  return (
    <Card>
      <h2 className="text-base font-bold text-white">🏆 Leaderboard</h2>
      {top.length === 0 ? (
        <p className="mt-3 text-sm text-white/55">No players yet — be the first on the board!</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {top.map((player, index) => {
            const profile = getUser(player.id);
            const { level } = levelInfo(player.points);
            const me = player.id === user.id;
            return (
              <li
                key={player.id}
                className={`flex items-center gap-3 rounded-2xl px-2.5 py-2 ${
                  me ? "bg-amber-400/15 ring-1 ring-amber-300/40" : index === 0 ? "bg-white/[0.06]" : ""
                }`}
              >
                <span className="font-game w-6 text-center text-lg font-bold text-white/60">
                  {MEDALS[index] ?? index + 1}
                </span>
                <Avatar src={profile.avatar} name={profile.name} seed={profile.id} size="h-8 w-8" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {profile.name}
                    {me && <span className="text-amber-300"> (you)</span>}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-white/45">
                    Lv {level} · {rankTitle(level)}
                  </span>
                </span>
                <span className="font-game text-sm font-bold text-amber-300">{player.points} XP</span>
              </li>
            );
          })}
        </ol>
      )}
      {myRank >= limit && (
        <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-center text-xs text-white/60">
          You're <b className="text-amber-300">#{myRank + 1}</b> — keep going!
        </p>
      )}
    </Card>
  );
}
