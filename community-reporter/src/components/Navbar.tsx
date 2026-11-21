import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppState } from "../state/AppState";
import { buttonStyles } from "../lib/styles";
import { levelInfo } from "../state/core";
import { Avatar, GoogleIcon, LevelBadge, XpBar } from "./ui";

function desktopLink({ isActive }: { isActive: boolean }) {
  return `font-game rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-white/10 text-amber-300 ring-1 ring-white/10" : "text-white/70 hover:bg-white/5 hover:text-white"
  }`;
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-2xl border-b-4 border-violet-900 bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="font-game block text-base font-bold text-white">Community Reporter</span>
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/80 sm:block">
          Report · Follow · Fix
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, signIn, points } = useAppState();
  const { level } = levelInfo(points);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c0a24]/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={desktopLink}>
            🗺️ Quest board
          </NavLink>
          <NavLink to="/profile" className={desktopLink}>
            🎮 Player
          </NavLink>
          {user.role === "admin" && (
            <NavLink to="/admin" className={desktopLink}>
              🛡️ Moderator HQ
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:block">
            <Link to="/new" className={buttonStyles.primary}>
              <span aria-hidden>＋</span> New report
            </Link>
          </span>
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center gap-2.5 rounded-2xl bg-white/5 py-1 pl-1 pr-3 ring-1 ring-white/10 transition hover:bg-white/10"
              title={`${user.name} · Level ${level} · ${points} XP`}
            >
              <span className="relative">
                <Avatar src={user.avatar} name={user.name} seed={user.id} />
                <LevelBadge points={points} className="absolute -bottom-1 -right-1.5 h-5 min-w-5 text-[10px]" />
              </span>
              <span className="hidden w-24 sm:block">
                <span className="font-game block text-xs font-bold text-amber-300">⭐ {points} XP</span>
                <XpBar points={points} compact />
              </span>
            </Link>
          ) : (
            <button onClick={signIn} className={buttonStyles.secondary}>
              <GoogleIcon /> Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function tabClass(isActive: boolean) {
  return `font-game flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition ${
    isActive ? "text-amber-300" : "text-white/50"
  }`;
}

/** Bottom tab bar for phones (installed PWA feel). */
export function MobileTabBar() {
  const { user } = useAppState();
  const { pathname, search } = useLocation();
  const followingView = pathname === "/" && new URLSearchParams(search).has("following");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0c0a24]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
      <div className="mx-auto flex max-w-md items-end px-2">
        <Link to="/" className={tabClass(pathname === "/" && !followingView)}>
          <span className="text-xl" aria-hidden>🗺️</span>
          Quests
        </Link>
        <Link to="/?following=1" className={tabClass(followingView)}>
          <span className="text-xl" aria-hidden>🔔</span>
          Following
        </Link>
        <div className="flex flex-1 justify-center">
          <Link
            to="/new"
            aria-label="New report"
            className="anim-glow -mt-7 grid h-16 w-16 place-items-center rounded-full border-b-4 border-amber-700 bg-gradient-to-b from-amber-300 to-amber-500 text-4xl font-bold text-amber-950 shadow-lg shadow-amber-500/40 ring-4 ring-[#0c0a24]"
          >
            +
          </Link>
        </div>
        <Link to="/profile" className={tabClass(pathname === "/profile")}>
          <span className="text-xl" aria-hidden>🎮</span>
          Player
        </Link>
        {user.role === "admin" && (
          <Link to="/admin" className={tabClass(pathname === "/admin")}>
            <span className="text-xl" aria-hidden>🛡️</span>
            HQ
          </Link>
        )}
      </div>
    </nav>
  );
}
