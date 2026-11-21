import { useEffect, useMemo, useRef, useState } from "react";
import {
  mockReports,
  mockUpdates,
  mockUsers,
  type Report,
  type ReportStatus,
  type Update,
  type User,
} from "../data/mockReports";
import {
  AppStateContext,
  cleanOptional,
  computeActivity,
  computeBadges,
  computePoints,
  createRateLimiter,
  formatDate,
  formatDateTime,
  nextId,
  type AppState,
  type CreateReportInput,
} from "./core";

/** Demo mode used when Firebase isn't configured: mock users + localStorage. */
const STORAGE_KEY = "community-reporter-state";

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

export function LocalAppStateProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(loadStoredState);
  const [user, setUser] = useState<User>(
    () => mockUsers.find((item) => item.id === initial?.userId) ?? mockUsers[0]
  );
  const [reports, setReports] = useState<Report[]>(initial?.reports ?? mockReports);
  const [updates, setUpdates] = useState<Update[]>(initial?.updates ?? mockUpdates);
  const rateLimit = useRef(createRateLimiter());

  const isAuthenticated = user.id !== "guest";

  useEffect(() => {
    try {
      const payload: StoredState = { reports, updates, userId: user.id };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // storage unavailable (private mode etc.) — keep working in memory
    }
  }, [reports, updates, user.id]);

  const follows = useMemo(
    () => new Set(reports.filter((r) => r.followers.includes(user.id)).map((r) => r.id)),
    [reports, user.id]
  );

  function mapReport(reportId: string, fn: (report: Report) => Report) {
    setReports((prev) => prev.map((report) => (report.id === reportId ? fn(report) : report)));
  }

  function addUpdate(reportId: string, text: string, type: Update["type"] = "comment") {
    const trimmed = text.trim();
    if (!trimmed) return { ok: false, message: "Please write a message before posting." };

    const report = reports.find((item) => item.id === reportId);
    if (report?.commentsLocked) return { ok: false, message: "Comments are locked for this report." };

    const limit = rateLimit.current();
    if (!limit.ok) return limit;

    const newUpdate: Update = {
      id: nextId("update"),
      reportId,
      userId: user.id,
      text: trimmed,
      createdAt: formatDateTime(),
      createdAtMs: Date.now(),
      type,
    };
    setUpdates((prev) => [newUpdate, ...prev]);
    return { ok: true };
  }

  function createReport(input: CreateReportInput) {
    const newReport: Report = {
      id: nextId("report"),
      title: input.title,
      description: input.description,
      category: input.category,
      status: "Open",
      createdAt: formatDate(),
      createdAtMs: Date.now(),
      creatorId: user.id,
      photoUrl: cleanOptional(input.photoUrl),
      location: cleanOptional(input.location),
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

  function addToList(field: "followers" | "flaggedBy" | "resolutionConfirmations") {
    return (reportId: string) =>
      mapReport(reportId, (report) =>
        report[field].includes(user.id) ? report : { ...report, [field]: [...report[field], user.id] }
      );
  }

  const value: AppState = {
    mode: "local",
    loading: false,
    error: null,
    clearError: () => {},
    user,
    isAuthenticated,
    signIn: () => setUser(mockUsers[1]),
    signOut: () => setUser(mockUsers[0]),
    reports,
    updates,
    points: computePoints(reports, updates, user.id),
    badges: computeBadges(reports, updates, user.id),
    activity: computeActivity(reports, updates, user.id),
    follows,
    isFollowing: (reportId) => follows.has(reportId),
    toggleFollow: (reportId) =>
      mapReport(reportId, (report) => ({
        ...report,
        followers: report.followers.includes(user.id)
          ? report.followers.filter((id) => id !== user.id)
          : [...report.followers, user.id],
      })),
    createReport,
    getReportUpdates: (reportId) => updates.filter((u) => u.reportId === reportId),
    addUpdate,
    changeStatus,
    confirmResolution: addToList("resolutionConfirmations"),
    flagReport: addToList("flaggedBy"),
    markDuplicate: (reportId, duplicateOfId) =>
      mapReport(reportId, (report) => ({ ...report, duplicateOf: duplicateOfId, status: "Closed" })),
    toggleHideReport: (reportId) =>
      mapReport(reportId, (report) => ({ ...report, hidden: !report.hidden })),
    toggleLockComments: (reportId) =>
      mapReport(reportId, (report) => ({ ...report, commentsLocked: !report.commentsLocked })),
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
