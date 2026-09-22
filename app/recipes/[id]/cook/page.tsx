import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipe } from "@/lib/recipes";
import CookMode from "@/components/CookMode";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);
  return { title: recipe ? `Cooking ${recipe.title}` : "Recipe not found" };
}

export default async function CookPage({ params }: Params) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();
  return <CookMode recipe={recipe} />;
}
