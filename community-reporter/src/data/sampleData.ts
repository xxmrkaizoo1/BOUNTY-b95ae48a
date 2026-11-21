import type { Coords, Report, ReportCategory, ReportStatus, Update } from "./mockReports";

/**
 * Sample neighbourhood data. Used as the demo-mode dataset and, for admins,
 * as seed data that can be loaded into (and removed from) Firestore.
 * Times are relative ("hours ago") so the feed always looks fresh.
 */
export type SampleComment = {
  by: string;
  hoursAgo: number;
  text: string;
  type?: Update["type"];
};

export type SampleReport = {
  key: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  hoursAgo: number;
  creator: string;
  location: string;
  coords?: Coords;
  photoUrl?: string;
  followers: string[];
  confirmations?: string[];
  flaggedBy?: string[];
  duplicateOfKey?: string;
  comments: SampleComment[];
};

/** Neighbour accounts used by `npm run seed` (keys match `creator` / `by` below). */
export const SAMPLE_PEOPLE = [
  { key: "u1", name: "Alya Yusof", email: "alya.demo@example.com", avatarSeed: "alya" },
  { key: "u2", name: "Daniel Tan", email: "daniel.demo@example.com", avatarSeed: "daniel" },
  { key: "u3", name: "Priya Raj", email: "priya.demo@example.com", avatarSeed: "priya" },
  { key: "u4", name: "Hafiz Rahman", email: "hafiz.demo@example.com", avatarSeed: "hafiz" },
  { key: "u5", name: "Mei Ling", email: "meiling.demo@example.com", avatarSeed: "meiling" },
  { key: "u6", name: "Siti Aminah", email: "siti.demo@example.com", avatarSeed: "siti" },
  { key: "admin", name: "Encik Rahim (Residents' Assoc.)", email: "rahim.demo@example.com", avatarSeed: "rahim" },
] as const;

