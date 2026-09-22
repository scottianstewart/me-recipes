"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { RecipeInput, PlannedDay } from "@/lib/types";

function revalidateRecipe(id: number) {
  revalidatePath("/");
  revalidatePath(`/recipes/${id}`);
  revalidatePath(`/recipes/${id}/cook`);
}

/* ---------- Recipes ---------- */

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
  if (existing?.imageUrl && existing.imageUrl !== imageUrl) {
    await del(existing.imageUrl).catch(() => {});
  }
  revalidateRecipe(id);
}

export async function deleteRecipeAction(id: number) {
  const existing = await prisma.recipe.findUnique({ where: { id } });
  await prisma.recipe.delete({ where: { id } });
  if (existing?.imageUrl) {
    await del(existing.imageUrl).catch(() => {});
  }
  revalidatePath("/");
}

/* ---------- This week (queue) ---------- */

export async function toggleQueueAction(id: number): Promise<boolean> {
  const existing = await prisma.recipe.findUnique({ where: { id }, select: { queuedAt: true } });
  const nowQueued = !existing?.queuedAt;
  await prisma.recipe.update({
    where: { id },
    data: nowQueued ? { queuedAt: new Date() } : { queuedAt: null, plannedDay: null },
  });
  if (!nowQueued) {
    await prisma.shoppingCheck.deleteMany({ where: { recipeId: id } });
  }
  revalidateRecipe(id);
  return nowQueued;
}

export async function setPlannedDayAction(id: number, day: PlannedDay | null) {
  await prisma.recipe.update({ where: { id }, data: { plannedDay: day } });
  revalidateRecipe(id);
}

export async function clearQueueAction() {
  await prisma.recipe.updateMany({
    where: { queuedAt: { not: null } },
    data: { queuedAt: null, plannedDay: null },
  });
  await prisma.shoppingCheck.deleteMany({});
  revalidatePath("/");
}

/* ---------- Shopping checks ---------- */

export async function setShoppingCheckAction(recipeId: number, idx: number, checked: boolean) {
  if (checked) {
    await prisma.shoppingCheck.upsert({
      where: { recipeId_idx: { recipeId, idx } },
      create: { recipeId, idx },
      update: {},
    });
  } else {
    await prisma.shoppingCheck.deleteMany({ where: { recipeId, idx } });
  }
  // No revalidate: the client keeps its own optimistic state and reloads get fresh rows.
}

export async function uncheckAllShoppingAction() {
  await prisma.shoppingCheck.deleteMany({});
  revalidatePath("/");
}

/* ---------- Cooking ---------- */

export async function completeCookAction(id: number, note: string) {
  await prisma.$transaction([
    prisma.cookLog.create({ data: { recipeId: id, note: note.trim() } }),
    prisma.recipe.update({ where: { id }, data: { queuedAt: null, plannedDay: null } }),
    prisma.shoppingCheck.deleteMany({ where: { recipeId: id } }),
  ]);
  revalidateRecipe(id);
}
