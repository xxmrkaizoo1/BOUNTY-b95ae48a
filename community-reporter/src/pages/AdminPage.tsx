import { Link } from "react-router-dom";
import { useAppState } from "../state/AppState";

export default function AdminPage() {
  const { reports, user, toggleHideReport, toggleLockComments } = useAppState();

  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-gray-600">Admin access only.</p>
        <Link className="text-blue-600 underline" to="/">
          Back
        </Link>
      </div>
    );
  }

  const flaggedReports = reports.filter((report) => report.flaggedBy.length > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-sm text-gray-600">
        Monitor flagged content, hide reports, and lock comments.
      </p>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Flagged Reports</h2>
        {flaggedReports.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No flagged items.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {flaggedReports.map((report) => (
              <div key={report.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold">{report.title}</p>
                    <p className="text-sm text-gray-500">
                      Flags: {report.flaggedBy.length} • Status: {report.status}
                    </p>
                  </div>
                  <Link
                    to={`/report/${report.id}`}
                    className="text-sm font-semibold text-blue-600 underline"
                  >
                    View
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleHideReport(report.id)}
                    className="rounded-xl border px-3 py-2 text-sm font-semibold"
                  >
                    {report.hidden ? "Unhide" : "Hide"}
                  </button>
                  <button
                    onClick={() => toggleLockComments(report.id)}
                    className="rounded-xl border px-3 py-2 text-sm font-semibold"
                  >
                    {report.commentsLocked ? "Unlock comments" : "Lock comments"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Safety shortcuts</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li>Hide/unhide reports that violate community guidelines.</li>
          <li>Lock comments to prevent escalation while reviewing.</li>
          <li>Escalate bans through your real admin tools (not wired here).</li>
        </ul>
      </div>
    </div>
  );
}
