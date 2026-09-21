"use client";

import { useState } from "react";
import type { RecipeInput, Ingredient } from "@/lib/types";

interface AddRecipeModalProps {
  onClose: () => void;
  onSave: (recipe: RecipeInput) => Promise<void>;
}

type ModalStep = "paste" | "parsing" | "preview" | "saving";

export default function AddRecipeModal({ onClose, onSave }: AddRecipeModalProps) {
  const [step, setStep] = useState<ModalStep>("paste");
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<RecipeInput | null>(null);
  const [error, setError] = useState("");

  async function handleParse() {
    setStep("parsing");
    setError("");

    try {
      const res = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Parse failed");
      }

      const recipe: RecipeInput = await res.json();
      setParsed(recipe);
      setStep("preview");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setStep("paste");
    }
  }

  async function handleSave() {
    if (!parsed) return;
    setStep("saving");
    try {
      await onSave(parsed);
      onClose();
    } catch {
      setError("Failed to save recipe.");
      setStep("preview");
    }
  }

  function formatIngredient(ing: Ingredient) {
    const parts: string[] = [];
    if (ing.amount || ing.unit) {
      parts.push([ing.amount, ing.unit].filter(Boolean).join(" "));
    }
    parts.push(ing.item);
    if (ing.notes) parts.push(`(${ing.notes})`);
    return parts.join(" ");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{step === "preview" ? "Preview Recipe" : "Add Recipe"}</h2>
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

        <div className="modal-body">
          {step === "paste" && (
            <>
              <textarea
                className="textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={"Paste a recipe here. Copy it from any website, blog, or notes app.\n\nInclude the title, ingredients, and steps. A URL is optional but will be saved if present."}
              />
              <p className="parse-hint">
                Claude will read what you paste and turn it into a structured recipe.
              </p>
              {error && (
                <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  {error}
                </p>
              )}
            </>
          )}

          {step === "parsing" && (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div className="spinner spinner-dark" style={{ width: "1.5rem", height: "1.5rem", borderWidth: "2.5px" }} />
              <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "0.9rem" }}>
                Parsing your recipe with Claude...
              </p>
            </div>
          )}

          {step === "preview" && parsed && (
            <div className="recipe-preview">
              <h3>{parsed.title}</h3>
              {parsed.description && <p>{parsed.description}</p>}

              <div className="preview-meta">
                {parsed.prep_time && <span>Prep: {parsed.prep_time}</span>}
                {parsed.cook_time && <span>Cook: {parsed.cook_time}</span>}
                {parsed.servings && <span>Serves: {parsed.servings}</span>}
              </div>

              {parsed.tags.length > 0 && (
                <div className="card-tags" style={{ padding: 0, marginBottom: "0.75rem" }}>
                  {parsed.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}

              <h4 style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
                margin: "0 0 0.5rem",
              }}>
                Ingredients
              </h4>
              <ul className="ingredients-list">
                {parsed.ingredients.map((ing, i) => (
                  <li key={i}>{formatIngredient(ing)}</li>
                ))}
              </ul>

              <h4 style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
                margin: "1rem 0 0.5rem",
              }}>
                Steps
              </h4>
              <ol className="steps-list">
                {parsed.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>

              {error && (
                <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.75rem" }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {step === "saving" && (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div className="spinner spinner-dark" style={{ width: "1.5rem", height: "1.5rem", borderWidth: "2.5px" }} />
              <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "0.9rem" }}>
                Saving recipe...
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step === "paste" && (
            <>
              <button className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-action"
                disabled={text.trim().length < 10}
                onClick={handleParse}
              >
                Parse with Claude
              </button>
            </>
          )}
          {step === "preview" && (
            <>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setStep("paste");
                  setParsed(null);
                }}
              >
                Back
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save Recipe
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