export const SAMPLE_REPORTS: SampleReport[] = [
  {
    key: "r1",
    title: "Pothole near school gate",
    description:
      "Big pothole right at the drop-off point of the school gate. Motorcycles swerve to avoid it during rush hour and it fills with water when it rains.",
    category: "Road",
    status: "Open",
    hoursAgo: 3,
    creator: "u1",
    location: "Jalan Mawar 4, Taman Melati",
    coords: { lat: 3.2205, lng: 101.7262 },
    photoUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60",
    followers: ["u1", "u2", "u4", "u5"],
    comments: [
      { by: "u1", hoursAgo: 2.5, type: "update", text: "Called the council hotline — they logged it and said an inspector will come this week." },
      { by: "u4", hoursAgo: 1.2, text: "My son nearly fell off his bicycle here this morning. Please fix soon!" },
      { by: "u2", hoursAgo: 0.6, text: "Put a traffic cone next to it for now so drivers can see it." },
    ],
  },
  {
    key: "r2",
    title: "Street light out at pedestrian crossing",
    description:
      "The light above the zebra crossing in front of the surau has been off for a week. Very dark after Maghrib — pedestrians are hard to see.",
    category: "Lighting",
    status: "In Progress",
    hoursAgo: 30,
    creator: "u2",
    location: "Jalan Melati Utama, near Surau Al-Hidayah",
    coords: { lat: 3.2231, lng: 101.7281 },
    followers: ["u2", "u1", "u3"],
    comments: [
      { by: "admin", hoursAgo: 26, type: "update", text: "Reported to TNB street lighting. Ticket number SL-20419." },
      { by: "admin", hoursAgo: 8, type: "update", text: "Technician assigned, replacement part ordered." },
      { by: "u3", hoursAgo: 5, text: "Still dark tonight, but saw a TNB van nearby this afternoon." },
    ],
  },
  {
    key: "r3",
    title: "Overflowing trash bins at night market",
    description:
      "Bins at the pasar malam are full by 9pm every Wednesday. Rubbish spills onto the road and attracts stray cats and rats.",
    category: "Trash",
    status: "Acknowledged",
    hoursAgo: 52,
    creator: "u3",
    location: "Pasar Malam, Jalan 1",
    coords: { lat: 3.2188, lng: 101.7245 },
    photoUrl:
      "https://images.unsplash.com/photo-1484659619207-9165d119dafe?auto=format&fit=crop&w=900&q=60",
    followers: ["u3", "u5"],
    comments: [
      { by: "u3", hoursAgo: 50, type: "update", text: "Emailed Alam Flora asking for extra bins on market nights." },
      { by: "u5", hoursAgo: 20, text: "Same at the Saturday market too." },
    ],
  },
  {
    key: "r4",
    title: "Burst pipe flooding the walkway",
    description:
      "Clean water gushing from a cracked pipe beside the playground. The walkway is flooded and it's wasting a lot of water.",
    category: "Water",
    status: "In Progress",
    hoursAgo: 5,
    creator: "u5",
    location: "Taman Permainan Blok C",
    coords: { lat: 3.2214, lng: 101.7299 },
    followers: ["u5", "u1", "u2", "u6"],
    comments: [
      { by: "u5", hoursAgo: 4.5, type: "update", text: "Air Selangor confirmed the complaint. Crew on the way." },
      { by: "u6", hoursAgo: 2, text: "They've shut the valve, water has stopped. Digging now." },
    ],
  },
  {
    key: "r5",
    title: "Broken swing chain at playground",
    description: "One of the swing chains snapped and the seat hangs at an angle. Kids are still trying to use it.",
    category: "Safety",
    status: "Open",
    hoursAgo: 10,
    creator: "u4",
    location: "Taman Permainan Blok C",
    coords: { lat: 3.2216, lng: 101.7296 },
    followers: ["u4", "u6"],
    comments: [
      { by: "u4", hoursAgo: 9.5, type: "update", text: "Tied the seat up with rope so nobody uses it until it's fixed." },
    ],
  },
  {
    key: "r6",
    title: "Clogged drain causes flash flood",
    description:
      "The monsoon drain at the junction is blocked with leaves and plastic. Every heavy rain the road floods ankle-deep within 20 minutes.",
    category: "Water",
    status: "Acknowledged",
    hoursAgo: 76,
    creator: "u6",
    location: "Junction Jalan Melati 3 / Jalan Mawar",
    coords: { lat: 3.2197, lng: 101.7273 },
    followers: ["u6", "u1", "u2", "u3", "u4"],
    comments: [
      { by: "admin", hoursAgo: 60, type: "update", text: "Forwarded to DBKL drainage unit. Scheduled for cleaning next week." },
      { by: "u2", hoursAgo: 30, text: "Flooded again yesterday evening. Cars were stuck." },
      { by: "u1", hoursAgo: 12, text: "+1, this is getting worse every week." },
    ],
  },
  {
    key: "r7",
    title: "Illegal dumping behind shoplots",
    description: "Someone dumped old mattresses and construction waste in the back lane behind the shoplots.",
    category: "Trash",
    status: "Closed",
    hoursAgo: 150,
    creator: "u1",
    location: "Back lane, Jalan Melati 7",
    coords: { lat: 3.2242, lng: 101.7258 },
    followers: ["u1", "u3", "u5"],
    confirmations: ["u3", "u5"],
    comments: [
      { by: "u1", hoursAgo: 140, type: "update", text: "Council says enforcement team will clear it and check CCTV." },
      { by: "u1", hoursAgo: 72, type: "update", text: "Lorry came and cleared everything. Marking as closed." },
      { by: "u3", hoursAgo: 60, text: "Walked past today — all clean. Confirmed!" },
    ],
  },
  {
    key: "r8",
    title: "Faded zebra crossing near clinic",
    description: "The paint on the zebra crossing outside Klinik Kesihatan is almost gone. Drivers don't slow down.",
    category: "Road",
    status: "Closed",
    hoursAgo: 220,
    creator: "u2",
    location: "Outside Klinik Kesihatan Taman Melati",
    coords: { lat: 3.2259, lng: 101.7290 },
    followers: ["u2", "u4"],
    confirmations: ["u4"],
    comments: [
      { by: "admin", hoursAgo: 120, type: "update", text: "Repainting done by the road contractor." },
      { by: "u4", hoursAgo: 100, text: "Looks great now, very visible." },
    ],
  },
  {
    key: "r9",
    title: "Fallen branch blocking bicycle lane",
    description: "A large branch fell after last night's storm and is blocking the whole bicycle lane.",
    category: "Safety",
    status: "Closed",
    hoursAgo: 96,
    creator: "u6",
    location: "Laluan Basikal Taman Melati",
    coords: { lat: 3.2176, lng: 101.7312 },
    followers: ["u6", "u1"],
    confirmations: ["u1", "u2"],
    comments: [
      { by: "u6", hoursAgo: 90, type: "update", text: "Landscape team removed it this morning." },
      { by: "u1", hoursAgo: 80, text: "Cycled through today, all clear 👍" },
    ],
  },
  {
    key: "r10",
    title: "Flickering lights in the underpass",
    description: "Half the lights in the pedestrian underpass flicker on and off. It feels unsafe walking through at night.",
    category: "Lighting",
    status: "Open",
    hoursAgo: 0.5,
    creator: "u3",
    location: "Underpass to LRT Taman Melati",
    coords: { lat: 3.2193, lng: 101.7319 },
    followers: ["u3"],
    comments: [],
  },
  {
    key: "r11",
    title: "Bus stop shelter roof leaking",
    description: "Rain pours through a hole in the bus stop roof right over the bench. People have to stand in the rain.",
    category: "Other",
    status: "Open",
    hoursAgo: 46,
    creator: "u5",
    location: "Bus stop, Jalan Melati Utama",
    coords: { lat: 3.2226, lng: 101.7302 },
    followers: ["u5", "u4"],
    comments: [{ by: "u4", hoursAgo: 40, text: "Elderly people wait here for the clinic bus too." }],
  },
  {
    key: "r12",
    title: "Missing manhole cover on sidewalk",
    description: "A manhole cover is missing on the sidewalk. Someone put a branch in it as a warning but it's very dangerous at night.",
    category: "Safety",
    status: "Acknowledged",
    hoursAgo: 20,
    creator: "u4",
    location: "Jalan Mawar 2, near 7-Eleven",
    coords: { lat: 3.2209, lng: 101.7251 },
    followers: ["u4", "u1", "u2", "u3", "u5", "u6"],
    comments: [
      { by: "admin", hoursAgo: 18, type: "update", text: "Urgent — escalated to Indah Water. Temporary barrier requested." },
      { by: "u2", hoursAgo: 6, text: "Barrier is up now. Still need the cover replaced." },
    ],
  },
  {
    key: "r13",
    title: "Big hole on the road near the school",
    description: "There's a huge hole in front of the school, please fix.",
    category: "Road",
    status: "Closed",
    hoursAgo: 2,
    creator: "u6",
    location: "Taman Melati school",
    followers: ["u6"],
    flaggedBy: ["u3"],
    duplicateOfKey: "r1",
    comments: [],
  },
];

