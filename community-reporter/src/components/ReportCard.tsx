import { Link } from "react-router-dom";
import type { Report } from "../data/mockReports";
import { timeAgo } from "../lib/format";
import { CATEGORY_META } from "../lib/meta";
import { reportTimeMs } from "../state/core";
import { useAppState } from "../state/AppState";
import { CategoryBadge, StatusBadge } from "./ui";

export default function ReportCard({
  report,
  commentCount,
  newCount = 0,
  following = false,
}: {
  report: Report;
  commentCount: number;
  newCount?: number;
  following?: boolean;
}) {
  const category = CATEGORY_META[report.category];
  const { user, isAuthenticated } = useAppState();
  // Show the XP a player can still earn here.
  const canVerify =
    isAuthenticated &&
    report.status === "Closed" &&
    !report.duplicateOf &&
    report.creatorId !== user.id &&
    !report.resolutionConfirmations.includes(user.id);

  return (
    <Link
      to={`/report/${report.id}`}
      className="group flex gap-4 rounded-3xl border-b-4 border-black/30 bg-white/[0.06] p-3 ring-1 ring-white/10 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/[0.09] hover:shadow-xl hover:shadow-fuchsia-900/30 hover:ring-amber-300/50 sm:p-4"
    >
      <div
        className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 sm:h-28 sm:w-32 ${category.tile}`}
      >
        {report.photoUrl ? (
          <img
            src={report.photoUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-4xl" aria-hidden>
            {category.icon}
          </span>
        )}
        {newCount > 0 && (
          <span className="absolute left-1.5 top-1.5 anim-pop rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white shadow ring-2 ring-[#0c0a24]">
            {newCount} new
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={report.status} />
          <CategoryBadge category={report.category} />
          {report.hidden && (
            <span className="rounded-full bg-black/50 ring-1 ring-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
              Hidden
            </span>
          )}
          {report.sample && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/60 ring-1 ring-white/15" title="Example data added by an admin">
              🧪 Sample
            </span>
          )}
          {canVerify && (
            <span className="anim-glow rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-950">
              🛡️ Verify +5 XP
            </span>
          )}
          {report.duplicateOf && (
            <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-semibold text-yellow-300">
              Duplicate
            </span>
          )}
        </div>
        <h3 className="mt-1.5 line-clamp-1 text-lg font-bold text-white group-hover:text-amber-300">
          {report.title}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-white/70">{report.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-white/55">
          {report.location && (
            <span className="inline-flex max-w-[14rem] items-center gap-1 truncate">
              📍 {report.location}
            </span>
          )}
          <span>{timeAgo(reportTimeMs(report))}</span>
          <span>💬 {commentCount}</span>
          <span className={following ? "font-semibold text-amber-300" : ""}>
            👥 {report.followers.length}
            {following && " · Following"}
          </span>
        </div>
      </div>
    </Link>
  );
}
