"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/lib/types";
import { completeCookAction } from "@/app/actions";
import { ingredientsInStep, timersInStep, formatDuration, formatDurationWords } from "@/lib/cook";
import {
  CloseIcon,
  TimerIcon,
  PauseIcon,
  PlayIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlameIcon,
} from "./Icons";

interface Timer {
  id: number;
  label: string;
  step: number; // 1-based step it was started from
  total: number;
  remaining: number;
  endsAt: number | null; // null when paused
  done: boolean;
}

/* iOS only lets audio start from a user gesture, so the context is created when a
   timer is started (a tap) and reused when it rings later. */
let audioCtx: AudioContext | null = null;
function primeAudio() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  } catch {
    // no audio
  }
}

/* Kitchen-safe beep: three short tones via WebAudio, plus vibration where supported. */
function chime() {
  try {
    primeAudio();
    const ctx = audioCtx;
    if (!ctx) throw new Error("no audio");
    [0, 0.18, 0.36].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.15);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.16);
    });
  } catch {
    // no audio, fine
  }
  try {
    navigator.vibrate?.([200, 100, 200]);
  } catch {
    // no vibration
  }
}

export default function CookMode({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const total = steps.length;

  // phase 0 = mise en place, 1..total = steps, total+1 = wrap up
  const [phase, setPhase] = useState(0);
  const [gathered, setGathered] = useState<Set<number>>(new Set());
  const [timers, setTimers] = useState<Timer[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const nextId = useRef(1);
  const baseTitle = useRef<string>("");

  const stepText = phase >= 1 && phase <= total ? steps[phase - 1] : "";
  const stepIngredients = useMemo(
    () => (stepText ? ingredientsInStep(stepText, ingredients) : []),
    [stepText, ingredients]
  );
  const stepTimers = useMemo(() => (stepText ? timersInStep(stepText) : []), [stepText]);

  /* ---- navigation ---- */
  const goNext = useCallback(() => setPhase((p) => Math.min(total + 1, p + 1)), [total]);
  const goPrev = useCallback(() => setPhase((p) => Math.max(0, p - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT")) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  /* ---- keep the screen on ---- */
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const request = async () => {
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
        if (nav.wakeLock && document.visibilityState === "visible") lock = await nav.wakeLock.request("screen");
      } catch {
        // not supported or denied
      }
    };
    request();
    const onVis = () => {
      if (document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => {});
    };
  }, []);

  /* ---- timers ---- */
  const startTimer = useCallback(
    (seconds: number, label: string) => {
      primeAudio();
      setTimers((prev) => [
        ...prev,
        {
          id: nextId.current++,
          label,
          step: phase,
          total: seconds,
          remaining: seconds,
          endsAt: Date.now() + seconds * 1000,
          done: false,
        },
      ]);
    },
    [phase]
  );

  const toggleTimer = (id: number) =>
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.done) return t;
        return t.endsAt
          ? { ...t, endsAt: null } // pause
          : { ...t, endsAt: Date.now() + t.remaining * 1000 }; // resume
      })
    );

  const dismissTimer = (id: number) => setTimers((prev) => prev.filter((t) => t.id !== id));

  // Tick running timers. Side effects (the chime) happen outside the state updater
  // so React's dev-mode double invocation can't ring it twice.
  const timersRef = useRef(timers);
  timersRef.current = timers;
  const anyRunning = timers.some((t) => !t.done && t.endsAt !== null);

  useEffect(() => {
    if (!anyRunning) return;
    const tick = () => {
      const now = Date.now();
      let fired = false;
      let changed = false;
      const next = timersRef.current.map((t) => {
        if (t.done || !t.endsAt) return t;
        const remaining = Math.max(0, Math.round((t.endsAt - now) / 1000));
        if (remaining === t.remaining) return t;
        changed = true;
        if (remaining === 0) {
          fired = true;
          return { ...t, remaining: 0, done: true, endsAt: null };
        }
        return { ...t, remaining };
      });
      if (changed) setTimers(next);
      if (fired) chime();
    };
    const iv = setInterval(tick, 250);
    return () => clearInterval(iv);
  }, [anyRunning]);

  // Flash the tab title while a finished timer is waiting to be dismissed.
  const anyDone = timers.some((t) => t.done);
  useEffect(() => {
    if (!baseTitle.current) baseTitle.current = document.title;
    if (!anyDone) {
      document.title = baseTitle.current;
      return;
    }
    let on = false;
    const iv = setInterval(() => {
      on = !on;
      document.title = on ? "Timer done!" : baseTitle.current;
    }, 800);
    return () => {
      clearInterval(iv);
      document.title = baseTitle.current;
    };
  }, [anyDone]);

  const activeTimers = timers;

  /* ---- finish ---- */
  async function finish() {
    setSaving(true);
    await completeCookAction(recipe.id, note);
    router.push(`/recipes/${recipe.id}`);
  }

  const progress = total === 0 ? 1 : Math.min(1, phase / (total + 1));

  return (
    <div className="cook">
      <header className="cook-top">
        <Link href={`/recipes/${recipe.id}`} className="btn btn-icon btn-ghost" aria-label="Leave cooking mode">
          <CloseIcon />
        </Link>
        <div className="cook-title">
          <span className="cook-recipe">{recipe.title}</span>
          <span className="cook-where">
            {phase === 0 ? "Mise en place" : phase > total ? "All done" : `Step ${phase} of ${total}`}
          </span>
        </div>
        <div className="cook-progress" aria-hidden="true">
          <div className="cook-progress-bar" style={{ width: `${progress * 100}%` }} />
        </div>
      </header>

      <main className="cook-body">
        {phase === 0 && (
          <section className="cook-pane">
            <p className="cook-eyebrow">Before you start</p>
            <h1 className="cook-heading">Get everything out and prepped</h1>
            <p className="cook-lead">
              Tap each one as it&apos;s ready on the counter. Measured, chopped, opened, whatever the recipe asks for.
            </p>
            <ul className="mise-list">
              {ingredients.map((ing, i) => {
                const on = gathered.has(i);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      className={`mise-item ${on ? "on" : ""}`}
                      aria-pressed={on}
                      onClick={() =>
                        setGathered((prev) => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i);
                          else next.add(i);
                          return next;
                        })
                      }
                    >
                      <span className="mise-check"><CheckIcon size={14} /></span>
                      <span className="mise-text">
                        {(ing.amount || ing.unit) && (
                          <strong>{[ing.amount, ing.unit].filter(Boolean).join(" ")} </strong>
                        )}
                        {ing.item}
                        {ing.notes && <span className="ingredient-notes">, {ing.notes}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mise-count">
              {gathered.size} of {ingredients.length} ready
            </p>
          </section>
        )}

        {phase >= 1 && phase <= total && (
          <section className="cook-pane" key={phase}>
            <p className="cook-eyebrow">Step {phase}</p>
            <p className="cook-step">{stepText}</p>

            {stepIngredients.length > 0 && (
              <div className="cook-needs">
                <span className="cook-needs-label">You&apos;ll need</span>
                <div className="cook-chips">
                  {stepIngredients.map((i) => {
                    const ing = ingredients[i];
                    return (
                      <span key={i} className="cook-chip">
                        {[ing.amount, ing.unit].filter(Boolean).join(" ")} {ing.item}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {stepTimers.length > 0 && (
              <div className="cook-timer-suggest">
                {stepTimers.map((t) => {
                  const running = timers.some((x) => x.step === phase && x.total === t.seconds && !x.done);
                  return (
                    <button
                      key={t.seconds}
                      className="btn btn-secondary"
                      disabled={running}
                      onClick={() => startTimer(t.seconds, `Step ${phase}: ${formatDurationWords(t.seconds)}`)}
                    >
                      <TimerIcon size={15} />
                      {running ? `${formatDurationWords(t.seconds)} running` : `Start ${formatDurationWords(t.seconds)} timer`}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {phase > total && (
          <section className="cook-pane cook-done">
            <div className="cook-done-mark"><FlameIcon size={32} /></div>
            <h1 className="cook-heading">That&apos;s dinner.</h1>
            <p className="cook-lead">
              Marking it cooked logs it and takes it off this week. Leave yourself a note if anything&apos;s worth remembering.
            </p>
            <textarea
              id="cook-note"
              className="textarea cook-note"
              placeholder="Next time: less salt, double the garlic, took 40 min not 30..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="cook-done-actions">
              <button className="btn btn-primary" onClick={finish} disabled={saving}>
                <CheckIcon size={16} /> {saving ? "Saving..." : "Mark as cooked"}
              </button>
              <Link href={`/recipes/${recipe.id}`} className="btn btn-ghost">Not today</Link>
            </div>
          </section>
        )}
      </main>

      {activeTimers.length > 0 && (
        <div className="timer-dock" role="status" aria-live="polite">
          {activeTimers.map((t) => (
            <div key={t.id} className={`timer-card ${t.done ? "done" : ""} ${t.endsAt ? "" : "paused"}`}>
              <div className="timer-info">
                <span className="timer-time">{t.done ? "Done" : formatDuration(t.remaining)}</span>
                <span className="timer-label">{t.label}</span>
              </div>
              {!t.done && (
                <button className="btn btn-icon btn-ghost" onClick={() => toggleTimer(t.id)} aria-label={t.endsAt ? "Pause timer" : "Resume timer"}>
                  {t.endsAt ? <PauseIcon /> : <PlayIcon />}
                </button>
              )}
              <button className="btn btn-icon btn-ghost" onClick={() => dismissTimer(t.id)} aria-label="Dismiss timer">
                <CloseIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {phase <= total && (
        <nav className="cook-nav">
          <button className="btn btn-secondary cook-nav-btn" onClick={goPrev} disabled={phase === 0}>
            <ChevronLeftIcon /> Back
          </button>
          <button className="btn btn-primary cook-nav-btn" onClick={goNext}>
            {phase === 0 ? "Everything's out" : phase === total ? "Finished" : "Next step"}
            <ChevronRightIcon />
          </button>
        </nav>
      )}
    </div>
  );
}
