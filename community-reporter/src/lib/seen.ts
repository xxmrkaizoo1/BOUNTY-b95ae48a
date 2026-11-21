/** Remembers (per browser) when the user last opened each report, to show "new" badges. */
const KEY = "community-reporter-last-seen";

function readAll(): Record<string, number> {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

export function getLastSeen(reportId: string) {
  return readAll()[reportId] ?? 0;
}

export function markSeen(reportId: string) {
  try {
    const all = readAll();
    all[reportId] = Date.now();
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage unavailable — badges just won't persist
  }
}
