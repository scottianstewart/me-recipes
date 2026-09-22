"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe, PlannedDay } from "@/lib/types";
import {
  toggleQueueAction,
  setPlannedDayAction,
  setShoppingCheckAction,
  uncheckAllShoppingAction,
  clearQueueAction,
} from "@/app/actions";
import { buildShoppingList, shoppingKey, sortQueue } from "@/lib/week";

interface UseWeekArgs {
  /** All recipes the page knows about (home) or just the queued ones (detail). */
  recipes: Recipe[];
  checkedKeys: string[];
}

/**
 * Client-side view of "this week": which recipes are queued, which grocery lines
 * are checked. Optimistic updates, server actions behind them, router.refresh()
 * to pull the truth back in.
 */
export function useWeek({ recipes, checkedKeys }: UseWeekArgs) {
  const router = useRouter();
  const [queuedIds, setQueuedIds] = useState<Set<number>>(
    () => new Set(recipes.filter((r) => r.queued_at).map((r) => r.id))
  );
  const [days, setDays] = useState<Map<number, PlannedDay | null>>(
    () => new Map(recipes.map((r) => [r.id, r.planned_day]))
  );
  const [checked, setChecked] = useState<Set<string>>(() => new Set(checkedKeys));

  // Resync when the server sends fresh props (after refresh/navigation).
  useEffect(() => {
    setQueuedIds(new Set(recipes.filter((r) => r.queued_at).map((r) => r.id)));
    setDays(new Map(recipes.map((r) => [r.id, r.planned_day])));
  }, [recipes]);
  useEffect(() => {
    setChecked(new Set(checkedKeys));
  }, [checkedKeys]);

  const queued = useMemo(
    () =>
      sortQueue(
        recipes
          .filter((r) => queuedIds.has(r.id))
          .map((r) => ({ ...r, queued_at: r.queued_at ?? new Date().toISOString(), planned_day: days.get(r.id) ?? null }))
      ),
    [recipes, queuedIds, days]
  );

  const shopping = useMemo(() => buildShoppingList(queued, checked), [queued, checked]);
  const remaining = shopping.filter((i) => !i.checked).length;

  const toggleQueue = useCallback(
    async (recipe: Recipe): Promise<boolean> => {
      const willQueue = !queuedIds.has(recipe.id);
      setQueuedIds((prev) => {
        const next = new Set(prev);
        if (willQueue) next.add(recipe.id);
        else next.delete(recipe.id);
        return next;
      });
      if (!willQueue) {
        setChecked((prev) => {
          const next = new Set(prev);
          for (const k of prev) if (k.startsWith(`${recipe.id}:`)) next.delete(k);
          return next;
        });
      }
      await toggleQueueAction(recipe.id);
      router.refresh();
      return willQueue;
    },
    [queuedIds, router]
  );

  const setDay = useCallback(
    async (id: number, day: PlannedDay | null) => {
      setDays((prev) => new Map(prev).set(id, day));
      await setPlannedDayAction(id, day);
      router.refresh();
    },
    [router]
  );

  const toggleCheck = useCallback(async (recipeId: number, idx: number) => {
    const key = shoppingKey(recipeId, idx);
    let nowChecked = false;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else {
        next.add(key);
        nowChecked = true;
      }
      return next;
    });
    await setShoppingCheckAction(recipeId, idx, nowChecked);
  }, []);

  const uncheckAll = useCallback(async () => {
    setChecked(new Set());
    await uncheckAllShoppingAction();
    router.refresh();
  }, [router]);

  const clearWeek = useCallback(async () => {
    setQueuedIds(new Set());
    setChecked(new Set());
    await clearQueueAction();
    router.refresh();
  }, [router]);

  return { queuedIds, queued, shopping, remaining, toggleQueue, setDay, toggleCheck, uncheckAll, clearWeek };
}
