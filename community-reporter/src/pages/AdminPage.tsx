import { Link } from "react-router-dom";
import { useState } from "react";
import { buttonStyles } from "../lib/styles";
import { SAMPLE_REPORTS } from "../data/sampleData";
import { useAppState } from "../state/AppState";
import { Avatar, Card, EmptyState, StatusBadge } from "../components/ui";
import { timeAgo } from "../lib/format";
import { reportTimeMs } from "../state/core";
import type { Report } from "../data/mockReports";

type Tab = "flagged" | "hidden" | "locked" | "all";

const TABS: { key: Tab; label: string; filter: (r: Report) => boolean }[] = [
  { key: "flagged", label: "Flagged", filter: (r) => r.flaggedBy.length > 0 },
  { key: "hidden", label: "Hidden", filter: (r) => r.hidden },
  { key: "locked", label: "Locked", filter: (r) => r.commentsLocked },
  { key: "all", label: "All reports", filter: () => true },
];

const smallButton =
  "rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-inset ring-white/20 hover:bg-white/5";

export default function AdminPage() {
  const {
    reports,
    user,
    getUser,
    toggleHideReport,
    toggleLockComments,
    dismissFlags,
    deleteReport,
    loadSampleData,
    clearSampleData,
    mode,
  } = useAppState();
  const [tab, setTab] = useState<Tab>("flagged");
  const [busy, setBusy] = useState<"load" | "clear" | null>(null);

  if (user.role !== "admin") {
    return (
      <EmptyState icon="🛡️" title="Admins only">
        Ask a project owner to set your role to <code>admin</code> in Firestore.{" "}
        <Link className="font-semibold text-amber-300 hover:underline" to="/">
          Back to the feed
        </Link>
      </EmptyState>
    );
  }

  const sampleCount = reports.filter((r) => r.sample).length;

  async function run(kind: "load" | "clear") {
    if (
      kind === "clear" &&
      !window.confirm(
        mode === "local"
          ? "Clear all demo data in this browser?"
          : `Delete all ${sampleCount} sample reports and their updates?`
      )
    )
      return;
    setBusy(kind);
    try {
      await (kind === "load" ? loadSampleData() : clearSampleData());
    } finally {
      setBusy(null);
    }
  }

  const sampleDataPanel = (
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl" aria-hidden>
          🧪
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-white">Sample data</h2>
          <p className="text-sm text-white/60">
            {mode === "local"
              ? `Reset this browser's demo to ${SAMPLE_REPORTS.length} example reports, or start empty.`
              : sampleCount > 0
                ? `${sampleCount} sample reports are live, tagged “Sample” so residents know they're examples.`
                : `Load ${SAMPLE_REPORTS.length} example reports (posted as you, tagged “Sample”) to show how the app works.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => run("load")} disabled={busy !== null} className={buttonStyles.primary}>
            {busy === "load" ? "Loading…" : mode === "local" ? "↺ Reset demo" : "＋ Load sample data"}
          </button>
          {(mode === "local" || sampleCount > 0) && (
            <button onClick={() => run("clear")} disabled={busy !== null} className={buttonStyles.danger}>
              {busy === "clear" ? "Removing…" : mode === "local" ? "Clear all" : "Remove sample data"}
            </button>
          )}
        </div>
      </Card>
  );

  const current = TABS.find((t) => t.key === tab)!;
  const list = reports
    .filter(current.filter)
    .sort((a, b) =>
      tab === "flagged" ? b.flaggedBy.length - a.flaggedBy.length : reportTimeMs(b) - reportTimeMs(a)
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">🛡️ Moderator HQ</h1>
        <p className="mt-1 text-sm text-white/70">
          Review flagged content, hide reports that break the rules, and lock heated threads.
        </p>
      </div>

      {sampleDataPanel}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TABS.map((t) => {
          const count = reports.filter(t.filter).length;
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-2xl p-4 text-left ring-1 transition ${
                active
                  ? "bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 ring-amber-300 border-b-4 border-amber-700"
                  : "bg-white/5 text-white ring-white/10 hover:ring-white/20"
              }`}
            >
              <p className={`text-xs font-semibold ${active ? "text-amber-900" : "text-white/55"}`}>
                {t.label}
              </p>
              <p className="font-game mt-1 text-3xl font-bold">{count}</p>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState icon="✨" title={`Nothing in “${current.label}”`}>
          All clear for now.
        </EmptyState>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-white/10">
            {list.map((report) => {
              const creator = getUser(report.creatorId);
              return (
                <li key={report.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Avatar src={creator.avatar} name={creator.name} seed={creator.id} />
                    <div className="min-w-0">
                      <Link
                        to={`/report/${report.id}`}
                        className="line-clamp-1 font-semibold text-white hover:text-amber-300"
                      >
                        {report.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55">
                        <StatusBadge status={report.status} />
                        <span>{creator.name}</span>
                        <span>· {timeAgo(reportTimeMs(report))}</span>
                        {report.flaggedBy.length > 0 && (
                          <span className="font-semibold text-rose-400">🚩 {report.flaggedBy.length}</span>
                        )}
                        {report.hidden && <span className="font-semibold text-white/80">Hidden</span>}
                        {report.commentsLocked && <span className="font-semibold text-white/80">🔒</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {report.flaggedBy.length > 0 && (
                      <button onClick={() => dismissFlags(report.id)} className={smallButton}>
                        Dismiss flags
                      </button>
                    )}
                    <button onClick={() => toggleHideReport(report.id)} className={smallButton}>
                      {report.hidden ? "Unhide" : "Hide"}
                    </button>
                    <button onClick={() => toggleLockComments(report.id)} className={smallButton}>
                      {report.commentsLocked ? "Unlock" : "Lock"}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete “${report.title}” permanently?`)) deleteReport(report.id);
                      }}
                      className={`${smallButton} text-rose-400 ring-rose-400/40 hover:bg-rose-500/15`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
