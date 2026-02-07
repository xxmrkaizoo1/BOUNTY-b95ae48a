import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppState";
import type { ReportCategory } from "../data/mockReports";

const CATEGORY_OPTIONS: ReportCategory[] = [
  "Road",
  "Trash",
  "Lighting",
  "Water",
  "Safety",
  "Other",
];

export default function NewReportPage() {
  const nav = useNavigate();
  const { createReport } = useAppState();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<ReportCategory>("Road");
  const [photoUrl, setPhotoUrl] = useState("");
  const [location, setLocation] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const report = createReport({
      title,
      description: desc,
      category,
      photoUrl,
      location,
    });
    nav(`/report/${report.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Create Report</h1>
      <p className="mt-2 text-sm text-gray-600">
        Share what you see in the community. Add photos and location if you can.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow">
        <div>
          <label className="text-sm font-semibold">Title</label>
          <input
            className="mt-2 w-full rounded-xl border p-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Broken traffic light"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Description</label>
          <textarea
            className="mt-2 w-full rounded-xl border p-3"
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Explain what happened..."
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Category</label>
            <select
              className="mt-2 w-full rounded-xl border p-3"
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Location (optional)</label>
            <input
              className="mt-2 w-full rounded-xl border p-3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Street name or landmark"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Photo URL (optional)</label>
          <input
            className="mt-2 w-full rounded-xl border p-3"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Paste an image link"
          />
        </div>

        <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
          Reports are public by default. Updates and closures can be confirmed by anyone.
        </div>

        <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
          Submit report
        </button>
      </form>
    </div>
  );
}
