export type ReportStatus = "Open" | "Acknowledged" | "In Progress" | "Closed";

export type ReportCategory =
  | "Road"
  | "Trash"
  | "Lighting"
  | "Water"
  | "Safety"
  | "Other";

export type User = {
  id: string;
  name: string;
  avatar: string;
  role: "member" | "admin";
};

export type Report = {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  createdAt: string;
  creatorId: string;
  photoUrl?: string;
  location?: string;
  followers: string[];
  flaggedBy: string[];
  hidden: boolean;
  commentsLocked: boolean;
  duplicateOf?: string;
  resolutionConfirmations: string[];
};

export type Update = {
  id: string;
  reportId: string;
  userId: string;
  text: string;
  createdAt: string;
  type: "update" | "comment";
};

export const mockUsers: User[] = [
  {
    id: "guest",
    name: "Guest User",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=guest",
    role: "member",
  },
  {
    id: "u1",
    name: "Alya Yusof",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=alya",
    role: "member",
  },
  {
    id: "admin",
    name: "Community Admin",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=admin",
    role: "admin",
  },
];

export const mockReports: Report[] = [
  {
    id: "r1",
    title: "Pothole near school gate",
    description: "Big pothole, dangerous for motorcycles during rush hour.",
    category: "Road",
    status: "Open",
    createdAt: "2026-02-07",
    creatorId: "u1",
    photoUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60",
    location: "Jalan Mawar 4, Section 2",
    followers: ["u1"],
    flaggedBy: [],
    hidden: false,
    commentsLocked: false,
    resolutionConfirmations: [],
  },
  {
    id: "r2",
    title: "Street light not working",
    description: "Dark at night, safety issue for pedestrians.",
    category: "Lighting",
    status: "In Progress",
    createdAt: "2026-02-06",
    creatorId: "u1",
    location: "Taman Melati",
    followers: ["u1"],
    flaggedBy: ["admin"],
    hidden: false,
    commentsLocked: false,
    resolutionConfirmations: ["u1"],
  },
  {
    id: "r3",
    title: "Overflowing trash bins",
    description: "Bins are overflowing and attracting stray animals.",
    category: "Trash",
    status: "Acknowledged",
    createdAt: "2026-02-05",
    creatorId: "admin",
    photoUrl:
      "https://images.unsplash.com/photo-1484659619207-9165d119dafe?auto=format&fit=crop&w=900&q=60",
    location: "Pasar Malam Jalan 1",
    followers: ["admin"],
    flaggedBy: [],
    hidden: false,
    commentsLocked: false,
    resolutionConfirmations: [],
  },
];

export const mockUpdates: Update[] = [
  {
    id: "u1",
    reportId: "r1",
    userId: "u1",
    text: "I contacted the town council hotline, they said they will inspect this week.",
    createdAt: "2026-02-07 10:12",
    type: "update",
  },
  {
    id: "u2",
    reportId: "r2",
    userId: "admin",
    text: "Technician assigned, replacement part ordered.",
    createdAt: "2026-02-06 18:30",
    type: "update",
  },
  {
    id: "u3",
    reportId: "r3",
    userId: "u1",
    text: "Multiple bins are already full by noon. Need more frequent collection.",
    createdAt: "2026-02-05 12:45",
    type: "comment",
  },
];
