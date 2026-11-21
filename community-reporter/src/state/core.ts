import { createContext } from "react";
import type { Coords, Report, ReportStatus, Update, User } from "../data/mockReports";

export const STATUS_FLOW: ReportStatus[] = ["Open", "Acknowledged", "In Progress", "Closed"];

/** Client-side limits (kept below the limits enforced in firestore.rules). */
export const LIMITS = { title: 120, description: 2000, comment: 1000, location: 160 };

export const GUEST_USER: User = {
  id: "guest",
  name: "Guest User",
  avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=guest",
  role: "member",
};

export function fallbackAvatar(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

export type ActivityItem = {
  id: string;
  label: string;
  createdAtMs: number;
  reportId?: string;
};

export type CreateReportInput = {
  title: string;
  description: string;
  category: Report["category"];
  photoUrl?: string;
  location?: string;
  coords?: Coords | null;
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
  /** Demo mode only: switch between mock users (e.g. to try the admin tools). */
  demoUsers?: User[];
  switchDemoUser?: (userId: string) => void;
  /** Welcome tour: shown automatically on a user's first sign-in. */
  showTour: boolean;
  /** Close the tour and remember it was seen. */
  finishTour: () => void;
  /** Open the tour again (e.g. from the profile page). */
  startTour: () => void;
  /** Public profiles, used to show who posted reports and comments. */
  getUser: (userId: string) => User;
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
  /** Creator or admin: edit the report's content. */
  updateReport: (reportId: string, input: CreateReportInput) => void;
  /** Creator or admin: permanently delete the report. */
  deleteReport: (reportId: string) => void;
  getReportUpdates: (reportId: string) => Update[];
  addUpdate: (reportId: string, text: string, type?: Update["type"]) => ActionResult;
  changeStatus: (reportId: string, nextStatus: ReportStatus) => void;
  confirmResolution: (reportId: string) => void;
  /** Flag a report for moderators, or remove your flag. */
  toggleFlag: (reportId: string) => void;
  /** Admin: clear all flags after review. */
  dismissFlags: (reportId: string) => void;
  markDuplicate: (reportId: string, duplicateOfId: string) => void;
  toggleHideReport: (reportId: string) => void;
  toggleLockComments: (reportId: string) => void;
  /** Admin: add the sample neighbourhood dataset (demo mode: reset to it). */
  loadSampleData: () => Promise<void>;
  /** Admin: remove all sample reports and their updates. */
  clearSampleData: () => Promise<void>;
};

export const AppStateContext = createContext<AppState | null>(null);

export function formatDate(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

export function formatDateTime(value = new Date()) {
  return value.toISOString().replace("T", " ").slice(0, 16);
}

/** Milliseconds for a report, falling back to the legacy date string. */
export function reportTimeMs(report: Pick<Report, "createdAt" | "createdAtMs">) {
  return report.createdAtMs ?? Date.parse(report.createdAt);
}

/** Milliseconds for an update; legacy strings are "YYYY-MM-DD HH:mm" in UTC. */
export function updateTimeMs(update: Pick<Update, "createdAt" | "createdAtMs">) {
  return update.createdAtMs ?? Date.parse(`${update.createdAt.replace(" ", "T")}Z`);
}

export function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function cleanOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function canManageReport(user: User, report: Report) {
  return user.role === "admin" || user.id === report.creatorId;
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

/** Confirmations from people other than the reporter. */
export function communityConfirmations(report: Report) {
  return report.resolutionConfirmations.filter((id) => id !== report.creatorId).length;
}

export const RESOLVED_CONFIRMATIONS = 2;

export function computeStats(reports: Report[], updates: Update[], userId: string) {
  const userReports = reports.filter((report) => report.creatorId === userId);
  return {
    reports: userReports.length,
    comments: updates.filter((update) => update.userId === userId).length,
    confirmations: reports.filter((report) => report.resolutionConfirmations.includes(userId))
      .length,
    resolved: userReports.filter(
      (report) => communityConfirmations(report) >= RESOLVED_CONFIRMATIONS
    ).length,
  };
}

export const POINTS_PER_LEVEL = 50;

/** Level from points: every 50 XP is a new level. */
export function levelInfo(points: number) {
  return {
    level: Math.floor(points / POINTS_PER_LEVEL) + 1,
    into: points % POINTS_PER_LEVEL,
    needed: POINTS_PER_LEVEL,
  };
}

/** Rank title shown next to a player's name. */
export function rankTitle(level: number) {
  if (level >= 10) return "Legend";
  if (level >= 7) return "Guardian";
  if (level >= 5) return "Hero";
  if (level >= 3) return "Scout";
  return "Rookie";
}

export function computePoints(reports: Report[], updates: Update[], userId: string) {
  const stats = computeStats(reports, updates, userId);
  return stats.reports * 10 + stats.comments * 2 + stats.confirmations * 5 + stats.resolved * 20;
}

export const BADGES = [
  { name: "First Report", icon: "📝", goal: 1, detail: "Submit your first community report." },
  { name: "Helper", icon: "🤝", goal: 5, detail: "Post 5 updates or comments." },
  { name: "Resolver", icon: "🏅", goal: 2, detail: "2 of your reports confirmed fixed by neighbours." },
] as const;

export function badgeProgress(reports: Report[], updates: Update[], userId: string) {
  const stats = computeStats(reports, updates, userId);
  const values = [stats.reports, stats.comments, stats.resolved];
  return BADGES.map((badge, index) => ({
    ...badge,
    value: Math.min(values[index], badge.goal),
    earned: values[index] >= badge.goal,
  }));
}

export function computeBadges(reports: Report[], updates: Update[], userId: string) {
  return badgeProgress(reports, updates, userId)
    .filter((badge) => badge.earned)
    .map((badge) => badge.name);
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
        label: `Reported “${report.title}”`,
        createdAtMs: reportTimeMs(report),
        reportId: report.id,
      });
    });

  updates
    .filter((update) => update.userId === userId)
    .forEach((update) => {
      const reportTitle = reports.find((report) => report.id === update.reportId)?.title;
      const actionLabel = update.type === "update" ? "Posted an update" : "Commented";
      items.push({
        id: `activity-${update.id}`,
        label: `${actionLabel}${reportTitle ? ` on “${reportTitle}”` : ""}`,
        createdAtMs: updateTimeMs(update),
        reportId: update.reportId,
      });
    });

  return items.sort((a, b) => b.createdAtMs - a.createdAtMs).slice(0, 8);
}
