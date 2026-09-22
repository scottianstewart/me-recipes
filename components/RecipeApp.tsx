"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Recipe, RecipeInput } from "@/lib/types";
import { addRecipeAction } from "@/app/actions";
import { colorClass } from "@/lib/ui";
import { useWeek } from "@/lib/useWeek";
import { useToast } from "@/lib/useToast";
import Header from "./Header";
import QueueStrip from "./QueueStrip";
import RecipeCard from "./RecipeCard";
import AddRecipeModal from "./AddRecipeModal";
import ShoppingPanel from "./ShoppingPanel";
import { SearchIcon, PotIcon, PlusIcon } from "./Icons";

interface RecipeAppProps {
  recipes: Recipe[];
  checkedKeys: string[];
}

export default function RecipeApp({ recipes, checkedKeys }: RecipeAppProps) {
  const week = useWeek({ recipes, checkedKeys });
  const { toast, show } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showShopping, setShowShopping] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const anyOverlay = showModal || showShopping;
  useEffect(() => {
    document.body.style.overflow = anyOverlay ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [anyOverlay]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => Array.isArray(r.tags) && r.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [recipes]);

  const filtered = useMemo(() => {
    let out = recipes;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (Array.isArray(r.tags) && r.tags.some((t) => t.toLowerCase().includes(q))) ||
          (Array.isArray(r.ingredients) && r.ingredients.some((i) => i.item.toLowerCase().includes(q)))
      );
    }
    if (activeTag) out = out.filter((r) => Array.isArray(r.tags) && r.tags.includes(activeTag));
    return out;
  }, [recipes, search, activeTag]);

  const toggleQueue = useCallback(
    async (recipe: Recipe) => {
      const queued = await week.toggleQueue(recipe);
      show(queued ? `${recipe.title} is on for this week` : `Took ${recipe.title} off this week`);
    },
    [week, show]
  );

  async function handleSaveRecipe(recipe: RecipeInput) {
    await addRecipeAction(recipe);
    show(`Saved ${recipe.title}`);
  }

  const closeModal = useCallback(() => setShowModal(false), []);
  const closeShopping = useCallback(() => setShowShopping(false), []);

  return (
    <div className="app-shell">
      <Header
        recipeCount={recipes.length}
        shoppingRemaining={week.remaining}
        onAddRecipe={() => setShowModal(true)}
        onOpenShopping={() => setShowShopping(true)}
      />

      <QueueStrip
        queued={week.queued}
        remaining={week.remaining}
        onRemove={toggleQueue}
        onSetDay={week.setDay}
        onOpenShopping={() => setShowShopping(true)}
        onClear={async () => {
          await week.clearWeek();
          show("Cleared this week");
        }}
      />

      {recipes.length > 0 && (
        <div className="filters-bar">
          <div className="search-wrap">
            <SearchIcon className="search-icon" size={18} />
            <input
              id="recipe-search"
              type="search"
              className="search-input"
              placeholder="Search by name, tag or ingredient"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {allTags.length > 0 && (
            <div className="tag-filters">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag ${colorClass(tag)} ${activeTag === tag ? "active" : ""}`}
                  aria-pressed={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {recipes.length === 0 && (
        <div className="empty-state">
          <div className="blob"><PotIcon size={44} /></div>
          <h2>Nothing cooking yet</h2>
          <p>Paste a recipe from anywhere and it&apos;ll get tidied into a proper card, photo optional.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <PlusIcon size={16} /> Add your first recipe
          </button>
        </div>
      )}

      {recipes.length > 0 && filtered.length === 0 && (
        <div className="empty-state">
          <h2>No luck</h2>
          <p>Nothing matches that. Try a different word, or clear the filter.</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearch("");
              setActiveTag(null);
            }}
          >
            Show everything
          </button>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="recipe-grid">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isQueued={week.queuedIds.has(recipe.id)}
              onToggleQueue={toggleQueue}
            />
          ))}
        </div>
      )}

      {showModal && <AddRecipeModal onClose={closeModal} onSave={handleSaveRecipe} />}

      {showShopping && (
        <ShoppingPanel
          items={week.shopping}
          onToggleItem={week.toggleCheck}
          onUncheckAll={week.uncheckAll}
          onClose={closeShopping}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
