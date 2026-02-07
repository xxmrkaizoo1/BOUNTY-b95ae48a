export type ReportStatus = "Open" | "Acknowledged" | "In Progress" | "Closed";

export type Report = {
  id: string;
  title: string;
  description: string;
  category: "Road" | "Trash" | "Lighting" | "Water" | "Other";
  status: ReportStatus;
  createdAt: string;
};

export const mockReports: Report[] = [
  {
    id: "r1",
    title: "Pothole near school gate",
    description: "Big pothole, dangerous for motorcycles.",
    category: "Road",
    status: "Open",
    createdAt: "2026-02-07",
  },
  {
    id: "r2",
    title: "Street light not working",
    description: "Dark at night, safety issue.",
    category: "Lighting",
    status: "In Progress",
    createdAt: "2026-02-06",
  },
];
