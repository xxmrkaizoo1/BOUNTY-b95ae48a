import { createContext, useContext, useMemo, useState } from "react";
import { mockReports, type Report } from "../data/mockReports";

type User = {
    id: string;
    name: string;
    avatar: string;
};
type Comment = {
    id: string;
    reportId: string;
    userId: string;
    text: string;
    createdAt: string;
};


type AppState = {
    user: User;
    points: number;
    badges: string[];
    comments: Comment[];
    addComment: (reportId: string, text: string) => void;
    reports: (Report & { creatorId: string })[];
    follows: Set<string>; // reportIds
    isFollowing: (reportId: string) => boolean;
    toggleFollow: (reportId: string) => void;
    ensureCreatorAutoFollow: (reportId: string, creatorId: string) => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
    // fake logged-in user for now
    const user: User = useMemo(
        () => ({
            id: "u1",
            name: "Guest User",
            avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=guest",
        }),
        []
    );

    // add creatorId into mock reports
    const [reports] = useState<(Report & { creatorId: string })[]>(
        mockReports.map((r) => ({ ...r, creatorId: "u1" })) // assume user created them for now
    );

    const [follows, setFollows] = useState<Set<string>>(new Set());

    function isFollowing(reportId: string) {
        return follows.has(reportId);
    }

    function toggleFollow(reportId: string) {
        setFollows((prev) => {
            const next = new Set(prev);
            if (next.has(reportId)) next.delete(reportId);
            else next.add(reportId);
            return next;
        });
    }

    // if report creator is current user, auto-follow it
    function ensureCreatorAutoFollow(reportId: string, creatorId: string) {
        if (creatorId !== user.id) return;
        setFollows((prev) => {
            if (prev.has(reportId)) return prev;
            const next = new Set(prev);
            next.add(reportId);
            return next;
        });
    }

    const value: AppState = {
        user,
        reports,
        follows,
        isFollowing,
        toggleFollow,
        ensureCreatorAutoFollow,
    };

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
    const v = useContext(Ctx);
    if (!v) throw new Error("useAppState must be used inside AppStateProvider");
    return v;
}
