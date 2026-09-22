"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Recipe, ShoppingItem } from "@/lib/types";

const STORAGE_KEY = "myrecipes-shopping";

function load(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: ShoppingItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable
  }
}

/** Shopping list state, shared across pages via localStorage. */
export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(items);
  }, [items, hydrated]);

  const addedIds = useMemo(() => new Set(items.map((i) => i.recipeId)), [items]);

  /** Adds or removes a whole recipe. Returns the number of ingredients added, or 0 if removed. */
  const toggleRecipe = useCallback(
    (recipe: Recipe): number => {
      const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
      const isAdded = items.some((i) => i.recipeId === recipe.id);
      if (isAdded) {
        setItems((prev) => prev.filter((i) => i.recipeId !== recipe.id));
        return 0;
      }
      setItems((prev) => [
        ...prev,
        ...ingredients.map((ing) => ({
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          ingredient: ing,
          checked: false,
        })),
      ]);
      return ingredients.length;
    },
    [items]
  );

  const toggleItem = useCallback((index: number) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, checked: !it.checked } : it)));
  }, []);

  const removeRecipe = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.recipeId !== id));
  }, []);

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.checked));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  return { items, addedIds, toggleRecipe, toggleItem, removeRecipe, clearChecked, clearAll };
}
