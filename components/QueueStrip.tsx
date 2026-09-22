"use client";

import Link from "next/link";
import type { Recipe, PlannedDay } from "@/lib/types";
import { colorClass, totalTime } from "@/lib/ui";
import { DAYS } from "@/lib/week";
import { FlameIcon, CloseIcon, ClockIcon } from "./Icons";

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
        <div>
          <h2 id="week-title" className="week-title">This week</h2>
          <p className="week-sub">
            {queued.length} {queued.length === 1 ? "recipe" : "recipes"} planned
            {remaining > 0 ? (
              <>
                {" "}&middot;{" "}
                <button className="link-btn" onClick={onOpenShopping}>
                  {remaining} {remaining === 1 ? "thing" : "things"} to buy
                </button>
              </>
            ) : (
              <> &middot; everything&apos;s in the kitchen</>
            )}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>Clear week</button>
      </div>

      <div className="week-row">
        {queued.map((r) => {
          const tone = colorClass(r.title);
          const time = totalTime(r.prep_time, r.cook_time);
          return (
            <div key={r.id} className="week-card">
              <Link href={`/recipes/${r.id}`} className="week-media" aria-label={r.title}>
                {r.image_url ? (
                  <img src={r.image_url} alt="" />
                ) : (
                  <div className={`card-placeholder ${tone}`}>
                    <span>{r.title.trim().charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </Link>
              <div className="week-body">
                <Link href={`/recipes/${r.id}`} className="week-name">{r.title}</Link>
                <div className="week-meta">
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
                  {time && <span className="week-time"><ClockIcon size={12} /> {time}</span>}
                </div>
                <div className="week-actions">
                  <Link href={`/recipes/${r.id}/cook`} className="btn btn-primary btn-sm">
                    <FlameIcon size={14} /> Cook
                  </Link>
                  <button
                    className="btn btn-icon btn-ghost btn-xs"
                    onClick={() => onRemove(r)}
                    aria-label={`Remove ${r.title} from this week`}
                    title="Remove from this week"
                  >
                    <CloseIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
