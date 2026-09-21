"use client";

interface HeaderProps {
  recipeCount: number;
  shoppingCount: number;
  onAddRecipe: () => void;
  onOpenShopping: () => void;
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
        <h1 className="app-title">My Recipes</h1>
        <p className="app-subtitle">
          {recipeCount} recipe{recipeCount !== 1 ? "s" : ""} saved
        </p>
      </div>
      <div className="header-actions">
        <button className="btn btn-ghost" onClick={onOpenShopping}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Shopping List
          {shoppingCount > 0 && <span className="badge">{shoppingCount}</span>}
        </button>
        <button className="btn btn-action" onClick={onAddRecipe}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Recipe
        </button>
      </div>
    </header>
  );
}
