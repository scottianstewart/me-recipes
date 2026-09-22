import type { Recipe as RecipeRow } from "@prisma/client";
import type { Recipe } from "@/lib/types";

export function mapRecipe(r: RecipeRow): Recipe {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    prep_time: r.prepTime,
    cook_time: r.cookTime,
    servings: r.servings,
    ingredients: r.ingredients as unknown as Recipe["ingredients"],
    steps: r.steps as unknown as Recipe["steps"],
    tags: r.tags,
    source_url: r.sourceUrl,
    image_url: (r as RecipeRow & { imageUrl?: string | null }).imageUrl ?? null,
    created_at: r.createdAt.toISOString(),
  };
}
