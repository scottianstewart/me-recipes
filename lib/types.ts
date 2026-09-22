export interface Ingredient {
  amount: string;
  unit: string;
  item: string;
  notes?: string;
}

export type PlannedDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Recipe {
  id: number;
  title: string;
  description: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  source_url: string | null;
  image_url: string | null;
  created_at: string;
  /** Set when the recipe is in this week's queue. */
  queued_at: string | null;
  planned_day: PlannedDay | null;
  times_cooked: number;
  last_cooked_at: string | null;
  last_note: string;
}

export interface RecipeInput {
  title: string;
  description: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  source_url: string | null;
  image_url: string | null;
}

/** A grocery line derived from a queued recipe. Identity is (recipeId, idx). */
export interface ShoppingItem {
  recipeId: number;
  recipeTitle: string;
  idx: number;
  ingredient: Ingredient;
  checked: boolean;
}
