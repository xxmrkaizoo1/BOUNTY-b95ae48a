import { createContext, useContext, useMemo, useState } from "react";
import {
  mockReports,
  mockUpdates,
  mockUsers,
  type Report,
  type ReportStatus,
  type Update,
  type User,
} from "../data/mockReports";

const STATUS_FLOW: ReportStatus[] = ["Open", "Acknowledged", "In Progress", "Closed"];

type ActivityItem = {
  id: string;
  label: string;
  createdAt: string;
  reportId?: string;
};

type CreateReportInput = {
  title: string;
  description: string;
  category: Report["category"];
  photoUrl?: string;
  location?: string;
};

type AppState = {
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
  createReport: (input: CreateReportInput) => Report;
  getReportUpdates: (reportId: string) => Update[];
  addUpdate: (reportId: string, text: string, type?: Update["type"]) => {
    ok: boolean;
    message?: string;
  };
  changeStatus: (reportId: string, nextStatus: ReportStatus) => void;
  confirmResolution: (reportId: string) => void;
  flagReport: (reportId: string) => void;
  markDuplicate: (reportId: string, duplicateOfId: string) => void;
  toggleHideReport: (reportId: string) => void;
  toggleLockComments: (reportId: string) => void;
};

const Ctx = createContext<AppState | null>(null);

