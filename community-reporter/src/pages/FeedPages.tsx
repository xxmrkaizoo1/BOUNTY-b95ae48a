import { Link } from "react-router-dom";
import { useAppState } from "../state/AppState";

export default function FeedPage() {
  const { reports, isFollowing } = useAppState();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Public Feed</h1>
        <Link
          to="/new"
          className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          + New Report
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {reports.map((r) => (
          <Link
            key={r.id}
            to={`/report/${r.id}`}
            className="block rounded-2xl bg-white p-5 shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{r.title}</h2>
              <div className="flex items-center gap-2">
                {isFollowing(r.id) && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    Following
                  </span>
                )}
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                  {r.status}
                </span>
              </div>
            </div>
            <p className="mt-2 text-gray-600">{r.description}</p>
            <div className="mt-3 text-sm text-gray-500">
              {r.category} • {r.createdAt}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
