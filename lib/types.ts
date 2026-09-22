export interface Ingredient {
  amount: string;
  unit: string;
  item: string;
  notes?: string;
}

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

export interface ShoppingItem {
  recipeId: number;
  recipeTitle: string;
  ingredient: Ingredient;
  checked: boolean;
}
