import { Link } from "react-router-dom";
import { useAppState } from "../state/AppState";

export default function ProfilePage() {
  const { user, points, badges, activity, isAuthenticated, signIn, signOut } = useAppState();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <img src={user.avatar} className="h-12 w-12 rounded-full border" />
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">User ID: {user.id}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={signIn}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
              >
                Sign in with Google
              </button>
            )}
            <Link
              to="/new"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Create report
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-600">Points</p>
              <p className="text-2xl font-bold text-gray-900">{points}</p>
              <p className="text-xs text-gray-500">
                Earn points for reporting, helping, and confirming fixes.
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-600">Badges</p>
              {badges.length === 0 ? (
                <p className="text-gray-600">No badges yet.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Activity</h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No activity yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              {activity.map((item) => (
                <li key={item.id} className="rounded-xl border border-gray-100 p-3">
                  <p className="font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.createdAt}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Badge Guide</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li>
            <span className="font-semibold text-gray-800">First Report</span> — submit your
            first community report.
          </li>
          <li>
            <span className="font-semibold text-gray-800">Helper</span> — contribute 5 updates
            or comments.
          </li>
          <li>
            <span className="font-semibold text-gray-800">Resolver</span> — 2 of your reports
            get confirmed resolved by the community.
          </li>
        </ul>
      </div>
    </div>
  );
}
