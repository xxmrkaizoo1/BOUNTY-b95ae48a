import { Link, useSearchParams } from "react-router-dom";
import { buttonStyles, inputStyles } from "../lib/styles";
import { useMemo, useState } from "react";
import { useAppState } from "../state/AppState";
import type { ReportCategory, ReportStatus } from "../data/mockReports";
import ReportCard from "../components/ReportCard";
import Leaderboard from "../components/Leaderboard";
import { Card, EmptyState } from "../components/ui";
import { CATEGORIES, CATEGORY_META, STATUS_META } from "../lib/meta";
import { getLastSeen } from "../lib/seen";
import { STATUS_FLOW, reportTimeMs, updateTimeMs } from "../state/core";

type SortKey = "newest" | "followed" | "active";

export default function FeedPage() {
  const { reports, isFollowing, updates, user, follows, isAuthenticated, loadSampleData } = useAppState();
  const [seeding, setSeeding] = useState(false);

  async function loadSamples() {
    setSeeding(true);
    try {
      await loadSampleData();
    } finally {
      setSeeding(false);
    }
  }
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | "All">("All");
  const [sort, setSort] = useState<SortKey>("newest");
  const followingOnly = params.has("following");

  const visibleReports = useMemo(
    () => reports.filter((report) => user.role === "admin" || !report.hidden),
    [reports, user.role]
  );

  // Per-report comment counts, newest activity, and unseen updates (for followed reports).
  const activityByReport = useMemo(() => {
    const map = new Map<string, { count: number; lastMs: number; unseen: number }>();
    const lastSeenCache = new Map<string, number>();
    for (const update of updates) {
      const entry = map.get(update.reportId) ?? { count: 0, lastMs: 0, unseen: 0 };
      const ms = updateTimeMs(update);
      entry.count += 1;
      entry.lastMs = Math.max(entry.lastMs, ms);
      if (follows.has(update.reportId) && update.userId !== user.id) {
        if (!lastSeenCache.has(update.reportId)) {
          lastSeenCache.set(update.reportId, getLastSeen(update.reportId));
        }
        const seen = lastSeenCache.get(update.reportId) ?? 0;
        if (seen > 0 && ms > seen) entry.unseen += 1;
      }
      map.set(update.reportId, entry);
    }
    return map;
  }, [updates, follows, user.id]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: visibleReports.length };
    for (const report of visibleReports) counts[report.status] = (counts[report.status] ?? 0) + 1;
    return counts;
  }, [visibleReports]);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<ReportCategory, number>> = {};
    for (const report of visibleReports) counts[report.category] = (counts[report.category] ?? 0) + 1;
    return counts;
  }, [visibleReports]);

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = visibleReports.filter(
      (report) =>
        (!followingOnly || follows.has(report.id)) &&
        (statusFilter === "All" || report.status === statusFilter) &&
        (categoryFilter === "All" || report.category === categoryFilter) &&
        (!term ||
          report.title.toLowerCase().includes(term) ||
          report.description.toLowerCase().includes(term) ||
          (report.location ?? "").toLowerCase().includes(term))
    );
    const lastActivity = (id: string, fallback: number) =>
      Math.max(activityByReport.get(id)?.lastMs ?? 0, fallback);
    return [...list].sort((a, b) => {
      if (sort === "followed") return b.followers.length - a.followers.length;
      if (sort === "active") return lastActivity(b.id, reportTimeMs(b)) - lastActivity(a.id, reportTimeMs(a));
      return reportTimeMs(b) - reportTimeMs(a);
    });
  }, [visibleReports, followingOnly, follows, statusFilter, categoryFilter, search, sort, activityByReport]);

  const resolvedPct = statusCounts.All
    ? Math.round(((statusCounts.Closed ?? 0) / statusCounts.All) * 100)
    : 0;
  const hasFilters = statusFilter !== "All" || categoryFilter !== "All" || search.trim() !== "";

  function setFollowingOnly(value: boolean) {
    const next = new URLSearchParams(params);
    if (value) next.set("following", "1");
    else next.delete("following");
    setParams(next, { replace: true });
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-700 to-fuchsia-700 p-6 text-white shadow-2xl shadow-fuchsia-900/30 ring-1 ring-white/15 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <span className="anim-bob pointer-events-none absolute right-6 top-5 hidden text-6xl sm:block lg:hidden" aria-hidden>
          🗺️
        </span>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
              🗺️ Quest board
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              {isAuthenticated ? `Ready, ${user.name.split(" ")[0]}?` : "Spot it. Report it. Fix it."}
            </h1>
            <p className="mt-2 text-sm text-white/80 sm:text-base">
              Every problem in your neighbourhood is a quest. Report issues, follow them, and confirm
              the fix to earn XP and level up.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/new" className={buttonStyles.primary}>
                ⚡ Start a quest <span className="rounded-full bg-amber-950/15 px-2 py-0.5 text-xs">+10 XP</span>
              </Link>
              {!isAuthenticated && (
                <span className="self-center text-xs text-white/70">Sign in to earn XP</span>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[30rem]">
            {[
              { label: "Open quests", value: statusCounts.Open ?? 0, icon: "🔴" },
              { label: "In progress", value: (statusCounts["In Progress"] ?? 0) + (statusCounts.Acknowledged ?? 0), icon: "🟡" },
              { label: "Cleared", value: `${resolvedPct}%`, icon: "🏁" },
              { label: "Following", value: follows.size, icon: "🔔" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border-b-4 border-black/25 bg-black/20 px-3 py-3 ring-1 ring-white/10 backdrop-blur">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-white/70">
                  <span aria-hidden>{stat.icon}</span> {stat.label}
                </dt>
                <dd className="font-game mt-1 text-3xl font-bold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 3.4 9.8l3.15 3.15a.75.75 0 1 0 1.06-1.06l-3.15-3.15A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  className={`${inputStyles} pl-10`}
                  placeholder="Search title, description or place"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search reports"
                />
              </div>
              <div className="flex gap-2">
                <select
                  className={`${inputStyles} sm:w-44`}
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  aria-label="Sort reports"
                >
                  <option value="newest">Newest first</option>
                  <option value="active">Recently active</option>
                  <option value="followed">Most followed</option>
                </select>
                <button
                  onClick={() => setFollowingOnly(!followingOnly)}
                  className={`shrink-0 rounded-xl px-3.5 text-sm font-semibold ring-1 ring-inset transition ${
                    followingOnly
                      ? "bg-amber-400 text-amber-950 ring-amber-400"
                      : "bg-white/5 text-white/80 ring-white/20 hover:bg-white/5"
                  }`}
                  aria-pressed={followingOnly}
                >
                  🔔 Following
                </button>
              </div>
            </div>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {(["All", ...STATUS_FLOW] as const).map((status) => {
                const active = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${
                      active
                        ? "bg-amber-400 text-amber-950 ring-amber-400 font-bold"
                        : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:ring-white/20"
                    }`}
                  >
                    {status !== "All" && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[status].dot}`} />}
                    {status}
                    <span className={active ? "text-white/40" : "text-white/40"}>
                      {statusCounts[status] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              <button
                onClick={() => setCategoryFilter("All")}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  categoryFilter === "All" ? "bg-amber-400/15 text-amber-200" : "text-white/55 hover:bg-white/10"
                }`}
              >
                All categories
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(categoryFilter === category ? "All" : category)}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    categoryFilter === category
                      ? "bg-amber-400/15 text-amber-200"
                      : "text-white/55 hover:bg-white/10"
                  }`}
                >
                  <span aria-hidden>{CATEGORY_META[category].icon}</span>
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const activity = activityByReport.get(report.id);
              return (
                <ReportCard
                  key={report.id}
                  report={report}
                  commentCount={activity?.count ?? 0}
                  newCount={activity?.unseen ?? 0}
                  following={isFollowing(report.id)}
                />
              );
            })}

            {filteredReports.length === 0 && (
              <EmptyState
                icon={followingOnly ? "🔔" : hasFilters ? "🔍" : "🌱"}
                title={
                  followingOnly
                    ? "You're not following any matching reports"
                    : hasFilters
                      ? "No reports match your filters"
                      : "No reports yet"
                }
              >
                {followingOnly ? (
                  "Open a report and tap Follow to get it here."
                ) : hasFilters ? (
                  <button
                    className="font-semibold text-amber-300 hover:underline"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                      setCategoryFilter("All");
                    }}
                  >
                    Clear filters
                  </button>
                ) : (
                  <div className="space-y-4">
                    <Link to="/new" className="font-semibold text-amber-300 hover:underline">
                      Be the first to report an issue
                    </Link>
                    {user.role === "admin" && (
                      <div>
                        <button onClick={loadSamples} disabled={seeding} className={buttonStyles.primary}>
                          {seeding ? "Loading…" : "🧪 Load sample data"}
                        </button>
                        <p className="mt-2 text-xs text-white/50">
                          Admin only · adds example reports tagged “Sample”. Remove them anytime in Moderator HQ.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </EmptyState>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block lg:self-start">
          <Leaderboard />

          <Card>
            <h2 className="text-base font-bold text-white">📊 Quest types</h2>
            <ul className="mt-4 space-y-3">
              {CATEGORIES.filter((c) => categoryCounts[c]).map((category) => {
                const count = categoryCounts[category] ?? 0;
                const pct = Math.round((count / Math.max(1, visibleReports.length)) * 100);
                return (
                  <li key={category}>
                    <button
                      onClick={() => setCategoryFilter(category)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">
                          {CATEGORY_META[category].icon} {category}
                        </span>
                        <span className="font-semibold text-white">{count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                        <div className="h-1.5 rounded-full bg-amber-400/100" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  </li>
                );
              })}
              {visibleReports.length === 0 && <li className="text-sm text-white/55">No data yet.</li>}
            </ul>
          </Card>

          <Card>
            <h2 className="text-base font-bold text-white">🎯 How to earn XP</h2>
            <ol className="mt-4 space-y-4 text-sm">
              {[
                ["📸", "Report an issue · +10 XP", "Snap a photo and pin the location."],
                ["💬", "Comment or update · +2 XP", "Share what you know on any report."],
                ["✅", "Confirm a fix · +5 XP", "Check a closed report is really solved."],
                ["🏆", "Your fix confirmed · +20 XP", "When 2 neighbours verify your report."],
              ].map(([icon, title, text]) => (
                <li key={title} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10" aria-hidden>
                    {icon}
                  </span>
                  <span>
                    <span className="block font-semibold text-white">{title}</span>
                    <span className="text-white/55">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Link to="/new" className={`${buttonStyles.primary} mt-5 w-full`}>
              Report an issue
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
