import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAppState } from "../state/AppState";

export default function ReportDetailPage() {
  const { id } = useParams();
  const { reports, isFollowing, toggleFollow, ensureCreatorAutoFollow } = useAppState();

  const report = reports.find((r) => r.id === id);

  useEffect(() => {
    if (report) ensureCreatorAutoFollow(report.id, report.creatorId);
  }, [report, ensureCreatorAutoFollow]);

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-gray-600">Report not found.</p>
        <Link className="text-blue-600 underline" to="/">Back</Link>
      </div>
    );
  }

  const following = isFollowing(report.id);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link className="text-blue-600 underline" to="/">← Back</Link>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
            {report.status}
          </span>
        </div>

        <p className="mt-3 text-gray-700">{report.description}</p>

        <div className="mt-4 text-sm text-gray-500">
          {report.category} • {report.createdAt}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => toggleFollow(report.id)}
            className="flex-1 rounded-xl border py-3 font-semibold hover:bg-gray-50"
          >
            {following ? "Unfollow" : "Follow"}
          </button>

          <button className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700">
            Add Update
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-gray-600">
          Updates/Comments will go here (next step).
        </div>
      </div>
    </div>
  );
}
