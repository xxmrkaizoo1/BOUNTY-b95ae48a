import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { statusFlow, useAppState } from "../state/AppState";

export default function ReportDetailPage() {
  const { id } = useParams();
  const {
    reports,
    user,
    isFollowing,
    toggleFollow,
    addUpdate,
    getReportUpdates,
    changeStatus,
    confirmResolution,
    flagReport,
    markDuplicate,
    toggleHideReport,
    toggleLockComments,
  } = useAppState();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [duplicateOf, setDuplicateOf] = useState("");

  const report = reports.find((r) => r.id === id);
  const updates = useMemo(() => (report ? getReportUpdates(report.id) : []), [report, getReportUpdates]);

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-gray-600">Report not found.</p>
        <Link className="text-blue-600 underline" to="/">
          Back
        </Link>
      </div>
    );
  }

  const following = isFollowing(report.id);
  const canManage = user.role === "admin" || user.id === report.creatorId;
  const hasConfirmed = report.resolutionConfirmations.includes(user.id);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = addUpdate(report.id, message);
    if (!result.ok) {
      setError(result.message || "Unable to post update.");
      return;
    }
    setMessage("");
    setError(null);
  }

  function handleDuplicate() {
    if (!duplicateOf) return;
    markDuplicate(report.id, duplicateOf);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Link className="text-blue-600 underline" to="/">
        ← Back
      </Link>

      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{report.title}</h1>
            <p className="mt-2 text-gray-600">{report.description}</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
            {report.status}
          </span>
        </div>

        {report.photoUrl && (
          <img
            src={report.photoUrl}
            alt={report.title}
            className="mt-5 h-64 w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
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
          <span>{report.followers.length} followers</span>
        </div>

        {report.duplicateOf && (
          <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Marked as duplicate of report {report.duplicateOf}. Please follow the original.
          </div>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <button
            onClick={() => toggleFollow(report.id)}
            className="rounded-xl border py-3 font-semibold hover:bg-gray-50"
          >
            {following ? "Unfollow" : "Follow"}
          </button>
          <button
            onClick={() => flagReport(report.id)}
            className="rounded-xl border border-rose-200 bg-rose-50 py-3 font-semibold text-rose-700"
          >
            Flag report
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Status Flow</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {statusFlow.map((status) => (
            <div
              key={status}
              className={`rounded-xl border p-3 text-center text-sm font-semibold ${
                status === report.status
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-gray-100 text-gray-500"
              }`}
            >
              {status}
            </div>
          ))}
        </div>
        {canManage && (
          <div className="mt-4 flex flex-wrap gap-2">
            {statusFlow.map((status) => (
              <button
                key={status}
                onClick={() => changeStatus(report.id, status)}
                className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Set {status}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Resolution Confirmation</h2>
        <p className="mt-2 text-sm text-gray-600">
          When a report is closed, community members can confirm if the fix is real.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
            {report.resolutionConfirmations.length} confirmations
          </span>
          <button
            onClick={() => confirmResolution(report.id)}
            disabled={report.status !== "Closed" || hasConfirmed}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {hasConfirmed ? "Confirmed" : "Confirm resolution"}
          </button>
          {report.status !== "Closed" && (
            <span className="text-sm text-gray-500">
              Close the report first to enable confirmations.
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Updates & Comments</h2>
          {report.commentsLocked && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              Comments locked
            </span>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <textarea
            className="w-full rounded-xl border p-3"
            rows={3}
            placeholder="Share an update or comment"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            Post update
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {updates.length === 0 ? (
            <p className="text-sm text-gray-500">No updates yet. Be the first!</p>
          ) : (
            updates.map((update) => (
              <div key={update.id} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{update.type === "update" ? "Update" : "Comment"}</span>
                  <span>{update.createdAt}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{update.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {user.role === "admin" && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 text-sm text-orange-800">
          <h3 className="text-lg font-semibold">Admin Controls</h3>
          <p className="mt-2">Flag count: {report.flaggedBy.length}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => toggleHideReport(report.id)}
              className="rounded-xl border bg-white px-3 py-2 font-semibold"
            >
              {report.hidden ? "Unhide report" : "Hide report"}
            </button>
            <button
              onClick={() => toggleLockComments(report.id)}
              className="rounded-xl border bg-white px-3 py-2 font-semibold"
            >
              {report.commentsLocked ? "Unlock comments" : "Lock comments"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <select
              className="rounded-xl border px-3 py-2"
              value={duplicateOf}
              onChange={(event) => setDuplicateOf(event.target.value)}
            >
              <option value="">Mark as duplicate of...</option>
              {reports
                .filter((item) => item.id !== report.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
            </select>
            <button
              onClick={handleDuplicate}
              className="rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white"
            >
              Save duplicate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
