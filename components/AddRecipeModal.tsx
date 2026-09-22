"use client";

import { useEffect, useState } from "react";
import type { RecipeInput } from "@/lib/types";
import { colorClass } from "@/lib/ui";
import ImageDropzone from "./ImageDropzone";
import { CloseIcon, SparkIcon, ClockIcon, PeopleIcon } from "./Icons";

interface AddRecipeModalProps {
  onClose: () => void;
  onSave: (recipe: RecipeInput) => Promise<void>;
}

type Step = "paste" | "parsing" | "preview" | "saving";

export default function AddRecipeModal({ onClose, onSave }: AddRecipeModalProps) {
  const [step, setStep] = useState<Step>("paste");
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<RecipeInput | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
        throw new Error(data.error || "Couldn't read that recipe");
      }
      const recipe = (await res.json()) as Omit<RecipeInput, "image_url">;
      setParsed({ ...recipe, image_url: null });
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("paste");
    }
  }

  async function handleSave() {
    if (!parsed) return;
    setStep("saving");
    try {
      await onSave({ ...parsed, image_url: imageUrl });
      onClose();
    } catch {
      setError("Couldn't save that. Try again?");
      setStep("preview");
    }
  }

  const heading =
    step === "preview" ? "Looks about right?" :
    step === "parsing" ? "Reading your recipe" :
    step === "saving" ? "Saving" : "Add a recipe";

  const sub =
    step === "preview" ? "Check the details, add a photo if you like, then save." :
    step === "paste" ? "Paste it from anywhere. A blog, a screenshot's text, your notes app." : "";

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="sheet sheet-narrow"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-header">
          <div>
            <h2 id="add-title">{heading}</h2>
            {sub && <p>{sub}</p>}
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="sheet-body">
          {step === "paste" && (
            <>
              <textarea
                className="textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={"Title, ingredients, steps. Messy is fine.\n\nIf there's a link in there, we'll keep it as the source."}
                autoFocus
              />
              <p className="hint">Claude tidies it into ingredients, steps and tags for you.</p>
              {error && <p className="error-text">{error}</p>}
            </>
          )}

          {(step === "parsing" || step === "saving") && (
            <div className="busy">
              <div className="spinner" />
              {step === "parsing" ? "Sorting out the ingredients and steps..." : "Adding it to your book..."}
            </div>
          )}

          {step === "preview" && parsed && (
            <>
              <ImageDropzone value={imageUrl} onChange={setImageUrl} />

              <div className="preview">
                <div>
                  <h3>{parsed.title}</h3>
                  {parsed.description && <p className="card-desc" style={{ marginTop: "0.35rem" }}>{parsed.description}</p>}
                </div>

                <div className="detail-meta" style={{ marginBottom: 0 }}>
                  {parsed.prep_time && <span className="meta-pill"><ClockIcon /> {parsed.prep_time} prep</span>}
                  {parsed.cook_time && <span className="meta-pill"><ClockIcon /> {parsed.cook_time} cook</span>}
                  {parsed.servings && <span className="meta-pill"><PeopleIcon /> Serves {parsed.servings}</span>}
                  {parsed.tags.map((tag) => (
                    <span key={tag} className={`tag ${colorClass(tag)}`}>{tag}</span>
                  ))}
                </div>

                <div className="detail-columns">
                  <section>
                    <h3 className="section-label">
                      Ingredients <span className="count">{parsed.ingredients.length}</span>
                    </h3>
                    <ul className="ingredients-list">
                      {parsed.ingredients.map((ing, i) => (
                        <li key={i}>
                          <span>
                            {(ing.amount || ing.unit) && (
                              <span className="ingredient-amount">
                                {[ing.amount, ing.unit].filter(Boolean).join(" ")}{" "}
                              </span>
                            )}
                            {ing.item}
                            {ing.notes && <span className="ingredient-notes">, {ing.notes}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="section-label">
                      Steps <span className="count">{parsed.steps.length}</span>
                    </h3>
                    <ol className="steps-list">
                      {parsed.steps.map((s, i) => (
                        <li key={i}><span>{s}</span></li>
                      ))}
                    </ol>
                  </section>
                </div>

                {error && <p className="error-text">{error}</p>}
              </div>
            </>
          )}
        </div>

        {(step === "paste" || step === "preview") && (
          <div className="sheet-footer">
            {step === "paste" ? (
              <>
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button
                  className="btn btn-primary"
                  disabled={text.trim().length < 10}
                  onClick={handleParse}
                >
                  <SparkIcon size={16} />
                  Tidy it up
                </button>
              </>
            ) : (
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
                  Save to my book
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
