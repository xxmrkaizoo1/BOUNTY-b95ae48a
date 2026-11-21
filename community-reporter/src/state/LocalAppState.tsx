import { useEffect, useMemo, useRef, useState } from "react";
import { buildSampleData } from "../data/sampleData";
import {
  mockUsers,
  type Report,
  type ReportStatus,
  type Update,
  type User,
} from "../data/mockReports";
import {
  AppStateContext,
  canManageReport,
  cleanOptional,
  computeActivity,
  computeBadges,
  computePoints,
  createRateLimiter,
  fallbackAvatar,
  formatDate,
  formatDateTime,
  nextId,
  type AppState,
  type CreateReportInput,
} from "./core";

/** Demo mode used when Firebase isn't configured: mock users + localStorage. */
const STORAGE_KEY = "community-reporter-state-v2";

type StoredState = {
  reports: Report[];
  updates: Update[];
  userId: string;
};

function loadStoredState(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed || !Array.isArray(parsed.reports) || !Array.isArray(parsed.updates)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

const TOUR_KEY = "community-reporter-tour-done";

function loadToursDone(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TOUR_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function LocalAppStateProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(loadStoredState);
  const [user, setUser] = useState<User>(
    () => mockUsers.find((item) => item.id === initial?.userId) ?? mockUsers[0]
  );
  const [seed] = useState(() => buildSampleData());
  const [reports, setReports] = useState<Report[]>(initial?.reports ?? seed.reports);
  const [updates, setUpdates] = useState<Update[]>(initial?.updates ?? seed.updates);
  const [error, setError] = useState<string | null>(null);
  const [tourForced, setTourForced] = useState(false);
  const [toursDone, setToursDone] = useState<string[]>(loadToursDone);
  const rateLimit = useRef(createRateLimiter());

  const isAuthenticated = user.id !== "guest";

  useEffect(() => {
    try {
      const payload: StoredState = { reports, updates, userId: user.id };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      // storage unavailable or full (private mode, big photos) — keep working in memory
      console.warn("Couldn't save demo data", err);
    }
  }, [reports, updates, user.id]);

  const follows = useMemo(
    () => new Set(reports.filter((r) => r.followers.includes(user.id)).map((r) => r.id)),
    [reports, user.id]
  );

  function requireAuth() {
    if (isAuthenticated) return true;
    setError("Please sign in first.");
    return false;
  }

  function mapReport(reportId: string, fn: (report: Report) => Report) {
    if (!requireAuth()) return;
    setReports((prev) => prev.map((report) => (report.id === reportId ? fn(report) : report)));
  }

  function toggleIn(list: string[]) {
    return list.includes(user.id) ? list.filter((id) => id !== user.id) : [...list, user.id];
  }

  function addUpdate(reportId: string, text: string, type: Update["type"] = "comment") {
    if (!isAuthenticated) return { ok: false, message: "Sign in to post updates." };
    const trimmed = text.trim();
    if (!trimmed) return { ok: false, message: "Please write a message before posting." };

    const report = reports.find((item) => item.id === reportId);
    if (report?.commentsLocked && user.role !== "admin") {
      return { ok: false, message: "Comments are locked for this report." };
    }
    const finalType = type === "update" && report && canManageReport(user, report) ? "update" : "comment";

    const limit = rateLimit.current();
    if (!limit.ok) return limit;

    const newUpdate: Update = {
      id: nextId("update"),
      reportId,
      userId: user.id,
      text: trimmed,
      createdAt: formatDateTime(),
      createdAtMs: Date.now(),
      type: finalType,
    };
    setUpdates((prev) => [newUpdate, ...prev]);
    return { ok: true };
  }

  function createReport(input: CreateReportInput) {
    if (!requireAuth()) return null;
    const newReport: Report = {
      id: nextId("report"),
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      status: "Open",
      createdAt: formatDate(),
      createdAtMs: Date.now(),
      creatorId: user.id,
      photoUrl: cleanOptional(input.photoUrl),
      location: cleanOptional(input.location),
      coords: input.coords ?? undefined,
      followers: [user.id],
      flaggedBy: [],
      hidden: false,
      commentsLocked: false,
      resolutionConfirmations: [],
    };
    setReports((prev) => [newReport, ...prev]);
    return newReport;
  }

  function changeStatus(reportId: string, nextStatus: ReportStatus) {
    mapReport(reportId, (report) => ({ ...report, status: nextStatus }));
    addUpdate(reportId, `Status moved to ${nextStatus}.`, "update");
  }

  const value: AppState = {
    mode: "local",
    loading: false,
    error,
    clearError: () => setError(null),
    user,
    isAuthenticated,
    signIn: () => setUser(mockUsers[1]),
    signOut: () => setUser(mockUsers[0]),
    showTour: isAuthenticated && (tourForced || !toursDone.includes(user.id)),
    finishTour: () => {
      setTourForced(false);
      const next = toursDone.includes(user.id) ? toursDone : [...toursDone, user.id];
      setToursDone(next);
      try {
        window.localStorage.setItem(TOUR_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — tour may show again next visit
      }
    },
    startTour: () => setTourForced(true),
    demoUsers: mockUsers.filter((item) => item.id !== "guest"),
    switchDemoUser: (userId) => {
      const next = mockUsers.find((item) => item.id === userId);
      if (next) setUser(next);
    },
    getUser: (userId) =>
      mockUsers.find((item) => item.id === userId) ?? {
        id: userId,
        name: "Community member",
        avatar: fallbackAvatar(userId),
        role: "member",
      },
    reports,
    updates,
    points: computePoints(reports, updates, user.id),
    badges: computeBadges(reports, updates, user.id),
    activity: computeActivity(reports, updates, user.id),
    follows,
    isFollowing: (reportId) => follows.has(reportId),
    toggleFollow: (reportId) =>
      mapReport(reportId, (report) => ({ ...report, followers: toggleIn(report.followers) })),
    createReport,
    updateReport: (reportId, input) =>
      mapReport(reportId, (report) => ({
        ...report,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        photoUrl: cleanOptional(input.photoUrl),
        location: cleanOptional(input.location),
        coords: input.coords ?? undefined,
        updatedAtMs: Date.now(),
      })),
    deleteReport: (reportId) => {
      if (!requireAuth()) return;
      setReports((prev) => prev.filter((report) => report.id !== reportId));
      setUpdates((prev) => prev.filter((update) => update.reportId !== reportId));
    },
    getReportUpdates: (reportId) => updates.filter((u) => u.reportId === reportId),
    addUpdate,
    changeStatus,
    confirmResolution: (reportId) => {
      const report = reports.find((item) => item.id === reportId);
      if (report?.creatorId === user.id) {
        setError("You can't confirm your own report — ask a neighbour to check it.");
        return;
      }
      mapReport(reportId, (r) => ({
        ...r,
        resolutionConfirmations: toggleIn(r.resolutionConfirmations),
      }));
    },
    toggleFlag: (reportId) =>
      mapReport(reportId, (report) => ({ ...report, flaggedBy: toggleIn(report.flaggedBy) })),
    dismissFlags: (reportId) => mapReport(reportId, (report) => ({ ...report, flaggedBy: [] })),
    markDuplicate: (reportId, duplicateOfId) =>
      mapReport(reportId, (report) => ({ ...report, duplicateOf: duplicateOfId, status: "Closed" })),
    toggleHideReport: (reportId) =>
      mapReport(reportId, (report) => ({ ...report, hidden: !report.hidden })),
    toggleLockComments: (reportId) =>
      mapReport(reportId, (report) => ({ ...report, commentsLocked: !report.commentsLocked })),
    loadSampleData: async () => {
      const fresh = buildSampleData();
      setReports(fresh.reports);
      setUpdates(fresh.updates);
    },
    clearSampleData: async () => {
      setReports([]);
      setUpdates([]);
    },
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
