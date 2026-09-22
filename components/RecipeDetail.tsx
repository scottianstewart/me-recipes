"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/lib/types";
import { colorClass, totalTime } from "@/lib/ui";
import { useShoppingList } from "@/lib/useShoppingList";
import { useToast } from "@/lib/useToast";
import { deleteRecipeAction, updateRecipeImageAction } from "@/app/actions";
import { uploadImage } from "./ImageDropzone";
import ShoppingPanel from "./ShoppingPanel";
import {
  ClockIcon,
  PeopleIcon,
  CameraIcon,
  LinkIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  BasketIcon,
  BackIcon,
} from "./Icons";

export default function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const list = useShoppingList();
  const { toast, show } = useToast();
  const [showShopping, setShowShopping] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
  const time = totalTime(recipe.prep_time, recipe.cook_time);
  const tone = colorClass(recipe.title);
  const isAdded = list.addedIds.has(recipe.id);

  useEffect(() => {
    document.body.style.overflow = showShopping ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showShopping]);

  function toggleList() {
    const n = list.toggleRecipe(recipe);
    show(n ? `Added ${n} ingredients to your list` : "Removed from your list");
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadImage(file);
      await updateRecipeImageAction(recipe.id, url);
      router.refresh();
      show("Photo saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    await updateRecipeImageAction(recipe.id, null);
    router.refresh();
    show("Photo removed");
  }

  async function handleDelete() {
    setDeleting(true);
    list.removeRecipe(recipe.id);
    await deleteRecipeAction(recipe.id);
    router.push("/");
  }

  return (
    <div className="app-shell">
      <nav className="page-nav">
        <Link href="/" className="back-link">
          <BackIcon size={18} /> All recipes
        </Link>
        <button className="btn btn-secondary" onClick={() => setShowShopping(true)}>
          <BasketIcon size={17} />
          Shopping list
          {list.items.length > 0 && <span className="count-bubble">{list.items.length}</span>}
        </button>
      </nav>

      <article className="recipe-page">
        <div className={`page-hero ${recipe.image_url ? "" : "no-photo"}`}>
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} />
          ) : (
            <div className={`card-placeholder ${tone}`}>
              <span>{recipe.title.trim().charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="detail-hero-actions">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
            <button className="btn btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <CameraIcon size={15} />
              {uploading ? "Uploading..." : recipe.image_url ? "Change photo" : "Add a photo"}
            </button>
            {recipe.image_url && !uploading && (
              <button className="btn btn-sm" onClick={removePhoto}>Remove</button>
            )}
          </div>
        </div>

        <div className="detail-body">
          <h1 className="detail-title">{recipe.title}</h1>
          {recipe.description && <p className="detail-desc">{recipe.description}</p>}

          <div className="detail-meta">
            {recipe.prep_time && <span className="meta-pill"><ClockIcon /> {recipe.prep_time} prep</span>}
            {recipe.cook_time && <span className="meta-pill"><ClockIcon /> {recipe.cook_time} cook</span>}
            {time && recipe.prep_time && recipe.cook_time && <span className="meta-pill">{time} total</span>}
            {recipe.servings && <span className="meta-pill"><PeopleIcon /> Serves {recipe.servings}</span>}
            {tags.map((tag) => (
              <span key={tag} className={`tag ${colorClass(tag)}`}>{tag}</span>
            ))}
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="detail-actions">
            {confirming ? (
              <div className="confirm-row">
                <span>Delete &ldquo;{recipe.title}&rdquo;? This can&apos;t be undone.</span>
                <button className="btn btn-sm btn-primary" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Yes, delete it"}
                </button>
                <button className="btn btn-sm btn-ghost" onClick={() => setConfirming(false)} disabled={deleting}>
                  Keep it
                </button>
              </div>
            ) : (
              <>
                <button className={`btn ${isAdded ? "btn-green" : "btn-primary"}`} onClick={toggleList}>
                  {isAdded ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
                  {isAdded ? "On your shopping list" : "Add to shopping list"}
                </button>
                {recipe.source_url && (
                  <a className="btn btn-ghost" href={recipe.source_url} target="_blank" rel="noopener noreferrer">
                    <LinkIcon size={15} /> Source
                  </a>
                )}
                <div className="spacer" />
                <button className="btn btn-danger" onClick={() => setConfirming(true)}>
                  <TrashIcon size={15} /> Delete
                </button>
              </>
            )}
          </div>

          <div className="detail-columns">
            <section>
              <h2 className="section-label">
                Ingredients <span className="count">{ingredients.length}</span>
              </h2>
              <ul className="ingredients-list">
                {ingredients.map((ing, i) => (
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
              <h2 className="section-label">
                Steps <span className="count">{steps.length}</span>
              </h2>
              <ol className="steps-list">
                {steps.map((step, i) => (
                  <li key={i}><span>{step}</span></li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </article>

      {showShopping && (
        <ShoppingPanel
          items={list.items}
          onToggleItem={list.toggleItem}
          onClearChecked={list.clearChecked}
          onClearAll={list.clearAll}
          onClose={() => setShowShopping(false)}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
