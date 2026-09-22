"use client";

import Link from "next/link";
import type { Recipe, PlannedDay } from "@/lib/types";
import { colorClass, totalTime } from "@/lib/ui";
import { DAYS } from "@/lib/week";
import { FlameIcon, ClockIcon, PeopleIcon } from "./Icons";

interface QueueStripProps {
  queued: Recipe[];
  remaining: number;
  onRemove: (recipe: Recipe) => void;
  onSetDay: (id: number, day: PlannedDay | null) => void;
  onOpenShopping: () => void;
  onClear: () => void;
}

export default function QueueStrip({
  queued,
  remaining,
  onRemove,
  onSetDay,
  onOpenShopping,
  onClear,
}: QueueStripProps) {
  if (queued.length === 0) return null;

  return (
    <section className="week" aria-labelledby="week-title">
      <div className="week-head">
        <div className="week-head-text">
          <h2 id="week-title" className="week-title">This week</h2>
          <div className="week-sub">
            <span>{queued.length} {queued.length === 1 ? "recipe" : "recipes"} planned</span>
            {remaining > 0 ? (
              <button className="week-buy" onClick={onOpenShopping}>
                {remaining} {remaining === 1 ? "thing" : "things"} to buy
              </button>
            ) : (
              <span className="week-buy done">Everything&apos;s in the kitchen</span>
            )}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>Clear week</button>
      </div>

      <div className="week-row">
        {queued.map((r) => {
          const tone = colorClass(r.title);
          const time = totalTime(r.prep_time, r.cook_time);
          const dayLabel = DAYS.find((d) => d.key === r.planned_day)?.long;
          return (
            <article key={r.id} className="week-card">
              {/* Stretched link: the whole card opens the recipe. Controls below sit above it. */}
              <Link href={`/recipes/${r.id}`} className="week-link" aria-label={`Open ${r.title}`} />

              <div className="week-media">
                {r.image_url ? (
                  <img src={r.image_url} alt="" />
                ) : (
                  <div className={`card-placeholder ${tone}`}>
                    <span>{r.title.trim().charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>

              <div className="week-body">
                <h3 className="week-name">{r.title}</h3>
                <div className="week-meta">
                  {dayLabel && <span className="week-day-pill">{dayLabel}</span>}
                  {time && <span className="week-meta-item"><ClockIcon size={13} /> {time}</span>}
                  {r.servings && <span className="week-meta-item"><PeopleIcon size={13} /> {r.servings}</span>}
                </div>
              </div>

              <div className="week-foot">
                <select
                  className="day-select"
                  value={r.planned_day ?? ""}
                  onChange={(e) => onSetDay(r.id, (e.target.value || null) as PlannedDay | null)}
                  aria-label={`Day for ${r.title}`}
                >
                  <option value="">Any day</option>
                  {DAYS.map((d) => (
                    <option key={d.key} value={d.key}>{d.long}</option>
                  ))}
                </select>
                <Link href={`/recipes/${r.id}/cook`} className="btn btn-primary week-cook">
                  <FlameIcon size={15} /> Cook
                </Link>
                <button className="btn btn-ghost week-remove" onClick={() => onRemove(r)}>
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
