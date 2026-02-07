import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewReportPage() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Road");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("For now: UI only ✅ (Next step we connect database/auth)");
    nav("/");
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Create Report</h1>

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

        <div>
          <label className="text-sm font-semibold">Category</label>
          <select
            className="mt-2 w-full rounded-xl border p-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Road</option>
            <option>Trash</option>
            <option>Lighting</option>
            <option>Water</option>
            <option>Other</option>
          </select>
        </div>

        <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
}
