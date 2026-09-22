"use client";

import { useEffect } from "react";
import type { ShoppingItem } from "@/lib/types";
import { BasketIcon, CloseIcon } from "./Icons";

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
  const groups: Record<string, { title: string; items: { item: ShoppingItem; globalIndex: number }[] }> = {};

  items.forEach((item, i) => {
    const key = String(item.recipeId);
    if (!groups[key]) groups[key] = { title: item.recipeTitle, items: [] };
    groups[key].items.push({ item, globalIndex: i });
  });

  const checkedCount = items.filter((i) => i.checked).length;
  const remaining = items.length - checkedCount;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="shopping-overlay" onClick={onClose} />
      <aside className="shopping-panel" role="dialog" aria-modal="true" aria-label="Shopping list">
        <div className="shopping-header">
          <div>
            <h2>Shopping list</h2>
            {items.length > 0 && (
              <p>
                {remaining === 0
                  ? "All done, nice work"
                  : `${remaining} thing${remaining === 1 ? "" : "s"} still to grab`}
              </p>
            )}
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="shopping-body">
          {items.length === 0 ? (
            <div className="shopping-empty">
              <div className="blob"><BasketIcon size={30} /></div>
              <p className="lead">Nothing on the list yet</p>
              <p>Tap the + on any recipe and its ingredients will land here.</p>
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
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <div key={globalIndex} className={`shopping-item ${item.checked ? "checked" : ""}`}>
                      <input
                        type="checkbox"
                        id={`si-${globalIndex}`}
                        checked={item.checked}
                        onChange={() => onToggleItem(globalIndex)}
                      />
                      <label htmlFor={`si-${globalIndex}`}>
                        {label}
                        {item.ingredient.notes && (
                          <span className="ingredient-notes">, {item.ingredient.notes}</span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="shopping-footer">
            <button className="btn btn-secondary" onClick={onClearChecked} disabled={checkedCount === 0}>
              Clear checked{checkedCount > 0 ? ` (${checkedCount})` : ""}
            </button>
            <button className="btn btn-danger" onClick={onClearAll}>
              Clear all
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