function formatDate(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

function formatDateTime(value = new Date()) {
  return value.toISOString().replace("T", " ").slice(0, 16);
}

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(mockUsers[0]);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [updates, setUpdates] = useState<Update[]>(mockUpdates);
  const [follows, setFollows] = useState<Set<string>>(
    new Set(mockReports.filter((report) => report.followers.includes(user.id)).map((r) => r.id))
  );
  const [lastUpdateAt, setLastUpdateAt] = useState<number>(0);
  const [rapidCount, setRapidCount] = useState<number>(0);

  const isAuthenticated = user.id !== "guest";

  function signIn() {
    const nextUser = mockUsers[1];
    setUser(nextUser);
    setFollows(
      new Set(reports.filter((report) => report.followers.includes(nextUser.id)).map((r) => r.id))
    );
  }

  function signOut() {
    const nextUser = mockUsers[0];
    setUser(nextUser);
    setFollows(
      new Set(reports.filter((report) => report.followers.includes(nextUser.id)).map((r) => r.id))
    );
  }

  function isFollowing(reportId: string) {
    return follows.has(reportId);
  }

  function toggleFollow(reportId: string) {
    setFollows((prev) => {
      const next = new Set(prev);
      const isNowFollowing = !next.has(reportId);
      if (next.has(reportId)) next.delete(reportId);
      else next.add(reportId);
      setReports((prevReports) =>
        prevReports.map((report) => {
          if (report.id !== reportId) return report;
          const followerSet = new Set(report.followers);
          if (isNowFollowing) followerSet.add(user.id);
          else followerSet.delete(user.id);
          return { ...report, followers: Array.from(followerSet) };
        })
      );
      return next;
    });
  }

  function createReport(input: CreateReportInput) {
    const newReport: Report = {
      id: nextId("report"),
      title: input.title,
      description: input.description,
      category: input.category,
      status: "Open",
      createdAt: formatDate(),
      creatorId: user.id,
      photoUrl: input.photoUrl?.trim() ? input.photoUrl.trim() : undefined,
      location: input.location?.trim() ? input.location.trim() : undefined,
      followers: [user.id],
      flaggedBy: [],
      hidden: false,
      commentsLocked: false,
      resolutionConfirmations: [],
    };

    setReports((prev) => [newReport, ...prev]);
    setFollows((prev) => {
      const next = new Set(prev);
      next.add(newReport.id);
      return next;
    });

    return newReport;
  }

  function getReportUpdates(reportId: string) {
    return updates.filter((update) => update.reportId === reportId);
  }

  function addUpdate(reportId: string, text: string, type: Update["type"] = "comment") {
    const trimmed = text.trim();
    if (!trimmed) {
      return { ok: false, message: "Please write a message before posting." };
    }

    const report = reports.find((item) => item.id === reportId);
    if (report?.commentsLocked) {
      return { ok: false, message: "Comments are locked for this report." };
    }

    const now = Date.now();
    if (now - lastUpdateAt < 30000) {
      const nextCount = rapidCount + 1;
      if (nextCount > 4) {
        return { ok: false, message: "Slow down a bit — too many posts in a row." };
      }
      setRapidCount(nextCount);
    } else {
      setRapidCount(0);
    }
    setLastUpdateAt(now);

    const newUpdate: Update = {
      id: nextId("update"),
      reportId,
      userId: user.id,
      text: trimmed,
      createdAt: formatDateTime(),
      type,
    };

    setUpdates((prev) => [newUpdate, ...prev]);
    return { ok: true };
  }

  function changeStatus(reportId: string, nextStatus: ReportStatus) {
    setReports((prev) =>
      prev.map((report) => {
        if (report.id !== reportId) return report;
        const updated = { ...report, status: nextStatus };
        return updated;
      })
    );

    addUpdate(reportId, `Status moved to ${nextStatus}.`, "update");
  }

  function confirmResolution(reportId: string) {
    setReports((prev) =>
      prev.map((report) => {
        if (report.id !== reportId) return report;
        if (report.resolutionConfirmations.includes(user.id)) return report;
        return {
          ...report,
          resolutionConfirmations: [...report.resolutionConfirmations, user.id],
        };
      })
    );
  }

  function flagReport(reportId: string) {
    setReports((prev) =>
      prev.map((report) => {
        if (report.id !== reportId) return report;
        if (report.flaggedBy.includes(user.id)) return report;
        return { ...report, flaggedBy: [...report.flaggedBy, user.id] };
      })
    );
  }

  function markDuplicate(reportId: string, duplicateOfId: string) {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, duplicateOf: duplicateOfId, status: "Closed" }
          : report
      )
    );
  }

  function toggleHideReport(reportId: string) {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, hidden: !report.hidden } : report
      )
    );
  }

  function toggleLockComments(reportId: string) {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, commentsLocked: !report.commentsLocked }
          : report
      )
    );
  }

  const points = useMemo(() => {
    const userReports = reports.filter((report) => report.creatorId === user.id);
    const userUpdates = updates.filter((update) => update.userId === user.id);
    const confirmations = reports.filter((report) =>
      report.resolutionConfirmations.includes(user.id)
    );
    const resolvedByUser = reports.filter(
      (report) =>
        report.creatorId === user.id && report.resolutionConfirmations.length >= 2
    );

    return (
      userReports.length * 10 +
      userUpdates.length * 2 +
      confirmations.length * 5 +
      resolvedByUser.length * 20
    );
  }, [reports, updates, user.id]);

  const badges = useMemo(() => {
    const userReports = reports.filter((report) => report.creatorId === user.id);
    const userUpdates = updates.filter((update) => update.userId === user.id);
    const resolvedByUser = reports.filter(
      (report) =>
        report.creatorId === user.id && report.resolutionConfirmations.length >= 2
    );

    const earned: string[] = [];
    if (userReports.length >= 1) earned.push("First Report");
    if (userUpdates.length >= 5) earned.push("Helper");
    if (resolvedByUser.length >= 2) earned.push("Resolver");
    return earned;
  }, [reports, updates, user.id]);

  const activity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];
    reports
      .filter((report) => report.creatorId === user.id)
      .forEach((report) => {
        items.push({
          id: `activity-${report.id}`,
          label: `Created report: ${report.title}`,
          createdAt: report.createdAt,
          reportId: report.id,
        });
      });

    updates
      .filter((update) => update.userId === user.id)
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
      if (report.resolutionConfirmations.includes(user.id)) {
        items.push({
          id: `activity-confirm-${report.id}`,
          label: `Confirmed resolution for ${report.title}`,
          createdAt: report.createdAt,
          reportId: report.id,
        });
      }
    });

    return items
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6);
  }, [reports, updates, user.id]);

  const value: AppState = {
    user,
    isAuthenticated,
    signIn,
    signOut,
    reports,
    updates,
    points,
    badges,
    activity,
    follows,
    isFollowing,
    toggleFollow,
    createReport,
    getReportUpdates,
    addUpdate,
    changeStatus,
    confirmResolution,
    flagReport,
    markDuplicate,
    toggleHideReport,
    toggleLockComments,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used inside AppStateProvider");
  return v;
}

export const statusFlow = STATUS_FLOW;
