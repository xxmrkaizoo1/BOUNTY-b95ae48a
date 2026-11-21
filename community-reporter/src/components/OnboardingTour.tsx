import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppState";
import { STATUS_FLOW } from "../state/core";
import { CATEGORIES, CATEGORY_META } from "../lib/meta";
import type { ReportStatus } from "../data/mockReports";
import { Avatar, StatusBadge, StatusStepper } from "./ui";

/* ---------- Game UI building blocks ---------- */

const HEADING = "font-[Fredoka] tracking-wide";

const gameButton = {
  gold: "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl border-b-4 border-amber-700 bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-3 font-[Fredoka] text-base font-bold text-amber-950 shadow-lg shadow-amber-500/30 transition active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-60",
  green: "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-3 font-[Fredoka] text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition active:translate-y-1 active:border-b-0 disabled:cursor-default",
  plain: "inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-black/40 bg-white/10 px-5 py-3 font-[Fredoka] text-base font-semibold text-white transition hover:bg-white/15 active:translate-y-1 active:border-b-0",
};

function Shine() {
  return (
    <span className="anim-shine pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-white/40 blur-sm" aria-hidden />
  );
}

/** Mission panel: dark glass card that gets a "COMPLETE" stamp when done. */
function Mission({
  goal,
  done,
  children,
}: {
  goal: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative rounded-3xl p-4 ring-2 transition ${
        done ? "bg-emerald-400/10 ring-emerald-400/60" : "bg-white/5 ring-white/10"
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
        <span className={done ? "text-emerald-300" : "text-amber-300"}>{done ? "✔ Mission" : "🎯 Mission"}</span>
        <span className="text-white/70 normal-case tracking-normal">{goal}</span>
      </div>
      {children}
      {done && (
        <span
          className={`anim-stamp pointer-events-none absolute -right-2 -top-3 rounded-lg border-2 border-emerald-300 bg-emerald-500 px-2.5 py-1 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg ${HEADING}`}
        >
          Complete!
        </span>
      )}
    </div>
  );
}

/* ---------- Quests (sample data only — nothing is saved) ---------- */

type QuestProps = { done: boolean; complete: () => void };

function QuestReport({ done, complete }: QuestProps) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <Mission goal="Pick what kind of problem you see" done={done}>
      <div className="grid grid-cols-3 gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setPicked(c);
              complete();
            }}
            className={`flex flex-col items-center gap-1 rounded-2xl border-b-4 py-2.5 text-xs font-bold transition active:translate-y-0.5 active:border-b-2 ${
              picked === c
                ? "anim-pop border-indigo-800 bg-indigo-500 text-white"
                : "border-black/40 bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            <span className="text-2xl" aria-hidden>
              {CATEGORY_META[c].icon}
            </span>
            {c}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-white/60">
        <span className="rounded-xl bg-black/20 px-3 py-2">📷 + photo</span>
        <span className="rounded-xl bg-black/20 px-3 py-2">📍 + location</span>
      </div>
    </Mission>
  );
}

function QuestFollow({ done, complete }: QuestProps) {
  const [following, setFollowing] = useState(false);
  return (
    <Mission goal="Follow this report" done={done}>
      <div className="flex gap-3 rounded-2xl bg-white p-3 text-slate-900">
        <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-yellow-100 text-3xl" aria-hidden>
          💡
          {following && (
            <span className="anim-pop absolute -left-2 -top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
              2 new
            </span>
          )}
        </div>
        <div className="min-w-0">
          <StatusBadge status="In Progress" />
          <p className="mt-1 truncate text-sm font-bold">Street light not working</p>
          <p className="text-xs text-slate-500">👥 {following ? 13 : 12} followers</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setFollowing((v) => !v);
          complete();
        }}
        className={`${following ? gameButton.plain : gameButton.gold} mt-3 w-full`}
      >
        {!following && <Shine />}
        {following ? "✓ Following" : "🔔 Follow"}
      </button>
    </Mission>
  );
}

function QuestStatus({ done, complete }: QuestProps) {
  const [index, setIndex] = useState(0);
  const status: ReportStatus = STATUS_FLOW[index];
  const closed = index === STATUS_FLOW.length - 1;
  return (
    <Mission goal="Move the report all the way to Closed" done={done}>
      <div className="rounded-2xl bg-white p-4 text-slate-900">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold">Pothole near school gate</p>
          <span key={status} className="anim-pop">
            <StatusBadge status={status} />
          </span>
        </div>
        <div className="mt-4">
          <StatusStepper status={status} />
        </div>
      </div>
      <button
        type="button"
        disabled={closed}
        onClick={() => {
          const next = index + 1;
          setIndex(next);
          if (next === STATUS_FLOW.length - 1) complete();
        }}
        className={`${closed ? gameButton.green : gameButton.gold} mt-3 w-full`}
      >
        {!closed && <Shine />}
        {closed ? "🏁 Fixed and closed!" : `⏩ Level up to “${STATUS_FLOW[index + 1]}”`}
      </button>
    </Mission>
  );
}

function QuestConfirm({ done, complete }: QuestProps) {
  return (
    <Mission goal="Confirm a neighbour's fix" done={done}>
      <div className="rounded-2xl bg-white p-4 text-slate-900">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Overflowing trash bins</p>
          <StatusBadge status="Closed" />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
              style={{ width: done ? "100%" : "50%" }}
            />
          </div>
          <span className="text-sm font-bold">{done ? 2 : 1}/2</span>
        </div>
      </div>
      <button
        type="button"
        disabled={done}
        onClick={complete}
        className={`${done ? gameButton.green : gameButton.gold} mt-3 w-full`}
      >
        {!done && <Shine />}
        {done ? "✅ Verified by you!" : "✅ I confirm it's fixed"}
      </button>
    </Mission>
  );
}

/* ---------- Confetti (deterministic so renders stay pure) ---------- */

const CONFETTI_COLORS = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#f87171"];

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 44 }, (_, i) => (
        <span
          key={i}
          className="anim-confetti absolute top-0 block rounded-sm"
          style={{
            left: `${(i * 37) % 100}%`,
            width: 6 + (i % 3) * 2,
            height: 10 + (i % 4) * 2,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDuration: `${1.8 + ((i * 13) % 10) / 6}s`,
            animationDelay: `${((i * 7) % 12) / 20}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Tour ---------- */

const XP_PER_LEVEL = 100;

type Quest = {
  icon: string;
  title: string;
  body: string;
  reward: number;
  Component: (props: QuestProps) => React.ReactNode;
};

const QUESTS: Quest[] = [
  {
    icon: "📸",
    title: "Spot a problem",
    body: "Tap ＋ anytime to report an issue. Pick a category, add a photo and pin the location.",
    reward: 20,
    Component: QuestReport,
  },
  {
    icon: "🔔",
    title: "Follow the story",
    body: "Follow reports you care about. A red badge tells you when there's news.",
    reward: 15,
    Component: QuestFollow,
  },
  {
    icon: "🚦",
    title: "Track the progress",
    body: "Every report levels up from Open to Closed. Reporters and admins move it along.",
    reward: 25,
    Component: QuestStatus,
  },
  {
    icon: "🛡️",
    title: "Verify the fix",
    body: "When a report is closed, check the spot and confirm it's really fixed. Neighbours keep everyone honest.",
    reward: 40,
    Component: QuestConfirm,
  },
];

const STARS = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 53) % 100}%`,
  top: `${(i * 29) % 100}%`,
  size: 1 + (i % 3),
  delay: `${(i % 7) * 0.4}s`,
}));

export default function OnboardingTour() {
  const { user, finishTour } = useAppState();
  const nav = useNavigate();
  // 0 = intro, 1..QUESTS.length = quests, QUESTS.length + 1 = victory screen
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() => QUESTS.map(() => false));
  const [xpGain, setXpGain] = useState<{ id: number; amount: number } | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const firstName = user.name.split(" ")[0];

  const lastStep = QUESTS.length + 1;
  const questIndex = step - 1;
  const quest = QUESTS[questIndex];
  const xp = QUESTS.reduce((sum, q, i) => sum + (completed[i] ? q.reward : 0), 0);
  // The tutorial tops out at exactly one level, so cap the bar instead of wrapping to 0.
  const maxed = xp >= XP_PER_LEVEL;
  const level = maxed ? 2 : 1;
  const barXp = Math.min(xp, XP_PER_LEVEL);
  const victory = step === lastStep;
  const questDone = quest ? completed[questIndex] : false;

  function completeQuest(index: number) {
    if (completed[index]) return;
    setCompleted((prev) => prev.map((v, i) => (i === index ? true : v)));
    setXpGain({ id: Date.now(), amount: QUESTS[index].reward });
  }

  // Lock page scroll while the tutorial is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Keep the latest finishTour without re-running effects on every app re-render.
  const finishRef = useRef(finishTour);
  useEffect(() => {
    finishRef.current = finishTour;
  });

  useEffect(() => {
    nextRef.current?.focus();
  }, [step]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finishRef.current();
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, lastStep));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lastStep]);

  function finish(path: string) {
    finishTour();
    nav(path);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div className="relative flex max-h-[96vh] w-full max-w-md flex-col overflow-hidden rounded-t-[2rem] bg-gradient-to-b from-indigo-950 via-violet-950 to-slate-950 text-white shadow-2xl ring-1 ring-white/10 sm:rounded-[2rem]">
        {/* Starfield */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {STARS.map((s, i) => (
            <span
              key={i}
              className="anim-twinkle absolute rounded-full bg-white"
              style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
            />
          ))}
          <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl" />
        </div>
        {victory && <Confetti />}

        {/* HUD: level + XP bar */}
        <div className="relative flex items-center gap-3 px-5 pt-5">
          <div className="relative">
            <Avatar src={user.avatar} name={user.name} seed={user.id} size="h-11 w-11 ring-amber-400" />
            <span
              key={level}
              className={`anim-pop absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-indigo-950 bg-amber-400 text-[11px] font-extrabold text-amber-950 ${HEADING}`}
            >
              {level}
            </span>
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/60">
              <span className="truncate">{firstName} · Lv {level}</span>
              <span className="text-amber-300">{maxed ? "LEVEL UP!" : `${barXp}/${XP_PER_LEVEL} XP`}</span>
            </div>
            <div className="relative mt-1 h-3 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
              <div
                className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 transition-all duration-700"
                style={{ width: `${(barXp / XP_PER_LEVEL) * 100}%` }}
              >
                <Shine />
              </div>
            </div>
            {xpGain && (
              <span
                key={xpGain.id}
                className={`anim-float-up absolute left-1/2 top-0 text-lg font-bold text-amber-300 drop-shadow ${HEADING}`}
              >
                +{xpGain.amount} XP
              </span>
            )}
          </div>
          {!victory && (
            <button
              type="button"
              onClick={finishTour}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-white/20 hover:text-white"
            >
              Skip
            </button>
          )}
        </div>

        {/* Quest map */}
        <div className="relative mt-4 flex items-center justify-center gap-1.5 px-5">
          {QUESTS.map((q, i) => {
            const active = i === questIndex;
            const done = completed[i];
            return (
              <div key={q.title} className="flex items-center gap-1.5">
                {i > 0 && <span className={`h-0.5 w-5 rounded ${completed[i - 1] ? "bg-emerald-400" : "bg-white/15"}`} />}
                <button
                  type="button"
                  onClick={() => setStep(i + 1)}
                  aria-label={`Quest ${i + 1}: ${q.title}`}
                  className={`grid h-9 w-9 place-items-center rounded-xl text-base transition ${
                    done
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                      : active
                        ? "anim-glow bg-amber-400"
                        : "bg-white/10"
                  } ${active ? "scale-110" : ""}`}
                >
                  {done ? "✔" : q.icon}
                </button>
              </div>
            );
          })}
          <span className={`h-0.5 w-5 rounded ${completed[QUESTS.length - 1] ? "bg-emerald-400" : "bg-white/15"}`} />
          <span className={`grid h-9 w-9 place-items-center rounded-xl text-base ${victory ? "anim-pop bg-amber-400" : "bg-white/10"}`}>
            🏆
          </span>
        </div>

        {/* Stage */}
        <div key={step} className="anim-pop relative flex-1 overflow-y-auto px-5 pb-4 pt-5">
          {step === 0 && (
            <div className="text-center">
              <p className="anim-bob text-6xl" aria-hidden>
                🦸
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">New player joined</p>
              <h2 id="tour-title" className={`mt-1 text-3xl font-bold ${HEADING}`}>
                Welcome, {firstName}!
              </h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-white/70">
                You're now a <b className="text-white">Community Reporter</b>. Clear 4 quick quests to learn the ropes and
                reach <b className="text-amber-300">Level 2</b>.
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-2 text-left text-sm">
                {QUESTS.map((q) => (
                  <li key={q.title} className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
                    <span className="text-xl" aria-hidden>{q.icon}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{q.title}</span>
                      <span className="text-xs font-bold text-amber-300">+{q.reward} XP</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {quest && (
            <div>
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/15" aria-hidden>
                  {quest.icon}
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">
                    Quest {step} of {QUESTS.length} · +{quest.reward} XP
                  </p>
                  <h2 id="tour-title" className={`text-2xl font-bold ${HEADING}`}>
                    {quest.title}
                  </h2>
                </div>
              </div>
              <p className="mt-2 text-sm text-white/70">{quest.body}</p>
              <div className="mt-4">
                <quest.Component done={questDone} complete={() => completeQuest(questIndex)} />
              </div>
            </div>
          )}

          {victory && (
            <div className="text-center">
              <p className="anim-bob text-7xl" aria-hidden>
                🏆
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
                {maxed ? "Level up!" : "Tutorial complete"}
              </p>
              <h2 id="tour-title" className={`mt-1 text-3xl font-bold ${HEADING}`}>
                {maxed ? "You reached Level 2!" : "You're ready!"}
              </h2>
              <p className="mt-1 text-sm text-white/70">
                {completed.filter(Boolean).length}/{QUESTS.length} quests cleared · {xp} XP earned
              </p>
              <div className="anim-pop mx-auto mt-5 flex max-w-xs items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400/20 to-fuchsia-500/20 p-3 text-left ring-1 ring-amber-300/40">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-400 text-2xl shadow-lg shadow-amber-500/30" aria-hidden>
                  🎖️
                </span>
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-widest text-amber-300">
                    Achievement unlocked
                  </span>
                  <span className={`block text-lg font-bold ${HEADING}`}>Rookie Reporter</span>
                </span>
              </div>
              <p className="mt-4 text-xs text-white/50">
                Practice XP isn't saved. Earn real points by reporting, commenting and confirming fixes.
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="relative border-t border-white/10 bg-black/20 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {victory ? (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => finish("/")} className={gameButton.plain}>
                🗺️ Explore
              </button>
              <button ref={nextRef} type="button" onClick={() => finish("/new")} className={`${gameButton.gold} anim-glow`}>
                <Shine />
                ⚡ First report
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep((s) => s - 1)} className={`${gameButton.plain} px-4`} aria-label="Back">
                  ◀
                </button>
              )}
              <button
                ref={nextRef}
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className={`${quest && !questDone ? gameButton.plain : `${gameButton.gold} ${quest ? "anim-glow" : ""}`} flex-1`}
              >
                {(!quest || questDone) && <Shine />}
                {step === 0
                  ? "▶ Start adventure"
                  : questDone
                    ? step === QUESTS.length
                      ? "🏆 Claim reward"
                      : "Next quest ▶"
                    : "Skip quest ▷"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
