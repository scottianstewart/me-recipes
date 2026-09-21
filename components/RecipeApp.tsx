"use client";

import { useState, useCallback, useEffect } from "react";
import type { Recipe, RecipeInput, ShoppingItem } from "@/lib/types";
import { addRecipeAction, deleteRecipeAction } from "@/app/actions";
import Header from "./Header";
import RecipeCard from "./RecipeCard";
import AddRecipeModal from "./AddRecipeModal";
import ShoppingPanel from "./ShoppingPanel";

const STORAGE_KEY = "myrecipes-shopping";

function loadShopping(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveShopping(items: ShoppingItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable
  }
}

export default function RecipeApp({ recipes }: { recipes: Recipe[] }) {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [addedRecipeIds, setAddedRecipeIds] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showShopping, setShowShopping] = useState(false);

  // Hydrate shopping list from localStorage on mount
  useEffect(() => {
    const loaded = loadShopping();
    setShoppingList(loaded);
    setAddedRecipeIds(new Set(loaded.map((i) => i.recipeId)));
  }, []);

  // Persist shopping list on change
  useEffect(() => {
    saveShopping(shoppingList);
  }, [shoppingList]);

  // Lock body scroll when panels are open
  useEffect(() => {
    document.body.style.overflow = showModal || showShopping ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal, showShopping]);

  const toggleRecipeInList = useCallback((recipe: Recipe) => {
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

    setShoppingList((prev) => {
      const isAdded = prev.some((i) => i.recipeId === recipe.id);
      if (isAdded) {
        return prev.filter((i) => i.recipeId !== recipe.id);
      }
      const newItems: ShoppingItem[] = ingredients.map((ing) => ({
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        ingredient: ing,
        checked: false,
      }));
      return [...prev, ...newItems];
    });

    setAddedRecipeIds((prev) => {
      const next = new Set(prev);
      if (next.has(recipe.id)) {
        next.delete(recipe.id);
      } else {
        next.add(recipe.id);
      }
      return next;
    });
  }, []);

  const toggleShoppingItem = useCallback((index: number) => {
    setShoppingList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const clearChecked = useCallback(() => {
    setShoppingList((prev) => {
      const kept = prev.filter((i) => !i.checked);
      const keptIds = new Set(kept.map((i) => i.recipeId));
      setAddedRecipeIds(keptIds);
      return kept;
    });
  }, []);

  const clearAll = useCallback(() => {
    setShoppingList([]);
    setAddedRecipeIds(new Set());
  }, []);

  async function handleSaveRecipe(recipe: RecipeInput) {
    await addRecipeAction(recipe);
  }

  async function handleDeleteRecipe(id: number) {
    // Also remove from shopping list
    setShoppingList((prev) => prev.filter((i) => i.recipeId !== id));
    setAddedRecipeIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    await deleteRecipeAction(id);
  }

  return (
    <>
      <Header
        recipeCount={recipes.length}
        shoppingCount={shoppingList.length}
        onAddRecipe={() => setShowModal(true)}
        onOpenShopping={() => setShowShopping(true)}
      />

      <div className="recipe-grid">
        {recipes.length === 0 && (
          <div className="empty-state">
            <p>&#127859;</p>
            <p>No recipes yet</p>
            <p>Add your first recipe to get started.</p>
          </div>
        )}
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isAdded={addedRecipeIds.has(recipe.id)}
            onToggleList={toggleRecipeInList}
            onDelete={handleDeleteRecipe}
          />
        ))}
      </div>

      {showModal && (
        <AddRecipeModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveRecipe}
        />
      )}

      {showShopping && (
        <ShoppingPanel
          items={shoppingList}
          onToggleItem={toggleShoppingItem}
          onClearChecked={clearChecked}
          onClearAll={clearAll}
          onClose={() => setShowShopping(false)}
        />
      )}
    </>
  );
}
