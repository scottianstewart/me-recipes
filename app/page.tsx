import { prisma } from "@/lib/db";
import { mapRecipe } from "@/lib/mapRecipe";
import RecipeApp from "@/components/RecipeApp";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await prisma.recipe.findMany({ orderBy: { createdAt: "desc" } });
  return <RecipeApp recipes={rows.map(mapRecipe)} />;
}
