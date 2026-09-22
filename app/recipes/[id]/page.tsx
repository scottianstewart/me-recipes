import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipe, getWeek } from "@/lib/recipes";
import RecipeDetail from "@/components/RecipeDetail";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

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
  const [recipe, week] = await Promise.all([getRecipe(id), getWeek()]);
  if (!recipe) notFound();
  return <RecipeDetail recipe={recipe} queued={week.queued} checkedKeys={week.checkedKeys} />;
}
