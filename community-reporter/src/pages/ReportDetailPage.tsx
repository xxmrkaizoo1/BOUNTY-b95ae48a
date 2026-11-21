import { Link, useNavigate, useParams } from "react-router-dom";
import { buttonStyles, inputStyles } from "../lib/styles";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../state/AppState";
import {
  Avatar,
  Card,
  CategoryBadge,
  EmptyState,
  SectionTitle,
  StatusBadge,
  StatusStepper
} from "../components/ui";
import { fullDate, mapsLink, osmEmbed, timeAgo } from "../lib/format";
import { STATUS_META } from "../lib/meta";
import { markSeen } from "../lib/seen";
import {
  LIMITS,
  RESOLVED_CONFIRMATIONS,
  STATUS_FLOW,
  canManageReport,
  communityConfirmations,
  reportTimeMs,
  updateTimeMs,
} from "../state/core";

export default function ReportDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const {
    reports,
    user,
    isAuthenticated,
    signIn,
    getUser,
    isFollowing,
    toggleFollow,
    addUpdate,
    getReportUpdates,
    changeStatus,
    confirmResolution,
    toggleFlag,
    dismissFlags,
    deleteReport,
    markDuplicate,
    toggleHideReport,
    toggleLockComments,
  } = useAppState();
  const [message, setMessage] = useState("");
  const [official, setOfficial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateOf, setDuplicateOf] = useState("");
  const [copied, setCopied] = useState(false);

  const report = reports.find((r) => r.id === id);
  const updates = useMemo(
    () =>
      report
        ? [...getReportUpdates(report.id)].sort((a, b) => updateTimeMs(a) - updateTimeMs(b))
        : [],
    [report, getReportUpdates]
  );

  // Remember that the user has seen this report's latest updates ("new" badges in the feed).
  useEffect(() => {
    if (report) markSeen(report.id);
  }, [report, updates.length]);

  if (!report) {
    return (
      <EmptyState icon="🤷" title="Report not found">
        It may have been removed or hidden by a moderator.{" "}
        <Link className="font-semibold text-amber-300 hover:underline" to="/">
          Back to the feed
        </Link>
      </EmptyState>
    );
  }

  const reportId = report.id;
  const reporter = getUser(report.creatorId);
  const following = isFollowing(reportId);
  const canManage = canManageReport(user, report);
  const isOwner = user.id === report.creatorId;
  const isAdmin = user.role === "admin";
  const hasConfirmed = report.resolutionConfirmations.includes(user.id);
  const hasFlagged = report.flaggedBy.includes(user.id);
  const confirmations = communityConfirmations(report);
  const statusIndex = STATUS_FLOW.indexOf(report.status);
  const nextStatus = STATUS_FLOW[statusIndex + 1];
  const original = report.duplicateOf ? reports.find((r) => r.id === report.duplicateOf) : undefined;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = addUpdate(reportId, message, official ? "update" : "comment");
    if (!result.ok) {
      setError(result.message || "Unable to post update.");
      return;
    }
    setMessage("");
    setOfficial(false);
    setError(null);
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: report!.title, text: report!.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled the share sheet
    }
  }

  function onDelete() {
    if (window.confirm("Delete this report permanently? This can't be undone.")) {
      deleteReport(reportId);
      nav("/");
    }
  }

  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm font-semibold text-white/55 hover:text-white">
        ← Back to feed
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          <article className="overflow-hidden rounded-2xl bg-white/5 shadow-sm ring-1 ring-white/10">
            {report.photoUrl && (
              <a href={report.photoUrl} target="_blank" rel="noreferrer">
                <img src={report.photoUrl} alt={report.title} className="max-h-[26rem] w-full bg-white/10 object-cover" />
              </a>
            )}
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={report.status} size="md" />
                <CategoryBadge category={report.category} />
                {report.sample && (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/60 ring-1 ring-white/15">
                    🧪 Sample data
                  </span>
                )}
                {report.hidden && (
                  <span className="rounded-full bg-black/50 ring-1 ring-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Hidden from public
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{report.title}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/55">
                <span className="flex items-center gap-2">
                  <Avatar src={reporter.avatar} name={reporter.name} seed={reporter.id} size="h-6 w-6" />
                  <span className="font-medium text-white/80">{reporter.name}</span>
                </span>
                <span title={fullDate(reportTimeMs(report))}>{timeAgo(reportTimeMs(report))}</span>
                {report.updatedAtMs && <span title={fullDate(report.updatedAtMs)}>· edited</span>}
                {report.location && <span>📍 {report.location}</span>}
              </div>

              <p className="mt-5 whitespace-pre-line text-white/80">{report.description}</p>

              {report.duplicateOf && (
                <div className="mt-5 rounded-xl bg-yellow-500/15 p-4 text-sm text-yellow-300 ring-1 ring-yellow-400/40">
                  This is a duplicate.{" "}
                  {original ? (
                    <Link to={`/report/${original.id}`} className="font-semibold underline">
                      Follow the original: {original.title} →
                    </Link>
                  ) : (
                    "The original report is no longer available."
                  )}
                </div>
              )}

              <div className="mt-6 rounded-xl bg-white/5 p-4">
                <StatusStepper status={report.status} />
                <p className="mt-3 text-xs text-white/55">{STATUS_META[report.status].hint}</p>
              </div>
            </div>

            {report.coords && (
              <div className="border-t border-white/10">
                <iframe
                  title="Report location"
                  src={osmEmbed(report.coords.lat, report.coords.lng)}
                  className="h-56 w-full"
                  loading="lazy"
                />
                <a
                  href={mapsLink(report.coords.lat, report.coords.lng)}
                  target="_blank"
                  rel="noreferrer"
                  className="block px-5 py-3 text-sm font-semibold text-amber-300 hover:bg-white/5"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            )}
          </article>

          {/* Timeline */}
          <Card>
            <SectionTitle
              action={
                report.commentsLocked && (
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/55">
                    🔒 Comments locked
                  </span>
                )
              }
            >
              💬 Updates & comments <span className="font-normal text-white/40">({updates.length})</span>
            </SectionTitle>

            {updates.length === 0 ? (
              <p className="text-sm text-white/55">No updates yet. Know something? Share it below.</p>
            ) : (
              <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[17px] before:top-2 before:w-px before:bg-white/15">
                {updates.map((update) => {
                  const author = getUser(update.userId);
                  const isOfficial = update.type === "update";
                  return (
                    <li key={update.id} className="relative flex gap-3">
                      <Avatar src={author.avatar} name={author.name} seed={author.id} />
                      <div
                        className={`min-w-0 flex-1 rounded-xl px-4 py-3 ${
                          isOfficial ? "bg-amber-400/10 ring-1 ring-amber-300/30" : "bg-white/5"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                          <span className="font-semibold text-white">{author.name}</span>
                          {author.role === "admin" && (
                            <span className="rounded bg-orange-500/20 px-1.5 py-0.5 font-semibold text-orange-300">
                              Admin
                            </span>
                          )}
                          {update.userId === report.creatorId && (
                            <span className="rounded bg-white/15 px-1.5 py-0.5 font-semibold text-white/70">
                              Reporter
                            </span>
                          )}
                          {isOfficial && (
                            <span className="rounded bg-amber-400 px-1.5 py-0.5 font-bold text-amber-950">
                              Update
                            </span>
                          )}
                          <span className="text-white/40" title={fullDate(updateTimeMs(update))}>
                            {timeAgo(updateTimeMs(update))}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-line break-words text-sm text-white/80">
                          {update.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-6 border-t border-white/10 pt-5">
              {!isAuthenticated ? (
                <button onClick={signIn} className={`${buttonStyles.secondary} w-full`}>
                  Sign in to join the conversation
                </button>
              ) : report.commentsLocked && !isAdmin ? (
                <p className="text-sm text-white/55">A moderator has locked comments on this report.</p>
              ) : (
                <form onSubmit={onSubmit} className="flex gap-3">
                  <Avatar src={user.avatar} name={user.name} seed={user.id} />
                  <div className="flex-1 space-y-2">
                    <textarea
                      className={inputStyles}
                      rows={3}
                      maxLength={LIMITS.comment}
                      placeholder={canManage ? "Share progress or a comment…" : "Add a comment or new info…"}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      aria-label="Your comment"
                    />
                    {error && <p className="text-sm text-rose-400">{error}</p>}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {canManage ? (
                        <label className="flex items-center gap-2 text-sm text-white/70">
                          <input
                            type="checkbox"
                            checked={official}
                            onChange={(e) => setOfficial(e.target.checked)}
                            className="h-4 w-4 rounded accent-amber-400"
                          />
                          Post as progress update
                        </label>
                      ) : (
                        <span className="text-xs text-white/40">
                          {message.length}/{LIMITS.comment}
                        </span>
                      )}
                      <button className={buttonStyles.primary} disabled={!message.trim()}>
                        Post · +2 XP
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toggleFollow(reportId)}
                className={following ? buttonStyles.secondary : buttonStyles.primary}
              >
                {following ? "✓ Following" : "🔔 Follow"}
              </button>
              <button onClick={share} className={buttonStyles.secondary}>
                {copied ? "✓ Link copied" : "↗ Share"}
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-white/55">
              {report.followers.length} {report.followers.length === 1 ? "person follows" : "people follow"} this report
            </p>
            {isAuthenticated && !isOwner && (
              <button
                onClick={() => toggleFlag(reportId)}
                className="mt-3 w-full text-center text-xs font-semibold text-white/40 hover:text-rose-400"
              >
                {hasFlagged ? "🚩 Flagged for review — undo" : "🚩 Report inappropriate content"}
              </button>
            )}
          </Card>

          {/* Resolution */}
          <Card>
            <h2 className="text-base font-bold text-white">🛡️ Is it really fixed?</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.min(100, (confirmations / RESOLVED_CONFIRMATIONS) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-white/80">
                {confirmations}/{RESOLVED_CONFIRMATIONS}
              </span>
            </div>
            <p className="mt-2 text-xs text-white/55">
              {confirmations >= RESOLVED_CONFIRMATIONS
                ? "✅ Confirmed fixed by the community."
                : report.status === "Closed"
                  ? "Neighbours, check the spot and confirm the fix."
                  : "Confirmations open once the report is closed."}
            </p>
            {report.status === "Closed" && isAuthenticated && !isOwner && (
              <button
                onClick={() => confirmResolution(reportId)}
                className={`${hasConfirmed ? buttonStyles.secondary : buttonStyles.primary} mt-3 w-full`}
              >
                {hasConfirmed ? "✓ You confirmed — undo" : "✅ I confirm it's fixed · +5 XP"}
              </button>
            )}
          </Card>

          {/* Owner / admin tools */}
          {canManage && (
            <Card>
              <h2 className="text-sm font-semibold text-white">
                {isOwner ? "⚙️ Manage your quest" : "⚙️ Manage quest"}
              </h2>
              {nextStatus ? (
                <button onClick={() => changeStatus(reportId, nextStatus)} className={`${buttonStyles.primary} mt-3 w-full`}>
                  Move to “{nextStatus}”
                </button>
              ) : (
                <p className="mt-3 rounded-xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-300">
                  This report is closed.
                </p>
              )}
              <label className="mt-3 block text-xs font-semibold text-white/55">
                Or set status
                <select
                  className={`${inputStyles} mt-1`}
                  value={report.status}
                  onChange={(e) => changeStatus(reportId, e.target.value as typeof report.status)}
                >
                  {STATUS_FLOW.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link to={`/report/${reportId}/edit`} className={buttonStyles.secondary}>
                  ✏️ Edit
                </Link>
                <button onClick={onDelete} className={buttonStyles.danger}>
                  🗑️ Delete
                </button>
              </div>
            </Card>
          )}

          {isAdmin && (
            <Card className="bg-orange-50/60 ring-orange-400/40">
              <h2 className="text-sm font-semibold text-orange-300">🛡️ Moderation</h2>
              <p className="mt-1 text-xs text-orange-300">
                {report.flaggedBy.length} flag{report.flaggedBy.length === 1 ? "" : "s"} on this report
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => toggleHideReport(reportId)} className={buttonStyles.secondary}>
                  {report.hidden ? "Unhide" : "Hide"}
                </button>
                <button onClick={() => toggleLockComments(reportId)} className={buttonStyles.secondary}>
                  {report.commentsLocked ? "Unlock" : "Lock"} comments
                </button>
                {report.flaggedBy.length > 0 && (
                  <button onClick={() => dismissFlags(reportId)} className={`${buttonStyles.secondary} col-span-2`}>
                    Dismiss flags
                  </button>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <select
                  className={inputStyles}
                  value={duplicateOf}
                  onChange={(event) => setDuplicateOf(event.target.value)}
                  aria-label="Mark as duplicate of"
                >
                  <option value="">Duplicate of…</option>
                  {reports
                    .filter((item) => item.id !== report.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => duplicateOf && markDuplicate(reportId, duplicateOf)}
                  disabled={!duplicateOf}
                  className={buttonStyles.primary}
                >
                  Save
                </button>
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
