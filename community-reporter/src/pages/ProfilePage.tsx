import { useAppState } from "../state/AppState";

export default function ProfilePage() {
  const { user, points, badges } = useAppState();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center gap-3">
          <img src={user.avatar} className="h-12 w-12 rounded-full border" />
          <div>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">User ID: {user.id}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="font-semibold">Points</p>
          <p className="text-2xl">{points}</p>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="font-semibold">Badges</p>
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
  );
}
