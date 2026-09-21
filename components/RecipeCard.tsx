"use client";

import { useState } from "react";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  isAdded: boolean;
  onToggleList: (recipe: Recipe) => void;
  onDelete: (id: number) => void;
}

export default function RecipeCard({
  recipe,
  isAdded,
  onToggleList,
  onDelete,
}: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];

  return (
    <div className="recipe-card">
      <div className="card-header">
        <div className="card-title-row">
          <h3 className="card-title">{recipe.title}</h3>
        </div>
        {recipe.description && (
          <p className="card-description">{recipe.description}</p>
        )}
      </div>

      <div className="card-meta">
        {recipe.prep_time && <span>Prep: {recipe.prep_time}</span>}
        {recipe.cook_time && <span>Cook: {recipe.cook_time}</span>}
        {recipe.servings && <span>Serves: {recipe.servings}</span>}
      </div>

      {tags.length > 0 && (
        <div className="card-tags">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div className="card-expanded">
          <h4>Ingredients</h4>
          <ul className="ingredients-list">
            {ingredients.map((ing, i) => (
              <li key={i}>
                {(ing.amount || ing.unit) && (
                  <span className="ingredient-amount">
                    {[ing.amount, ing.unit].filter(Boolean).join(" ")}{" "}
                  </span>
                )}
                {ing.item}
                {ing.notes && (
                  <span className="ingredient-notes"> ({ing.notes})</span>
                )}
              </li>
            ))}
          </ul>

          <h4>Steps</h4>
          <ol className="steps-list">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {confirming ? (
        <div className="confirm-bar">
          <span>Delete this recipe?</span>
          <button
            className="btn btn-danger"
            style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}
            onClick={() => {
              onDelete(recipe.id);
              setConfirming(false);
            }}
          >
            Yes, delete
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="card-actions">
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? "Collapse" : "View Recipe"}
          </button>
          <button
            className={`add-btn ${isAdded ? "added" : ""}`}
            onClick={() => onToggleList(recipe)}
          >
            {isAdded ? "- Remove from list" : "+ Add to list"}
          </button>
          {recipe.source_url && (
            <button
              className="source-btn"
              onClick={() => window.open(recipe.source_url!, "_blank")}
            >
              Source
            </button>
          )}
          <button className="delete-btn" onClick={() => setConfirming(true)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
