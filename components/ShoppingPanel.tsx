"use client";

import type { ShoppingItem } from "@/lib/types";

interface ShoppingPanelProps {
  items: ShoppingItem[];
  onToggleItem: (index: number) => void;
  onClearChecked: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function ShoppingPanel({
  items,
  onToggleItem,
  onClearChecked,
  onClearAll,
  onClose,
}: ShoppingPanelProps) {
  // Group items by recipe
  const groups: Record<string, { title: string; items: { item: ShoppingItem; globalIndex: number }[] }> = {};

  items.forEach((item, i) => {
    const key = String(item.recipeId);
    if (!groups[key]) {
      groups[key] = { title: item.recipeTitle, items: [] };
    }
    groups[key].items.push({ item, globalIndex: i });
  });

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <>
      <div className="shopping-overlay" onClick={onClose} />
      <div className="shopping-panel">
        <div className="shopping-header">
          <h2>Shopping List</h2>
          <button
            className="btn btn-icon btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="shopping-body">
          {items.length === 0 ? (
            <div className="shopping-empty">
              <p>&#128722;</p>
              <p>Your shopping list is empty.</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Tap &ldquo;+ Add to list&rdquo; on a recipe card to get started.
              </p>
            </div>
          ) : (
            Object.values(groups).map((group) => (
              <div key={group.title} className="shopping-group">
                <h4>{group.title}</h4>
                {group.items.map(({ item, globalIndex }) => {
                  const label = [
                    item.ingredient.amount,
                    item.ingredient.unit,
                    item.ingredient.item,
                    item.ingredient.notes ? `(${item.ingredient.notes})` : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <div
                      key={globalIndex}
                      className={`shopping-item ${item.checked ? "checked" : ""}`}
                    >
                      <input
                        type="checkbox"
                        id={`si-${globalIndex}`}
                        checked={item.checked}
                        onChange={() => onToggleItem(globalIndex)}
                      />
                      <label htmlFor={`si-${globalIndex}`}>{label}</label>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="shopping-footer">
            <button
              className="btn btn-ghost"
              onClick={onClearChecked}
              disabled={checkedCount === 0}
            >
              Clear checked ({checkedCount})
            </button>
            <button className="btn btn-danger" onClick={onClearAll}>
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
}
