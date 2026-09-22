"use client";

import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { colorClass, totalTime } from "@/lib/ui";
import { formatRelativeDate } from "@/lib/week";
import { ClockIcon, PeopleIcon, CalendarPlusIcon, CalendarCheckIcon } from "./Icons";

interface RecipeCardProps {
  recipe: Recipe;
  isQueued: boolean;
  onToggleQueue: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, isQueued, onToggleQueue }: RecipeCardProps) {
  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
  const time = totalTime(recipe.prep_time, recipe.cook_time);
  const tone = colorClass(recipe.title);

  return (
    <article className={`recipe-card ${isQueued ? "queued" : ""}`}>
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
          className={`card-list-btn ${isQueued ? "added" : ""}`}
          onClick={() => onToggleQueue(recipe)}
          aria-label={isQueued ? "Remove from this week" : "Add to this week"}
          title={isQueued ? "Planned this week" : "Add to this week"}
        >
          {isQueued ? <CalendarCheckIcon size={18} /> : <CalendarPlusIcon size={18} />}
        </button>
        {isQueued && <span className="card-flag">This week</span>}
      </div>

      <div className="card-body">
        <h3 className="card-title">
          <Link href={`/recipes/${recipe.id}`}>{recipe.title}</Link>
        </h3>
        {recipe.description && <p className="card-desc">{recipe.description}</p>}

        {(time || recipe.servings || recipe.times_cooked > 0) && (
          <div className="meta-row">
            {time && <span className="meta-pill"><ClockIcon /> {time}</span>}
            {recipe.servings && <span className="meta-pill"><PeopleIcon /> {recipe.servings}</span>}
            {recipe.times_cooked > 0 && (
              <span className="meta-pill" title={`Last cooked ${formatRelativeDate(recipe.last_cooked_at)}`}>
                Cooked {recipe.times_cooked}&times;
              </span>
            )}
          </div>
        )}

        {tags.length > 0 && (
          <div className="card-tags">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={`tag ${colorClass(tag)}`}>{tag}</span>
            ))}
            {tags.length > 3 && <span className="tag">+{tags.length - 3}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
