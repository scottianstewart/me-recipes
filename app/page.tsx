import { getRecipes } from "@/lib/db";
import RecipeApp from "@/components/RecipeApp";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recipes = await getRecipes();
  return <RecipeApp recipes={recipes} />;
}
