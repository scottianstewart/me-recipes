import type { Prisma } from "@prisma/client";
import type { Recipe, PlannedDay } from "@/lib/types";

/** Shape returned by the recipe queries in app/page.tsx and app/recipes/[id]. */
export const recipeInclude = {
  cookLogs: { orderBy: { cookedAt: "desc" as const }, take: 1 },
  _count: { select: { cookLogs: true } },
} satisfies Prisma.RecipeInclude;

type Row = Prisma.RecipeGetPayload<{ include: typeof recipeInclude }>;

export function mapRecipe(r: Row): Recipe {
  const last = r.cookLogs[0];
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
    image_url: r.imageUrl ?? null,
    created_at: r.createdAt.toISOString(),
    queued_at: r.queuedAt ? r.queuedAt.toISOString() : null,
    planned_day: (r.plannedDay as PlannedDay | null) ?? null,
    times_cooked: r._count.cookLogs,
    last_cooked_at: last ? last.cookedAt.toISOString() : null,
    last_note: last?.note ?? "",
  };
}
