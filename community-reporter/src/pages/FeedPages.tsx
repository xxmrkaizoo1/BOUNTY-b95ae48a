import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAppState } from "../state/AppState";
import type { ReportStatus } from "../data/mockReports";

const STATUS_OPTIONS: ReportStatus[] = [
  "Open",
  "Acknowledged",
  "In Progress",
  "Closed",
];

export default function FeedPage() {
  const { reports, isFollowing, updates, user, follows } = useAppState();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const stats = useMemo(() => {
    const visibleReports = reports.filter((report) =>
      user.role === "admin" ? true : !report.hidden
    );
    return {
      total: visibleReports.length,
      open: visibleReports.filter((report) => report.status === "Open").length,
      inProgress: visibleReports.filter((report) => report.status === "In Progress").length,
      closed: visibleReports.filter((report) => report.status === "Closed").length,
      following: follows.size,
    };
  }, [reports, follows.size, user.role]);

  const categoryCounts = useMemo(() => {
    return reports.reduce<Record<string, number>>((acc, report) => {
      if (user.role !== "admin" && report.hidden) return acc;
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {});
  }, [reports, user.role]);

  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => (user.role === "admin" ? true : !report.hidden))
      .filter((report) =>
        statusFilter === "All" ? true : report.status === statusFilter
      )
      .filter((report) =>
        categoryFilter === "All" ? true : report.category === categoryFilter
      )
      .filter((report) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        return (
          report.title.toLowerCase().includes(term) ||
          report.description.toLowerCase().includes(term)
        );
      });
  }, [reports, statusFilter, categoryFilter, search, user.role]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Community Pulse
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Public Feed</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track reports, follow updates, and help verify fixes together.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/profile"
            className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            View profile
          </Link>
          <Link
            to="/new"
            className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            + New Report
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total reports", value: stats.total, tone: "text-gray-900" },
            { label: "Open", value: stats.open, tone: "text-rose-600" },
            { label: "In progress", value: stats.inProgress, tone: "text-amber-600" },
            { label: "Closed", value: stats.closed, tone: "text-emerald-600" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl bg-white p-4 shadow">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className={`mt-2 text-2xl font-bold ${card.tone}`}>{card.value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow">
          <p className="text-sm font-semibold uppercase tracking-wide">Your impact</p>
          <p className="mt-3 text-3xl font-bold">{stats.following}</p>
          <p className="text-sm text-blue-100">Reports you follow</p>
          <p className="mt-4 text-sm">
            Follow reports to stay in the loop and help confirm resolutions faster.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr]">
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Search reports"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded-xl border px-3 py-2"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ReportStatus | "All")}
          >
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border px-3 py-2"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="All">All categories</option>
            {[...new Set(reports.map((report) => report.category))].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Popular categories</p>
            <p className="text-xs text-gray-500">Top issues reported this week.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([category, count]) => (
                <span
                  key={category}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                >
                  {category} • {count}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.map((report) => {
          const updateCount = updates.filter((item) => item.reportId === report.id).length;
          return (
            <Link
              key={report.id}
              to={`/report/${report.id}`}
              className="block rounded-2xl bg-white p-5 shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{report.title}</h2>
                  <p className="mt-2 text-gray-600">{report.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {report.hidden && (
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
                      Hidden
                    </span>
                  )}
                  {isFollowing(report.id) && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      Following
                    </span>
                  )}
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {report.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>{report.category}</span>
                <span>•</span>
                <span>{report.createdAt}</span>
                {report.location && (
                  <>
                    <span>•</span>
                    <span>{report.location}</span>
                  </>
                )}
                <span>•</span>
                <span>{updateCount} updates</span>
              </div>
            </Link>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center text-gray-500 shadow">
            No reports match your filters yet.
          </div>
        )}
      </div>
    </div>
  );
}