const HOUR = 3_600_000;

function isoDate(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

function isoDateTime(ms: number) {
  return new Date(ms).toISOString().replace("T", " ").slice(0, 16);
}

/** Demo-mode dataset with ids that match the sample keys. */
export function buildSampleData(now = Date.now()): { reports: Report[]; updates: Update[] } {
  const reports: Report[] = SAMPLE_REPORTS.map((s) => {
    const ms = now - s.hoursAgo * HOUR;
    return {
      id: s.key,
      title: s.title,
      description: s.description,
      category: s.category,
      status: s.status,
      createdAt: isoDate(ms),
      createdAtMs: ms,
      creatorId: s.creator,
      photoUrl: s.photoUrl,
      location: s.location,
      coords: s.coords,
      followers: s.followers,
      flaggedBy: s.flaggedBy ?? [],
      hidden: false,
      commentsLocked: false,
      duplicateOf: s.duplicateOfKey,
      resolutionConfirmations: s.confirmations ?? [],
    };
  });

  const updates: Update[] = SAMPLE_REPORTS.flatMap((s) =>
    s.comments.map((c, i) => {
      const ms = now - c.hoursAgo * HOUR;
      return {
        id: `${s.key}-c${i}`,
        reportId: s.key,
        userId: c.by,
        text: c.text,
        type: c.type ?? "comment",
        createdAt: isoDateTime(ms),
        createdAtMs: ms,
      };
    })
  ).sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));

  return { reports, updates };
}

export { HOUR as SAMPLE_HOUR, isoDate as sampleDate, isoDateTime as sampleDateTime };
