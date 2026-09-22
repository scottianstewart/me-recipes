import { prisma } from "@/lib/db";
import { mapRecipe, recipeInclude } from "@/lib/mapRecipe";
import type { Recipe } from "@/lib/types";

export async function getRecipe(idParam: string): Promise<Recipe | null> {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return null;
  const row = await prisma.recipe.findUnique({ where: { id }, include: recipeInclude });
  return row ? mapRecipe(row) : null;
}

/** Everything currently in the "this week" queue, plus which grocery lines are checked. */
export async function getWeek() {
  const [queued, checks] = await Promise.all([
    prisma.recipe.findMany({
      where: { queuedAt: { not: null } },
      orderBy: { queuedAt: "asc" },
      include: recipeInclude,
    }),
    prisma.shoppingCheck.findMany(),
  ]);
  return {
    queued: queued.map(mapRecipe),
    checkedKeys: checks.map((c) => `${c.recipeId}:${c.idx}`),
  };
}
