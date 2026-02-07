import { Link } from "react-router-dom";
import { useAppState } from "../state/AppState";

export default function Navbar() {
  const { user, isAuthenticated, signIn, signOut } = useAppState();

  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-bold">
            Community Reporter
          </Link>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            PWA Ready
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-3">
          <Link
            to="/new"
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            New Report
          </Link>

          {user.role === "admin" && (
            <Link
              to="/admin"
              className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700"
            >
              Admin
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={signOut}
              className="rounded-xl border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={signIn}
              className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
            >
              Sign in with Google
            </button>
          )}

          <Link to="/profile" className="flex items-center gap-2">
            <img
              src={user.avatar}
              alt="avatar"
              className="h-9 w-9 rounded-full border"
            />
            <span className="hidden text-sm font-semibold sm:inline">{user.name}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
