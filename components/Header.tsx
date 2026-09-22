"use client";

import { BasketIcon, PlusIcon } from "./Icons";

interface HeaderProps {
  recipeCount: number;
  shoppingCount: number;
  onAddRecipe: () => void;
  onOpenShopping: () => void;
}

function subtitle(n: number) {
  if (n === 0) return "Nothing saved yet";
  if (n === 1) return "1 recipe, a promising start";
  if (n < 5) return `${n} recipes and counting`;
  if (n < 20) return `${n} recipes in the book`;
  return `${n} recipes. That's a proper cookbook.`;
}

export default function Header({
  recipeCount,
  shoppingCount,
  onAddRecipe,
  onOpenShopping,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <h1 className="app-title">
          My Recipes<span className="dot">.</span>
        </h1>
        <p className="app-subtitle">{subtitle(recipeCount)}</p>
      </div>
      <div className="header-actions">
        <button className="btn btn-secondary" onClick={onOpenShopping}>
          <BasketIcon size={17} />
          Shopping list
          {shoppingCount > 0 && <span className="count-bubble">{shoppingCount}</span>}
        </button>
        <button className="btn btn-primary" onClick={onAddRecipe}>
          <PlusIcon size={16} />
          Add a recipe
        </button>
      </div>
    </header>
  );
}
