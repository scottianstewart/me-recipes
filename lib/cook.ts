import type { Ingredient } from "@/lib/types";

const STOP = new Set([
  "and", "or", "the", "of", "for", "with", "fresh", "large", "small", "medium", "ground",
  "chopped", "diced", "minced", "sliced", "cup", "cups", "tbsp", "tsp", "can", "cans",
  "grated", "finely", "freshly", "cracked", "shredded", "kosher", "plus", "more", "your",
  "extra", "virgin", "whole", "dried", "frozen", "cooked", "raw", "red", "white", "black",
  "green", "yellow", "long", "grain", "all", "purpose", "unsalted", "salted", "to", "taste",
]);

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z\s-]/g, " ")
    .split(/[\s-]+/)
    .map((w) => w.replace(/(es|s)$/i, ""))
    .filter((w) => w.length >= 3 && !STOP.has(w));
}

/** Indexes of ingredients that a step text mentions. Loose word matching, good enough for a kitchen. */
export function ingredientsInStep(step: string, ingredients: Ingredient[]): number[] {
  const stepWords = new Set(words(step));
  const hits: number[] = [];
  ingredients.forEach((ing, i) => {
    const ws = words(ing.item);
    if (ws.length === 0) return;
    // Prefer the head noun (last word); fall back to any distinctive word.
    const head = ws[ws.length - 1];
    if (stepWords.has(head) || ws.some((w) => w.length >= 5 && stepWords.has(w))) hits.push(i);
  });
  return hits;
}

export interface TimerSuggestion {
  label: string;
  seconds: number;
}

const TIMER_RE =
  /(\d+(?:\.\d+)?)(?:\s*(?:-|–|to)\s*(\d+(?:\.\d+)?))?\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\b/gi;

/** Durations mentioned in a step, using the top of any range. */
export function timersInStep(step: string): TimerSuggestion[] {
  const out: TimerSuggestion[] = [];
  const seen = new Set<number>();
  for (const m of step.matchAll(TIMER_RE)) {
    const n = parseFloat(m[2] ?? m[1]);
    const unit = m[3].toLowerCase();
    let seconds = n;
    if (unit.startsWith("min")) seconds = n * 60;
    else if (unit.startsWith("h")) seconds = n * 3600;
    seconds = Math.round(seconds);
    if (seconds < 10 || seconds > 6 * 3600 || seen.has(seconds)) continue;
    seen.add(seconds);
    out.push({ label: formatDuration(seconds), seconds });
  }
  return out;
}

export function formatDuration(total: number): string {
  const s = Math.max(0, Math.round(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function formatDurationWords(total: number): string {
  const m = Math.round(total / 60);
  if (total < 60) return `${total} sec`;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} hr ${r} min` : `${h} hr`;
}
