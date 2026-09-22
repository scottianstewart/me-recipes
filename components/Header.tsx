"use client";

import { BasketIcon, PlusIcon } from "./Icons";

interface HeaderProps {
  recipeCount: number;
  shoppingRemaining: number;
  onAddRecipe: () => void;
  onOpenShopping: () => void;
}

export default function Header({ recipeCount, shoppingRemaining, onAddRecipe, onOpenShopping }: HeaderProps) {
  return (
    <header className="app-header">
      <p className="recipe-count">
        {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
      </p>
      <div className="header-actions">
        <button className="btn btn-secondary" onClick={onOpenShopping}>
          <BasketIcon size={17} />
          Shopping list
          {shoppingRemaining > 0 && <span className="count-bubble">{shoppingRemaining}</span>}
        </button>
        <button className="btn btn-primary" onClick={onAddRecipe}>
          <PlusIcon size={16} />
          Add a recipe
        </button>
      </div>
    </header>
  );
}
