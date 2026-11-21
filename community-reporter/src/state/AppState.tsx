import { useContext } from "react";
import { isFirebaseConfigured } from "../lib/firebase";
import { AppStateContext, STATUS_FLOW } from "./core";
import { FirebaseAppStateProvider } from "./FirebaseAppState";
import { LocalAppStateProvider } from "./LocalAppState";

/**
 * Uses Firebase (Google Auth + Firestore) when VITE_FIREBASE_* env vars are set,
 * otherwise falls back to the local demo store (mock users + localStorage).
 */
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  return isFirebaseConfigured ? (
    <FirebaseAppStateProvider>{children}</FirebaseAppStateProvider>
  ) : (
    <LocalAppStateProvider>{children}</LocalAppStateProvider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState() {
  const v = useContext(AppStateContext);
  if (!v) throw new Error("useAppState must be used inside AppStateProvider");
  return v;
}

// eslint-disable-next-line react-refresh/only-export-components
export const statusFlow = STATUS_FLOW;
