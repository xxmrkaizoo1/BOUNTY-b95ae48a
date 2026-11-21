import { useState } from "react";
import { buttonStyles, inputStyles } from "../lib/styles";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../state/AppState";
import type { Coords, ReportCategory } from "../data/mockReports";
import { Card, EmptyState, GoogleIcon } from "../components/ui";
import { CATEGORIES, CATEGORY_META } from "../lib/meta";
import { compressImage } from "../lib/image";
import { LIMITS, canManageReport } from "../state/core";

function Counter({ value, max }: { value: string; max: number }) {
  const near = value.length > max * 0.9;
  return (
    <span className={`text-xs ${near ? "font-semibold text-amber-400" : "text-white/40"}`}>
      {value.length}/{max}
    </span>
  );
}

/** Used for both /new and /report/:id/edit. */
export default function NewReportPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const { createReport, updateReport, reports, user, isAuthenticated, signIn } = useAppState();
  const existing = id ? reports.find((r) => r.id === id) : undefined;
  const editing = Boolean(id);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [desc, setDesc] = useState(existing?.description ?? "");
  const [category, setCategory] = useState<ReportCategory>(existing?.category ?? "Road");
  const [photoUrl, setPhotoUrl] = useState(existing?.photoUrl ?? "");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [coords, setCoords] = useState<Coords | null>(existing?.coords ?? null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoBusy(true);
    setFormError(null);
    try {
      setPhotoUrl(await compressImage(file));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't use that photo.");
    } finally {
      setPhotoBusy(false);
    }
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setFormError("Location isn't available in this browser.");
      return;
    }
    setGpsBusy(true);
    setFormError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setGpsBusy(false);
      },
      (err) => {
        setFormError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. You can still type the place name."
            : "Couldn't get your location. Try again or type the place name."
        );
        setGpsBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      setFormError("Please add a title and a short description.");
      return;
    }
    const input = { title, description: desc, category, photoUrl, location, coords };
    if (existing) {
      updateReport(existing.id, input);
      nav(`/report/${existing.id}`);
      return;
    }
    const report = createReport(input);
    if (report) nav(`/report/${report.id}`);
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md pt-6">
        <Card className="p-8 text-center">
          <p className="text-4xl" aria-hidden>📣</p>
          <h1 className="mt-3 text-xl font-bold text-white">Sign in to report an issue</h1>
          <p className="mt-2 text-sm text-white/70">
            Reports are linked to your account so you can follow progress and earn points.
          </p>
          <button onClick={signIn} className={`${buttonStyles.secondary} mt-6 w-full`}>
            <GoogleIcon /> Continue with Google
          </button>
        </Card>
      </div>
    );
  }

  if (editing && (!existing || !canManageReport(user, existing))) {
    return (
      <EmptyState icon="🔒" title={existing ? "You can't edit this report" : "Report not found"}>
        <Link to="/" className="font-semibold text-amber-300 hover:underline">
          Back to the feed
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={existing ? `/report/${existing.id}` : "/"}
        className="text-sm font-semibold text-white/55 hover:text-white"
      >
        ← {existing ? "Back to report" : "Back to feed"}
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-white">
        {editing ? "✏️ Edit report" : "⚡ New quest: report an issue"}
      </h1>
      <p className="mt-1 text-sm text-white/70">
        Reports are public. A clear photo and location help it get fixed faster.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <Card>
          <p className="text-sm font-semibold text-white">What kind of problem is it?</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((option) => {
              const meta = CATEGORY_META[option];
              const active = category === option;
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => setCategory(option)}
                  aria-pressed={active}
                  className={`flex items-center gap-3 rounded-xl p-3 text-left ring-1 ring-inset transition ${
                    active
                      ? "bg-amber-400/10 ring-2 ring-amber-400"
                      : "bg-white/5 ring-white/10 hover:ring-white/20"
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xl ${meta.tile}`} aria-hidden>
                    {meta.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{option}</span>
                    <span className="block truncate text-xs text-white/55">{meta.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="title" className="text-sm font-semibold text-white">
                Title
              </label>
              <Counter value={title} max={LIMITS.title} />
            </div>
            <input
              id="title"
              className={`${inputStyles} mt-2`}
              value={title}
              maxLength={LIMITS.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken traffic light at Jalan 3 junction"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="desc" className="text-sm font-semibold text-white">
                Description
              </label>
              <Counter value={desc} max={LIMITS.description} />
            </div>
            <textarea
              id="desc"
              className={`${inputStyles} mt-2`}
              rows={5}
              value={desc}
              maxLength={LIMITS.description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's wrong, since when, and who is affected?"
              required
            />
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-white">
            Photo <span className="font-normal text-white/40">(optional)</span>
          </p>
          {photoUrl ? (
            <div className="relative mt-3 overflow-hidden rounded-xl bg-white/10">
              <img src={photoUrl} alt="Preview" className="max-h-80 w-full object-cover" />
              <div className="absolute right-2 top-2 flex gap-2">
                <label className="cursor-pointer rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-white/80 shadow backdrop-blur hover:bg-white/5">
                  Replace
                  <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
                </label>
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-rose-400 shadow backdrop-blur hover:bg-white/5"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-8 text-center transition hover:border-amber-300 hover:bg-amber-400/10">
              {photoBusy ? (
                <>
                  <span className="h-7 w-7 animate-spin rounded-full border-4 border-white/10 border-t-amber-400" />
                  <span className="text-sm text-white/70">Compressing photo…</span>
                </>
              ) : (
                <>
                  <span className="text-3xl" aria-hidden>📷</span>
                  <span className="text-sm font-semibold text-amber-300">Take or upload a photo</span>
                  <span className="text-xs text-white/55">JPG or PNG — we shrink it automatically</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onPhoto}
                disabled={photoBusy}
              />
            </label>
          )}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="location" className="text-sm font-semibold text-white">
              Location <span className="font-normal text-white/40">(optional)</span>
            </label>
            <Counter value={location} max={LIMITS.location} />
          </div>
          <input
            id="location"
            className={inputStyles}
            value={location}
            maxLength={LIMITS.location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Street name or landmark"
          />
          {coords ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-300 ring-1 ring-emerald-400/40">
              <span>
                📍 Pinned at {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </span>
              <button
                type="button"
                onClick={() => setCoords(null)}
                className="text-xs font-semibold hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <button type="button" onClick={useMyLocation} disabled={gpsBusy} className={buttonStyles.secondary}>
              {gpsBusy ? "Finding you…" : "📍 Use my current location"}
            </button>
          )}
        </Card>

        {formError && (
          <p role="alert" className="rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-300 ring-1 ring-rose-400/40">
            {formError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link to={existing ? `/report/${existing.id}` : "/"} className={buttonStyles.secondary}>
            Cancel
          </Link>
          <button type="submit" disabled={photoBusy} className={`${buttonStyles.primary} sm:px-6`}>
            {editing ? "💾 Save changes" : "⚡ Submit report · +10 XP"}
          </button>
        </div>
      </form>
    </div>
  );
}
