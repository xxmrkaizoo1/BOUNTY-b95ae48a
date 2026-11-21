import { createContext } from "react";
import type { Report, ReportStatus, Update, User } from "../data/mockReports";

export const STATUS_FLOW: ReportStatus[] = ["Open", "Acknowledged", "In Progress", "Closed"];

export const GUEST_USER: User = {
  id: "guest",
  name: "Guest User",
  avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=guest",
  role: "member",
};

export type ActivityItem = {
  id: string;
  label: string;
  createdAt: string;
  reportId?: string;
};

export type CreateReportInput = {
  title: string;
  description: string;
  category: Report["category"];
  photoUrl?: string;
  location?: string;
};

export type ActionResult = { ok: boolean; message?: string };

export type AppState = {
  /** "firebase" when backed by Firestore, "local" when using the in-browser demo store. */
  mode: "firebase" | "local";
  /** True until the first auth + data load has finished. */
  loading: boolean;
  /** Last error from the backend (e.g. permission denied), shown as a banner. */
  error: string | null;
  clearError: () => void;
  user: User;
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
  reports: Report[];
  updates: Update[];
  points: number;
  badges: string[];
  activity: ActivityItem[];
  follows: Set<string>; // reportIds
  isFollowing: (reportId: string) => boolean;
  toggleFollow: (reportId: string) => void;
  /** Returns null when the report could not be created (e.g. not signed in). */
  createReport: (input: CreateReportInput) => Report | null;
  getReportUpdates: (reportId: string) => Update[];
  addUpdate: (reportId: string, text: string, type?: Update["type"]) => ActionResult;
  changeStatus: (reportId: string, nextStatus: ReportStatus) => void;
  confirmResolution: (reportId: string) => void;
  flagReport: (reportId: string) => void;
  markDuplicate: (reportId: string, duplicateOfId: string) => void;
  toggleHideReport: (reportId: string) => void;
  toggleLockComments: (reportId: string) => void;
};

export const AppStateContext = createContext<AppState | null>(null);

export function formatDate(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

export function formatDateTime(value = new Date()) {
  return value.toISOString().replace("T", " ").slice(0, 16);
}

export function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function cleanOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Simple client-side rate limit: max 5 posts within 30s bursts. */
export function createRateLimiter() {
  let lastAt = 0;
  let rapidCount = 0;
  return function check(): ActionResult {
    const now = Date.now();
    if (now - lastAt < 30000) {
      if (rapidCount + 1 > 4) {
        return { ok: false, message: "Slow down a bit — too many posts in a row." };
      }
      rapidCount += 1;
    } else {
      rapidCount = 0;
    }
    lastAt = now;
    return { ok: true };
  };
}

export function computePoints(reports: Report[], updates: Update[], userId: string) {
  const userReports = reports.filter((report) => report.creatorId === userId);
  const userUpdates = updates.filter((update) => update.userId === userId);
  const confirmations = reports.filter((report) =>
    report.resolutionConfirmations.includes(userId)
  );
  const resolvedByUser = userReports.filter(
    (report) => report.resolutionConfirmations.length >= 2
  );
  return (
    userReports.length * 10 +
    userUpdates.length * 2 +
    confirmations.length * 5 +
    resolvedByUser.length * 20
  );
}

export function computeBadges(reports: Report[], updates: Update[], userId: string) {
  const userReports = reports.filter((report) => report.creatorId === userId);
  const userUpdates = updates.filter((update) => update.userId === userId);
  const resolvedByUser = userReports.filter(
    (report) => report.resolutionConfirmations.length >= 2
  );

  const earned: string[] = [];
  if (userReports.length >= 1) earned.push("First Report");
  if (userUpdates.length >= 5) earned.push("Helper");
  if (resolvedByUser.length >= 2) earned.push("Resolver");
  return earned;
}

export function computeActivity(
  reports: Report[],
  updates: Update[],
  userId: string
): ActivityItem[] {
  const items: ActivityItem[] = [];
  reports
    .filter((report) => report.creatorId === userId)
    .forEach((report) => {
      items.push({
        id: `activity-${report.id}`,
        label: `Created report: ${report.title}`,
        createdAt: report.createdAt,
        reportId: report.id,
      });
    });

  updates
    .filter((update) => update.userId === userId)
    .forEach((update) => {
      const reportTitle = reports.find((report) => report.id === update.reportId)?.title;
      const actionLabel = update.type === "update" ? "Posted update" : "Commented";
      items.push({
        id: `activity-${update.id}`,
        label: `${actionLabel}${reportTitle ? ` on ${reportTitle}` : ""}`,
        createdAt: update.createdAt,
        reportId: update.reportId,
      });
    });

  reports.forEach((report) => {
    if (report.resolutionConfirmations.includes(userId)) {
      items.push({
        id: `activity-confirm-${report.id}`,
        label: `Confirmed resolution for ${report.title}`,
        createdAt: report.createdAt,
        reportId: report.id,
      });
    }
  });

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
}
