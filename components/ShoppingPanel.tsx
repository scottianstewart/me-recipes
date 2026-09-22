"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { ShoppingItem } from "@/lib/types";
import { BasketIcon, CloseIcon } from "./Icons";

interface ShoppingPanelProps {
  items: ShoppingItem[];
  onToggleItem: (recipeId: number, idx: number) => void;
  onUncheckAll: () => void;
  onClose: () => void;
}

export default function ShoppingPanel({ items, onToggleItem, onUncheckAll, onClose }: ShoppingPanelProps) {
  const groups = new Map<number, { title: string; items: ShoppingItem[] }>();
  for (const item of items) {
    if (!groups.has(item.recipeId)) groups.set(item.recipeId, { title: item.recipeTitle, items: [] });
    groups.get(item.recipeId)!.items.push(item);
  }

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
              <p className="lead">Nothing to buy yet</p>
              <p>Add a recipe to this week and its ingredients will show up here.</p>
            </div>
          ) : (
            Array.from(groups.entries()).map(([recipeId, group]) => (
              <div key={recipeId} className="shopping-group">
                <h4>
                  <Link href={`/recipes/${recipeId}`}>{group.title}</Link>
                </h4>
                {group.items.map((item) => {
                  const id = `si-${item.recipeId}-${item.idx}`;
                  const label = [item.ingredient.amount, item.ingredient.unit, item.ingredient.item]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <div key={id} className={`shopping-item ${item.checked ? "checked" : ""}`}>
                      <input
                        type="checkbox"
                        id={id}
                        checked={item.checked}
                        onChange={() => onToggleItem(item.recipeId, item.idx)}
                      />
                      <label htmlFor={id}>
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
            <button className="btn btn-secondary" onClick={onUncheckAll} disabled={checkedCount === 0}>
              Uncheck all{checkedCount > 0 ? ` (${checkedCount})` : ""}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
