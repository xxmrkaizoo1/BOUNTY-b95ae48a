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

export type Coords = { lat: number; lng: number };

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
  createdAtMs?: number;
  updatedAtMs?: number;
  coords?: Coords;
  /** Seeded demo content (shown with a "Sample" tag; removable by admins). */
  sample?: boolean;
};

export type Update = {
  id: string;
  reportId: string;
  userId: string;
  text: string;
  createdAt: string;
  type: "update" | "comment";
  createdAtMs?: number;
  sample?: boolean;
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
  { id: "u2", name: "Daniel Tan", avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=daniel", role: "member" },
  { id: "u3", name: "Priya Raj", avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=priya", role: "member" },
  { id: "u4", name: "Hafiz Rahman", avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=hafiz", role: "member" },
  { id: "u5", name: "Mei Ling", avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=meiling", role: "member" },
  { id: "u6", name: "Siti Aminah", avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=siti", role: "member" },
];
