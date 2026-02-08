export default function App() {

  const stats = [
    { label: "Total reports", value: "128" },
    { label: "Open", value: "24" },
    { label: "In progress", value: "11" },
    { label: "Closed", value: "93" },



  ];

  const updates = [
    {
      title: "Pothole near school gate",
      category: "Road",
      status: "Open",
      statusColor: "bg-rose-500/15 text-rose-200 border-rose-500/40",
      summary: "Large pothole causing delays during morning drop-off.",
      meta: "Reported 2 hours ago • 5 updates",
    },
    {
      title: "Street light not working",
      category: "Lighting",
      status: "In progress",
      statusColor: "bg-amber-500/15 text-amber-200 border-amber-500/40",
      summary: "Dark pedestrian crossing needs immediate attention.",
      meta: "Reported yesterday • 3 updates",
    },
    {
      title: "Overflowing trash bins",
      category: "Trash",
      status: "Acknowledged",
      statusColor: "bg-blue-500/15 text-blue-200 border-blue-500/40",
      summary: "Bins are full and attracting stray animals.",
      meta: "Reported 3 days ago • 2 updates",
    },
  ];

  const categories = [
    { name: "Road", count: 18 },
    { name: "Lighting", count: 12 },
    { name: "Trash", count: 9 },
    { name: "Safety", count: 7 },
  ];

  const quickActions = [
    { title: "Report hazard", detail: "Fast photo upload", tone: "bg-rose-500/15 text-rose-200" },
    { title: "Share update", detail: "Post verified info", tone: "bg-blue-500/15 text-blue-200" },
    { title: "Volunteer help", detail: "Join response teams", tone: "bg-emerald-500/15 text-emerald-200" },
  ];

  const activity = [
    {
      title: "City crew dispatched",
      detail: "Road crew assigned to pothole near school gate.",
      time: "14 min ago",
    },
    {
      title: "Lighting ticket escalated",
      detail: "Public works flagged priority on dark crossing.",
      time: "2 hrs ago",
    },
    {
      title: "Community cleanup planned",
      detail: "Volunteer event scheduled for Saturday morning.",
      time: "Yesterday",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-none flex-col gap-8 px-4 py-8 sm:px-6 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-xl">
              📣
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Community Pulse
              </p>
              <h1 className="text-2xl font-semibold">Public Feed</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/50 hover:text-white">
              View profile
            </button>
            <button className="rounded-full bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400">
              New report
            </button>
          </div>
        </nav>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl shadow-blue-900/30">
            <p className="text-xs uppercase tracking-[0.4em] text-blue-300">
              Neighborhood overview
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Track incidents, coordinate responses, and celebrate progress together.
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
              The public feed keeps residents, volunteers, and city teams aligned with live
              updates, verified reports, and actionable next steps.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400">
                Create new report
              </button>
              <button className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/50 hover:text-white">
                View response map
              </button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {quickActions.map((action) => (
                <div
                  key={action.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${action.tone}`}
                  >
                    {action.title}
                  </span>
                  <p className="mt-3 text-sm text-slate-300">{action.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Live response
              </p>
              <h3 className="mt-2 text-xl font-semibold">Activity timeline</h3>
              <div className="mt-4 space-y-4">
                {activity.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <span className="text-xs text-slate-400">{item.time}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Coverage map
              </p>
              <div className="mt-4 grid h-48 place-items-center rounded-2xl border border-dashed border-white/15 bg-slate-950/40 text-sm text-slate-400">
                Interactive map preview
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 shadow-lg shadow-slate-900/40"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </section>

        <main className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    This week
                  </p>
                  <h2 className="text-2xl font-semibold">Top issues reported</h2>
                </div>
                <button className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/50 hover:text-white">
                  View analytics
                </button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Road", value: "18" },
                  { label: "Lighting", value: "12" },
                  { label: "Trash", value: "9" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Public feed
                  </p>
                  <h2 className="text-2xl font-semibold">Latest reports</h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Live updates
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {updates.map((update) => (
                  <article
                    key={update.title}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 transition hover:border-blue-400/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{update.title}</h3>
                        <p className="mt-2 text-sm text-slate-300">{update.summary}</p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${update.statusColor}`}
                      >
                        {update.status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                      <span>{update.meta}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                        {update.category}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 shadow-xl shadow-blue-900/20">
              <h2 className="text-lg font-semibold">Community briefing</h2>
              <p className="mt-3 text-sm text-slate-300">
                Stay aligned with the latest verified updates in your area.
              </p>
              <button className="mt-6 w-full rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400">
                Share update
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Filters
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <label className="block">
                  Search reports
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
                    placeholder="Search by keyword"
                  />
                </label>
                <label className="block">
                  Status
                  <select className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none">
                    <option>All statuses</option>
                    <option>Open</option>
                    <option>In progress</option>
                    <option>Closed</option>
                  </select>
                </label>
                <label className="block">
                  Category
                  <select className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none">
                    <option>All categories</option>
                    <option>Road</option>
                    <option>Lighting</option>
                    <option>Trash</option>
                    <option>Safety</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Popular categories
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {categories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-200">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );


}
