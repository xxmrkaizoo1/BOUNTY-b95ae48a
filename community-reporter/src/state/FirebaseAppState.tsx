import { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { SAMPLE_HOUR, SAMPLE_REPORTS, sampleDate, sampleDateTime } from "../data/sampleData";
import { getFirebase } from "../lib/firebase";
import type { Report, ReportStatus, Update, User } from "../data/mockReports";
import {
  AppStateContext,
  GUEST_USER,
  canManageReport,
  cleanOptional,
  computeActivity,
  computeBadges,
  computePoints,
  createRateLimiter,
  fallbackAvatar,
  formatDate,
  formatDateTime,
  reportTimeMs,
  type AppState,
  type CreateReportInput,
} from "./core";

function describeError(err: unknown) {
  const code = (err as { code?: string })?.code;
  if (code === "permission-denied") return "You don't have permission to do that.";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return null;
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
  const [users, setUsers] = useState<Record<string, User>>({});
  const [error, setError] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
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
        setShowTour(false);
        setAuthReady(true);
        return;
      }
      const profile = {
        name: fbUser.displayName || fbUser.email || "Community member",
        avatar: fbUser.photoURL || fallbackAvatar(fbUser.uid),
      };
      let role: User["role"] = "member";
      try {
        const ref = doc(db, "users", fbUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          role = snap.data().role === "admin" ? "admin" : "member";
          // First sign-in on this account (or never finished the tour) → show the welcome tour.
          setShowTour(!snap.data().onboardedAt);
          await updateDoc(ref, profile);
        } else {
          setShowTour(true);
          await setDoc(ref, { ...profile, role: "member" });
        }
      } catch (err) {
        fail(err);
      }
      setUser({ id: fbUser.uid, ...profile, role });
      setAuthReady(true);
    });
  }, [auth, db]);

  const isAdmin = user.role === "admin";

  // Reports: admins see everything; everyone else only gets reports that aren't hidden
  // (enforced by firestore.rules, so hidden reports never leave the server).
  useEffect(() => {
    if (!authReady) return;
    const source = isAdmin
      ? collection(db, "reports")
      : query(collection(db, "reports"), where("hidden", "==", false));
    return onSnapshot(
      source,
      (snap) => {
        const list = snap.docs.map((d) => ({ ...(d.data() as Omit<Report, "id">), id: d.id }));
        list.sort((a, b) => reportTimeMs(b) - reportTimeMs(a));
        setReports(list);
      },
      (err) => {
        fail(err);
        setReports([]);
      }
    );
  }, [db, authReady, isAdmin]);

  // Updates and public profiles stream in real time.
  useEffect(() => {
    const unsubUpdates = onSnapshot(
      query(collection(db, "updates"), orderBy("createdAtMs", "desc")),
      (snap) => setUpdates(snap.docs.map((d) => ({ ...(d.data() as Omit<Update, "id">), id: d.id }))),
      (err) => {
        fail(err);
        setUpdates([]);
      }
    );
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const map: Record<string, User> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          map[d.id] = {
            id: d.id,
            name: data.name ?? "Community member",
            avatar: data.avatar ?? fallbackAvatar(d.id),
            role: data.role === "admin" ? "admin" : "member",
          };
        });
        setUsers(map);
      },
      fail
    );
    return () => {
      unsubUpdates();
      unsubUsers();
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

  function findReport(reportId: string) {
    return allReports.find((r) => r.id === reportId);
  }

  function patchReport(reportId: string, data: Record<string, unknown>) {
    updateDoc(doc(db, "reports", reportId), data).catch(fail);
  }

  function addUpdate(reportId: string, text: string, type: Update["type"] = "comment") {
    if (!isAuthenticated) return { ok: false, message: "Sign in to post updates." };
    const trimmed = text.trim();
    if (!trimmed) return { ok: false, message: "Please write a message before posting." };

    const report = findReport(reportId);
    if (report?.commentsLocked && !isAdmin) {
      return { ok: false, message: "Comments are locked for this report." };
    }
    // Only the reporter and admins can post official updates.
    const finalType = type === "update" && report && canManageReport(user, report) ? "update" : "comment";

    const limit = rateLimit.current();
    if (!limit.ok) return limit;

    const data: Omit<Update, "id"> = {
      reportId,
      userId: user.id,
      text: trimmed,
      createdAt: formatDateTime(),
      createdAtMs: Date.now(),
      type: finalType,
    };
    setDoc(doc(collection(db, "updates")), data).catch(fail);
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
      coords: input.coords ?? undefined,
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

  function updateReport(reportId: string, input: CreateReportInput) {
    if (!requireAuth()) return;
    patchReport(reportId, {
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      photoUrl: cleanOptional(input.photoUrl) ?? deleteField(),
      location: cleanOptional(input.location) ?? deleteField(),
      coords: input.coords ?? deleteField(),
      updatedAtMs: Date.now(),
    });
  }

  function changeStatus(reportId: string, nextStatus: ReportStatus) {
    if (!requireAuth()) return;
    patchReport(reportId, { status: nextStatus });
    addUpdate(reportId, `Status moved to ${nextStatus}.`, "update");
  }

  /**
   * Admin: write the sample dataset to Firestore. Everything is created by the
   * admin (rules only allow creating your own reports) and tagged `sample: true`.
   */
  async function loadSampleData() {
    if (!isAdmin) {
      setError("Only admins can load sample data.");
      return;
    }
    try {
      const now = Date.now();
      const refs = SAMPLE_REPORTS.map(() => doc(collection(db, "reports")));
      const idByKey = new Map(SAMPLE_REPORTS.map((s, i) => [s.key, refs[i].id]));

      // Pass 1: create (rules require new reports to start Open and unflagged).
      const create = writeBatch(db);
      SAMPLE_REPORTS.forEach((s, i) => {
        const ms = now - s.hoursAgo * SAMPLE_HOUR;
        create.set(refs[i], {
          title: s.title,
          description: s.description,
          category: s.category,
          status: "Open",
          createdAt: sampleDate(ms),
          createdAtMs: ms,
          creatorId: user.id,
          ...(s.photoUrl ? { photoUrl: s.photoUrl } : {}),
          location: s.location,
          ...(s.coords ? { coords: s.coords } : {}),
          followers: [user.id],
          flaggedBy: [],
          hidden: false,
          commentsLocked: false,
          resolutionConfirmations: [],
          sample: true,
        });
      });
      await create.commit();

      // Pass 2: move to their real status, link duplicates, add progress updates.
      const progress = writeBatch(db);
      SAMPLE_REPORTS.forEach((s, i) => {
        const patch: Record<string, unknown> = {};
        if (s.status !== "Open") patch.status = s.status;
        if (s.duplicateOfKey) patch.duplicateOf = idByKey.get(s.duplicateOfKey);
        if (Object.keys(patch).length) progress.update(refs[i], patch);
        s.comments
          .filter((c) => c.type === "update")
          .forEach((c) => {
            const ms = now - c.hoursAgo * SAMPLE_HOUR;
            progress.set(doc(collection(db, "updates")), {
              reportId: refs[i].id,
              userId: user.id,
              text: c.text,
              type: "update",
              createdAt: sampleDateTime(ms),
              createdAtMs: ms,
              sample: true,
            });
          });
      });
      await progress.commit();
    } catch (err) {
      fail(err);
    }
  }

  /** Admin: delete every report and update tagged `sample: true`. */
  async function clearSampleData() {
    if (!isAdmin) return;
    try {
      const [reportSnap, updateSnap] = await Promise.all([
        getDocs(query(collection(db, "reports"), where("sample", "==", true))),
        getDocs(query(collection(db, "updates"), where("sample", "==", true))),
      ]);
      const docs = [...reportSnap.docs, ...updateSnap.docs];
      for (let i = 0; i < docs.length; i += 400) {
        const batch = writeBatch(db);
        docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (err) {
      fail(err);
    }
  }

  function signIn() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((err) => {
      const code = (err as { code?: string })?.code;
      // Popups are often blocked on phones / installed PWAs — fall back to a full-page redirect.
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        signInWithRedirect(auth, provider).catch(fail);
      } else {
        fail(err);
      }
    });
  }

  const value: AppState = {
    mode: "firebase",
    loading: !authReady || reports === null || updates === null,
    error,
    clearError: () => setError(null),
    user,
    isAuthenticated,
    signIn,
    signOut: () => {
      firebaseSignOut(auth).catch(fail);
    },
    showTour,
    finishTour: () => {
      setShowTour(false);
      if (isAuthenticated) {
        // Saved on the profile so the tour doesn't reappear on other devices.
        updateDoc(doc(db, "users", user.id), { onboardedAt: Date.now() }).catch(fail);
      }
    },
    startTour: () => setShowTour(true),
    getUser: (userId) =>
      users[userId] ??
      (userId === user.id
        ? user
        : { id: userId, name: "Community member", avatar: fallbackAvatar(userId), role: "member" }),
    reports: allReports,
    updates: allUpdates,
    points: computePoints(allReports, allUpdates, user.id),
    badges: computeBadges(allReports, allUpdates, user.id),
    activity: computeActivity(allReports, allUpdates, user.id),
    follows,
    isFollowing: (reportId) => follows.has(reportId),
    toggleFollow: (reportId) => {
      if (!requireAuth()) return;
      patchReport(reportId, {
        followers: follows.has(reportId) ? arrayRemove(user.id) : arrayUnion(user.id),
      });
    },
    createReport,
    updateReport,
    deleteReport: (reportId) => {
      if (requireAuth()) deleteDoc(doc(db, "reports", reportId)).catch(fail);
    },
    getReportUpdates: (reportId) => allUpdates.filter((u) => u.reportId === reportId),
    addUpdate,
    changeStatus,
    confirmResolution: (reportId) => {
      const report = findReport(reportId);
      if (!report || !requireAuth()) return;
      if (report.creatorId === user.id) {
        setError("You can't confirm your own report — ask a neighbour to check it.");
        return;
      }
      patchReport(reportId, {
        resolutionConfirmations: report.resolutionConfirmations.includes(user.id)
          ? arrayRemove(user.id)
          : arrayUnion(user.id),
      });
    },
    toggleFlag: (reportId) => {
      const report = findReport(reportId);
      if (!report || !requireAuth()) return;
      patchReport(reportId, {
        flaggedBy: report.flaggedBy.includes(user.id) ? arrayRemove(user.id) : arrayUnion(user.id),
      });
    },
    dismissFlags: (reportId) => {
      if (requireAuth()) patchReport(reportId, { flaggedBy: [] });
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
    loadSampleData,
    clearSampleData,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
