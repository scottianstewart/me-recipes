import { prisma } from "@/lib/db";
import { mapRecipe, recipeInclude } from "@/lib/mapRecipe";
import RecipeApp from "@/components/RecipeApp";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [rows, checks] = await Promise.all([
    prisma.recipe.findMany({ orderBy: { createdAt: "desc" }, include: recipeInclude }),
    prisma.shoppingCheck.findMany(),
  ]);
  return (
    <RecipeApp
      recipes={rows.map(mapRecipe)}
      checkedKeys={checks.map((c) => `${c.recipeId}:${c.idx}`)}
    />
  );
}
