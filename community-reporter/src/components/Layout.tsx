import Navbar, { MobileTabBar } from "./Navbar";
import OnboardingTour from "./OnboardingTour";
import RewardToasts from "./RewardToasts";
import { useAppState } from "../state/AppState";

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-white/55">
      <span className="anim-bob text-4xl" aria-hidden>
        🛸
      </span>
      <span className="font-game text-base text-white/70">Loading the quest board…</span>
      <span className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
        <span className="anim-shine block h-full w-1/3 rounded-full bg-amber-400" />
      </span>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, error, clearError, mode, showTour } = useAppState();

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      {mode === "local" && (
        <div className="border-b border-amber-400/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200">
          🕹️ Demo mode — data stays in this browser. Add Firebase keys to <code>.env</code> for the
          shared database.
        </div>
      )}
      {error && (
        <div className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
          <div
            role="alert"
            className="flex items-start justify-between gap-4 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-400/40"
          >
            <span>⚠️ {error}</span>
            <button onClick={clearError} className="font-semibold hover:underline">
              Dismiss
            </button>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-16">
        {loading ? <PageSpinner /> : children}
      </main>
      <MobileTabBar />
      <RewardToasts />
      {showTour && !loading && <OnboardingTour />}
    </div>
  );
}
