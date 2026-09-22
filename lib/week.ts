import type { Recipe, ShoppingItem, PlannedDay } from "@/lib/types";

export const DAYS: { key: PlannedDay; label: string; long: string }[] = [
  { key: "mon", label: "Mon", long: "Monday" },
  { key: "tue", label: "Tue", long: "Tuesday" },
  { key: "wed", label: "Wed", long: "Wednesday" },
  { key: "thu", label: "Thu", long: "Thursday" },
  { key: "fri", label: "Fri", long: "Friday" },
  { key: "sat", label: "Sat", long: "Saturday" },
  { key: "sun", label: "Sun", long: "Sunday" },
];

const dayOrder = (d: PlannedDay | null) => (d ? DAYS.findIndex((x) => x.key === d) : 99);

/** Queue sorted by planned day (unassigned last), then by when it was added. */
export function sortQueue(recipes: Recipe[]): Recipe[] {
  return recipes
    .filter((r) => r.queued_at)
    .sort((a, b) => {
      const d = dayOrder(a.planned_day) - dayOrder(b.planned_day);
      if (d !== 0) return d;
      return (a.queued_at || "").localeCompare(b.queued_at || "");
    });
}

export function shoppingKey(recipeId: number, idx: number) {
  return `${recipeId}:${idx}`;
}

/** Flatten queued recipes into grocery lines, in queue order. */
export function buildShoppingList(queued: Recipe[], checked: Set<string>): ShoppingItem[] {
  const out: ShoppingItem[] = [];
  for (const r of queued) {
    const ings = Array.isArray(r.ingredients) ? r.ingredients : [];
    ings.forEach((ingredient, idx) => {
      out.push({
        recipeId: r.id,
        recipeTitle: r.title,
        idx,
        ingredient,
        checked: checked.has(shoppingKey(r.id, idx)),
      });
    });
  }
  return out;
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso);
  const days = Math.floor((Date.now() - then.getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
