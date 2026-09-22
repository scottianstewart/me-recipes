"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { RecipeInput } from "@/lib/types";

export async function addRecipeAction(recipe: RecipeInput) {
  const created = await prisma.recipe.create({
    data: {
      title: recipe.title,
      description: recipe.description,
      prepTime: recipe.prep_time,
      cookTime: recipe.cook_time,
      servings: recipe.servings,
      ingredients: recipe.ingredients as unknown as Prisma.InputJsonValue,
      steps: recipe.steps,
      tags: recipe.tags,
      sourceUrl: recipe.source_url,
      imageUrl: recipe.image_url,
    },
  });
  revalidatePath("/");
  return created;
}

export async function updateRecipeImageAction(id: number, imageUrl: string | null) {
  const existing = await prisma.recipe.findUnique({ where: { id } });
  await prisma.recipe.update({ where: { id }, data: { imageUrl } });
  // Clean up the old blob if we replaced or removed it
  if (existing?.imageUrl && existing.imageUrl !== imageUrl) {
    await del(existing.imageUrl).catch(() => {});
  }
  revalidatePath("/");
  revalidatePath(`/recipes/${id}`);
}

export async function deleteRecipeAction(id: number) {
  const existing = await prisma.recipe.findUnique({ where: { id } });
  await prisma.recipe.delete({ where: { id } });
  if (existing?.imageUrl) {
    await del(existing.imageUrl).catch(() => {});
  }
  revalidatePath("/");
}
