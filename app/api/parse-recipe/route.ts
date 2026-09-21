import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const ingredientSchema = z.object({
  amount: z.string().describe("Numeric amount as a string, e.g. '2' or '0.5'. Empty string if none."),
  unit: z.string().describe("Unit of measurement, e.g. 'cups', 'tbsp', 'lbs'. Empty string if none (whole items)."),
  item: z.string().describe("The ingredient name, e.g. 'olive oil', 'large eggs'."),
  notes: z.string().optional().describe("Prep notes like 'diced', 'room temperature', 'about 14 oz'."),
});

const recipeSchema = z.object({
  title: z.string().describe("Recipe title, cleaned up and properly capitalized."),
  description: z.string().describe("A 1-2 sentence description of the dish."),
  prep_time: z.string().describe("Prep time as a short string like '15 min' or '1 hr'. Empty string if not mentioned."),
  cook_time: z.string().describe("Cook time as a short string like '30 min'. Empty string if not mentioned."),
  servings: z.string().describe("Number of servings as a string like '4' or '6-8'. Empty string if not mentioned."),
  ingredients: z.array(ingredientSchema).describe("All ingredients, parsed into structured parts."),
  steps: z.array(z.string()).describe("Cooking steps as complete sentences. Combine overly fragmented steps. Keep it readable."),
  tags: z.array(z.string()).describe("3-5 lowercase tags like 'pasta', 'quick', 'vegetarian', 'italian', 'soup'."),
  source_url: z.string().nullable().describe("Source URL if one appears in the text, otherwise null."),
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return Response.json(
        { error: "Please paste a recipe with enough detail to parse." },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: recipeSchema,
      prompt: `Parse the following recipe text into structured data. Extract every ingredient with its amount, unit, item name, and any prep notes. Write clear, complete cooking steps. Infer reasonable tags. If a URL is present, extract it.

Recipe text:
${text.trim()}`,
    });

    return Response.json(object);
  } catch (err) {
    console.error("Recipe parse error:", err);
    return Response.json(
      { error: "Failed to parse recipe. Check your ANTHROPIC_API_KEY and try again." },
      { status: 500 }
    );
  }
}
