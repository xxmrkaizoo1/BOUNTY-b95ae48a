import { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebase } from "../lib/firebase";
import type { Report, ReportStatus, Update, User } from "../data/mockReports";
import {
  AppStateContext,
  GUEST_USER,
  cleanOptional,
  computeActivity,
  computeBadges,
  computePoints,
  createRateLimiter,
  formatDate,
  formatDateTime,
  type AppState,
  type CreateReportInput,
} from "./core";

function describeError(err: unknown) {
  const code = (err as { code?: string })?.code;
  if (code === "permission-denied") return "You don't have permission to do that.";
  if (code === "auth/popup-closed-by-user") return null;
  if (code === "auth/unauthorized-domain") {
    return "This domain is not authorized for sign-in. Add it in Firebase Console → Authentication → Settings.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

export function FirebaseAppStateProvider({ children }: { children: React.ReactNode }) {
  const { auth, db } = getFirebase();

  const [user, setUser] = useState<User>(GUEST_USER);
  const [authReady, setAuthReady] = useState(false);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [updates, setUpdates] = useState<Update[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rateLimit = useRef(createRateLimiter());

  function fail(err: unknown) {
    console.error(err);
    const message = describeError(err);
    if (message) setError(message);
  }

  // Auth: track the signed-in user and make sure they have a profile doc in `users/{uid}`.
  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(GUEST_USER);
        setAuthReady(true);
        return;
      }
      const profile = {
        name: fbUser.displayName || fbUser.email || "Community member",
        avatar:
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(fbUser.uid)}`,
      };
      let role: User["role"] = "member";
      try {
        const ref = doc(db, "users", fbUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          role = snap.data().role === "admin" ? "admin" : "member";
          await updateDoc(ref, profile);
        } else {
          await setDoc(ref, { ...profile, role: "member" });
        }
      } catch (err) {
        fail(err);
      }
      setUser({ id: fbUser.uid, ...profile, role });
      setAuthReady(true);
    });
  }, [auth, db]);

  // Live data: reports and updates are public and streamed in real time.
  useEffect(() => {
    const unsubReports = onSnapshot(
      query(collection(db, "reports"), orderBy("createdAtMs", "desc")),
      (snap) => setReports(snap.docs.map((d) => ({ ...(d.data() as Omit<Report, "id">), id: d.id }))),
      (err) => {
        fail(err);
        setReports([]);
      }
    );
    const unsubUpdates = onSnapshot(
      query(collection(db, "updates"), orderBy("createdAtMs", "desc")),
      (snap) => setUpdates(snap.docs.map((d) => ({ ...(d.data() as Omit<Update, "id">), id: d.id }))),
      (err) => {
        fail(err);
        setUpdates([]);
      }
    );
    return () => {
      unsubReports();
      unsubUpdates();
    };
  }, [db]);

  const allReports = useMemo(() => reports ?? [], [reports]);
  const allUpdates = useMemo(() => updates ?? [], [updates]);
  const isAuthenticated = user.id !== GUEST_USER.id;

  const follows = useMemo(
    () => new Set(allReports.filter((r) => r.followers.includes(user.id)).map((r) => r.id)),
    [allReports, user.id]
  );

  function requireAuth() {
    if (isAuthenticated) return true;
    setError("Please sign in with Google first.");
    return false;
  }

  function patchReport(reportId: string, data: Record<string, unknown>) {
    updateDoc(doc(db, "reports", reportId), data).catch(fail);
  }

  function addUpdate(reportId: string, text: string, type: Update["type"] = "comment") {
    if (!isAuthenticated) return { ok: false, message: "Sign in to post updates." };
    const trimmed = text.trim();
    if (!trimmed) return { ok: false, message: "Please write a message before posting." };

    const report = allReports.find((item) => item.id === reportId);
    if (report?.commentsLocked && user.role !== "admin") {
      return { ok: false, message: "Comments are locked for this report." };
    }

    const limit = rateLimit.current();
    if (!limit.ok) return limit;

    const ref = doc(collection(db, "updates"));
    const data: Omit<Update, "id"> = {
      reportId,
      userId: user.id,
      text: trimmed,
      createdAt: formatDateTime(),
      createdAtMs: Date.now(),
      type,
    };
    setDoc(ref, data).catch(fail);
    return { ok: true };
  }

  function createReport(input: CreateReportInput) {
    if (!requireAuth()) return null;
    const ref = doc(collection(db, "reports"));
    const data: Omit<Report, "id"> = {
      title: input.title.trim(),
      description: input.description.trim(),
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
    // Firestore applies the write to the local cache immediately, so the
    // detail page can render it before the server acknowledges.
    setDoc(ref, data).catch(fail);
    return { ...data, id: ref.id };
  }

  function changeStatus(reportId: string, nextStatus: ReportStatus) {
    if (!requireAuth()) return;
    patchReport(reportId, { status: nextStatus });
    addUpdate(reportId, `Status moved to ${nextStatus}.`, "update");
  }

  function toggleFollow(reportId: string) {
    if (!requireAuth()) return;
    patchReport(reportId, {
      followers: follows.has(reportId) ? arrayRemove(user.id) : arrayUnion(user.id),
    });
  }

  function findReport(reportId: string) {
    return allReports.find((r) => r.id === reportId);
  }

  const value: AppState = {
    mode: "firebase",
    loading: !authReady || reports === null || updates === null,
    error,
    clearError: () => setError(null),
    user,
    isAuthenticated,
    signIn: () => {
      signInWithPopup(auth, new GoogleAuthProvider()).catch(fail);
    },
    signOut: () => {
      firebaseSignOut(auth).catch(fail);
    },
    reports: allReports,
    updates: allUpdates,
    points: computePoints(allReports, allUpdates, user.id),
    badges: computeBadges(allReports, allUpdates, user.id),
    activity: computeActivity(allReports, allUpdates, user.id),
    follows,
    isFollowing: (reportId) => follows.has(reportId),
    toggleFollow,
    createReport,
    getReportUpdates: (reportId) => allUpdates.filter((u) => u.reportId === reportId),
    addUpdate,
    changeStatus,
    confirmResolution: (reportId) => {
      if (requireAuth()) patchReport(reportId, { resolutionConfirmations: arrayUnion(user.id) });
    },
    flagReport: (reportId) => {
      if (requireAuth()) patchReport(reportId, { flaggedBy: arrayUnion(user.id) });
    },
    markDuplicate: (reportId, duplicateOfId) => {
      if (requireAuth()) patchReport(reportId, { duplicateOf: duplicateOfId, status: "Closed" });
    },
    toggleHideReport: (reportId) => {
      const report = findReport(reportId);
      if (report && requireAuth()) patchReport(reportId, { hidden: !report.hidden });
    },
    toggleLockComments: (reportId) => {
      const report = findReport(reportId);
      if (report && requireAuth()) patchReport(reportId, { commentsLocked: !report.commentsLocked });
    },
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
