import { sql } from "@vercel/postgres";
import type { Recipe, RecipeInput } from "./types";

export async function getRecipes(): Promise<Recipe[]> {
  const { rows } = await sql`
    SELECT id, title, description, prep_time, cook_time, servings,
           ingredients, steps, tags, source_url, created_at
    FROM recipes
    ORDER BY created_at DESC
  `;
  return rows as Recipe[];
}

export async function getRecipe(id: number): Promise<Recipe | null> {
  const { rows } = await sql`
    SELECT id, title, description, prep_time, cook_time, servings,
           ingredients, steps, tags, source_url, created_at
    FROM recipes
    WHERE id = ${id}
  `;
  return (rows[0] as Recipe) ?? null;
}

export async function createRecipe(recipe: RecipeInput): Promise<Recipe> {
  const { rows } = await sql`
    INSERT INTO recipes (title, description, prep_time, cook_time, servings,
                         ingredients, steps, tags, source_url)
    VALUES (
      ${recipe.title},
      ${recipe.description},
      ${recipe.prep_time},
      ${recipe.cook_time},
      ${recipe.servings},
      ${JSON.stringify(recipe.ingredients)},
      ${JSON.stringify(recipe.steps)},
      ${recipe.tags as unknown as string},
      ${recipe.source_url}
    )
    RETURNING *
  `;
  return rows[0] as Recipe;
}

export async function deleteRecipe(id: number): Promise<void> {
  await sql`DELETE FROM recipes WHERE id = ${id}`;
}
