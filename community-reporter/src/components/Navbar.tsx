import { Link } from "react-router-dom";

export default function Navbar() {
  // fake user for now (next step: Google login replaces this)
  const user = {
    name: "Guest User",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=guest",
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between p-4">
        <Link to="/" className="text-lg font-bold">
          Community Reporter
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/new"
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            New
          </Link>

          <Link to="/profile" className="flex items-center gap-2">
            <img
              src={user.avatar}
              alt="avatar"
              className="h-9 w-9 rounded-full border"
            />
            <span className="hidden text-sm font-semibold sm:inline">
              {user.name}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
