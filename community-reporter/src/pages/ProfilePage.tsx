import { Link } from "react-router-dom";
import { buttonStyles, inputStyles } from "../lib/styles";
import { useMemo } from "react";
import { useAppState } from "../state/AppState";
import ReportCard from "../components/ReportCard";
import { Avatar, Card, EmptyState, GoogleIcon, LevelBadge, SectionTitle, XpBar } from "../components/ui";
import { timeAgo } from "../lib/format";
import { badgeProgress, computeStats, levelInfo, rankTitle } from "../state/core";
import Leaderboard from "../components/Leaderboard";


export default function ProfilePage() {
  const {
    user,
    points,
    activity,
    reports,
    updates,
    follows,
    isAuthenticated,
    signIn,
    signOut,
    demoUsers,
    switchDemoUser,
    mode,
    startTour,
  } = useAppState();

  const stats = useMemo(() => computeStats(reports, updates, user.id), [reports, updates, user.id]);
  const badges = useMemo(() => badgeProgress(reports, updates, user.id), [reports, updates, user.id]);
  const myReports = reports.filter((r) => r.creatorId === user.id);
  const commentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of updates) counts.set(u.reportId, (counts.get(u.reportId) ?? 0) + 1);
    return counts;
  }, [updates]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md pt-6">
        <Card className="p-8 text-center">
          <p className="text-4xl" aria-hidden>⭐</p>
          <h1 className="mt-3 text-xl font-bold text-white">Track your impact</h1>
          <p className="mt-2 text-sm text-white/70">
            Sign in to see your reports, the issues you follow, your points and badges.
          </p>
          <button onClick={signIn} className={`${buttonStyles.secondary} mt-6 w-full`}>
            <GoogleIcon /> Continue with Google
          </button>
        </Card>
      </div>
    );
  }

  const { level, into, needed } = levelInfo(points);

  return (
    <div className="space-y-6">
      {/* Player card */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-md">
        <div className="relative h-28 overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
          <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-amber-300/30 blur-2xl" />
          <p className="font-game absolute right-5 top-4 text-xs font-bold uppercase tracking-[0.3em] text-white/80">
            Player profile
          </p>
        </div>
        <div className="px-5 pb-5 sm:px-6">
          <div className="relative -mt-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <span className="relative">
                <span className="block rounded-full bg-gradient-to-b from-amber-300 to-orange-500 p-1 shadow-lg shadow-amber-500/30">
                  <Avatar src={user.avatar} name={user.name} seed={user.id} size="h-20 w-20" />
                </span>
                <LevelBadge points={points} className="absolute -bottom-1 -right-1 h-8 min-w-8 text-sm" />
              </span>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-sm font-bold uppercase tracking-wider text-amber-300">
                  Lv {level} · {rankTitle(level)}
                  {user.role === "admin" && <span className="text-orange-300"> · Moderator</span>}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/new" className={buttonStyles.primary}>
                ⚡ New quest
              </Link>
              <button onClick={startTour} className={buttonStyles.secondary}>
                🎮 Tutorial
              </button>
              <button onClick={signOut} className={buttonStyles.secondary}>
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
            <div className="flex items-end justify-between">
              <span className="font-game text-3xl font-bold text-amber-300">⭐ {points} XP</span>
              <span className="text-xs font-semibold text-white/60">
                {needed - into} XP to level {level + 1} · {rankTitle(level + 1)}
              </span>
            </div>
            <div className="mt-2">
              <XpBar points={points} compact />
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "📸 Reports", value: stats.reports },
              { label: "💬 Comments", value: stats.comments },
              { label: "🔔 Following", value: follows.size },
              { label: "🛡️ Verified", value: stats.confirmations },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border-b-4 border-black/30 bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-white/55">{item.label}</dt>
                <dd className="font-game text-2xl font-bold text-white">{item.value}</dd>
              </div>
            ))}
          </dl>

          {mode === "local" && demoUsers && switchDemoUser && (
            <label className="mt-5 flex flex-wrap items-center gap-2 rounded-xl bg-amber-500/15 px-4 py-3 text-sm text-amber-300 ring-1 ring-amber-400/40">
              Demo: act as
              <select
                className={`${inputStyles} w-auto py-1.5`}
                value={user.id}
                onChange={(e) => switchDemoUser(e.target.value)}
              >
                {demoUsers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.role === "admin" ? "(admin)" : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <div>
            <SectionTitle>📜 My quests</SectionTitle>
            {myReports.length === 0 ? (
              <EmptyState icon="📝" title="You haven't reported anything yet">
                <Link to="/new" className="font-semibold text-amber-300 hover:underline">
                  Report your first issue
                </Link>
              </EmptyState>
            ) : (
              <div className="space-y-3">
                {myReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    commentCount={commentCounts.get(report.id) ?? 0}
                    following={follows.has(report.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Leaderboard />
          <Card>
            <SectionTitle>🎖️ Achievements</SectionTitle>
            <ul className="space-y-3">
              {badges.map((badge) => (
                <li key={badge.name} className={`flex items-center gap-3 ${badge.earned ? "" : "opacity-60"}`}>
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${
                      badge.earned ? "bg-gradient-to-b from-amber-300 to-amber-500 shadow-lg shadow-amber-500/30" : "bg-white/10 grayscale"
                    }`}
                    aria-hidden
                  >
                    {badge.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{badge.name}</p>
                      <span className="text-xs font-semibold text-white/55">
                        {badge.earned ? "Earned" : `${badge.value}/${badge.goal}`}
                      </span>
                    </div>
                    <p className="text-xs text-white/55">{badge.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle>📖 Quest log</SectionTitle>
            {activity.length === 0 ? (
              <p className="text-sm text-white/55">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.reportId ? (
                      <Link to={`/report/${item.reportId}`} className="text-white/80 hover:text-amber-300">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-white/80">{item.label}</span>
                    )}
                    <p className="text-xs text-white/40">{timeAgo(item.createdAtMs)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle>⭐ XP rewards</SectionTitle>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li className="flex justify-between"><span>Submit a report</span><span className="font-game font-bold text-amber-300">+10</span></li>
              <li className="flex justify-between"><span>Post a comment/update</span><span className="font-game font-bold text-amber-300">+2</span></li>
              <li className="flex justify-between"><span>Confirm a fix</span><span className="font-game font-bold text-amber-300">+5</span></li>
              <li className="flex justify-between"><span>Your report confirmed fixed</span><span className="font-game font-bold text-amber-300">+20</span></li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
