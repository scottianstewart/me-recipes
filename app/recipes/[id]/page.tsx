import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { mapRecipe } from "@/lib/mapRecipe";
import RecipeDetail from "@/components/RecipeDetail";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function getRecipe(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return null;
  const row = await prisma.recipe.findUnique({ where: { id } });
  return row ? mapRecipe(row) : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);
  return {
    title: recipe ? `${recipe.title} | My Recipes` : "Recipe not found",
    description: recipe?.description || undefined,
  };
}

export default async function RecipePage({ params }: Params) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();
  return <RecipeDetail recipe={recipe} />;
}
