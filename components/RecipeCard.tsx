"use client";

import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { colorClass, totalTime } from "@/lib/ui";
import { ClockIcon, PeopleIcon, PlusIcon, CheckIcon } from "./Icons";

interface RecipeCardProps {
  recipe: Recipe;
  isAdded: boolean;
  onToggleList: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, isAdded, onToggleList }: RecipeCardProps) {
  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
  const time = totalTime(recipe.prep_time, recipe.cook_time);
  const tone = colorClass(recipe.title);

  return (
    <article className="recipe-card">
      <div className="card-media">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt="" loading="lazy" />
        ) : (
          <div className={`card-placeholder ${tone}`}>
            <span>{recipe.title.trim().charAt(0).toUpperCase()}</span>
          </div>
        )}
        <button
          type="button"
          className={`card-list-btn ${isAdded ? "added" : ""}`}
          onClick={() => onToggleList(recipe)}
          aria-label={isAdded ? "Remove from shopping list" : "Add to shopping list"}
          title={isAdded ? "On your list" : "Add to shopping list"}
        >
          {isAdded ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
        </button>
      </div>

      <div className="card-body">
        <h3 className="card-title">
          <Link href={`/recipes/${recipe.id}`}>{recipe.title}</Link>
        </h3>
        {recipe.description && <p className="card-desc">{recipe.description}</p>}

        {(time || recipe.servings) && (
          <div className="meta-row">
            {time && (
              <span className="meta-pill">
                <ClockIcon /> {time}
              </span>
            )}
            {recipe.servings && (
              <span className="meta-pill">
                <PeopleIcon /> {recipe.servings}
              </span>
            )}
          </div>
        )}

        {tags.length > 0 && (
          <div className="card-tags">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={`tag ${colorClass(tag)}`}>
                {tag}
              </span>
            ))}
            {tags.length > 3 && <span className="tag">+{tags.length - 3}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
