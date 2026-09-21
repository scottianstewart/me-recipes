"use server";

import { revalidatePath } from "next/cache";
import { createRecipe, deleteRecipe } from "@/lib/db";
import type { RecipeInput } from "@/lib/types";

export async function addRecipeAction(recipe: RecipeInput) {
  const created = await createRecipe(recipe);
  revalidatePath("/");
  return created;
}

export async function deleteRecipeAction(id: number) {
  await deleteRecipe(id);
  revalidatePath("/");
}
