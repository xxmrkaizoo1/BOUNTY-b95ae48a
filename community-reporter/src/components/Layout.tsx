import Navbar from "./Navbar";
import { useAppState } from "../state/AppState";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, error, clearError, mode } = useAppState();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {mode === "local" && (
        <div className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
          Demo mode: data is stored in this browser only. Add Firebase keys to <code>.env</code> to
          use the shared database.
        </div>
      )}
      {error && (
        <div className="mx-auto mt-4 flex max-w-5xl items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{error}</span>
          <button onClick={clearError} className="font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}
      <main>
        {loading ? (
          <p className="p-10 text-center text-sm text-gray-500">Loading community reports…</p>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
