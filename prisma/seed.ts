import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const recipes = [
  {
    title: "Cacio e Pepe",
    description:
      "The classic Roman pasta with just three ingredients: pasta, Pecorino Romano, and black pepper.",
    prepTime: "5 min",
    cookTime: "15 min",
    servings: "4",
    ingredients: [
      { amount: "1", unit: "lb", item: "spaghetti or tonnarelli" },
      { amount: "2", unit: "cups", item: "finely grated Pecorino Romano" },
      { amount: "1.5", unit: "tsp", item: "freshly cracked black pepper" },
      { amount: "1", unit: "tbsp", item: "kosher salt", notes: "for pasta water" },
    ],
    steps: [
      "Bring a large pot of well-salted water to a boil. Cook the pasta until just shy of al dente, about 1 minute less than the package directions.",
      "While the pasta cooks, toast the black pepper in a large dry skillet over medium heat for about 1 minute until fragrant. Add a ladleful of pasta water and let it simmer.",
      "Place the grated Pecorino in a large bowl. Slowly whisk in about 1 cup of hot pasta water to create a smooth, creamy paste. Work gradually to avoid clumps.",
      "Transfer the pasta directly from the pot into the skillet with the pepper. Toss and add a splash of pasta water.",
      "Remove the skillet from heat and pour in the Pecorino paste. Toss vigorously, adding small splashes of pasta water until you get a creamy, glossy sauce that clings to the pasta.",
      "Serve immediately with extra Pecorino and cracked pepper on top.",
    ],
    tags: ["pasta", "italian", "quick", "vegetarian"],
    sourceUrl: "https://www.bonappetit.com/recipe/cacio-e-pepe",
  },
  {
    title: "Blended Red Lentil Soup",
    description:
      "A silky, warmly spiced soup that blends down into a smooth, creamy texture.",
    prepTime: "10 min",
    cookTime: "30 min",
    servings: "6",
    ingredients: [
      { amount: "2", unit: "tbsp", item: "olive oil" },
      { amount: "1", unit: "", item: "large onion", notes: "diced" },
      { amount: "3", unit: "cloves", item: "garlic", notes: "minced" },
      { amount: "1", unit: "tbsp", item: "ground cumin" },
      { amount: "1", unit: "tsp", item: "ground turmeric" },
      { amount: "0.5", unit: "tsp", item: "smoked paprika" },
      { amount: "1.5", unit: "cups", item: "red lentils", notes: "rinsed" },
      { amount: "1", unit: "can", item: "diced tomatoes", notes: "14 oz" },
      { amount: "4", unit: "cups", item: "vegetable broth" },
      { amount: "1", unit: "cup", item: "water" },
      { amount: "2", unit: "tbsp", item: "lemon juice" },
      { amount: "", unit: "", item: "salt and pepper", notes: "to taste" },
    ],
    steps: [
      "Heat olive oil in a large pot over medium heat. Add onion and cook until soft, about 5 minutes. Add garlic, cumin, turmeric, and smoked paprika; stir for 1 minute until fragrant.",
      "Add lentils, diced tomatoes (with juices), vegetable broth, and water. Bring to a boil, then reduce heat and simmer uncovered for 20-25 minutes until lentils are completely broken down.",
      "Use an immersion blender to puree the soup until completely smooth. Alternatively, blend in batches in a countertop blender.",
      "Stir in lemon juice and season with salt and pepper to taste.",
      "Ladle into bowls and finish with a swirl of olive oil, a pinch of smoked paprika, and crusty bread on the side.",
    ],
    tags: ["soup", "healthy", "meal-prep", "vegetarian"],
    sourceUrl: "https://cookieandkate.com/best-red-lentil-soup-recipe/",
  },
  {
    title: "Crispy Black Bean Tacos",
    description:
      "Crunchy pan-fried tortillas filled with seasoned black beans, quick-pickled onions, and a bright lime crema.",
    prepTime: "15 min",
    cookTime: "15 min",
    servings: "4",
    ingredients: [
      { amount: "2", unit: "cans", item: "black beans", notes: "drained and rinsed" },
      { amount: "1", unit: "tsp", item: "chili powder" },
      { amount: "1", unit: "tsp", item: "ground cumin" },
      { amount: "0.5", unit: "tsp", item: "garlic powder" },
      { amount: "8", unit: "", item: "small corn tortillas" },
      { amount: "2", unit: "tbsp", item: "neutral oil", notes: "for frying" },
      { amount: "1", unit: "cup", item: "shredded Monterey Jack cheese" },
      { amount: "0.5", unit: "", item: "red onion", notes: "thinly sliced" },
      { amount: "0.25", unit: "cup", item: "lime juice", notes: "about 2 limes" },
      { amount: "0.5", unit: "cup", item: "sour cream" },
      { amount: "1", unit: "", item: "avocado", notes: "sliced" },
      { amount: "0.5", unit: "cup", item: "fresh cilantro", notes: "chopped" },
      { amount: "", unit: "", item: "hot sauce", notes: "to taste" },
    ],
    steps: [
      "Quick-pickle the onion: combine sliced red onion with half of the lime juice and a pinch of salt. Set aside while you cook.",
      "In a bowl, mash the black beans roughly with a fork (leave some whole for texture). Stir in chili powder, cumin, garlic powder, and a pinch of salt.",
      "Heat a large skillet over medium-high heat with a drizzle of oil. Place tortillas in the pan, spread a spoonful of beans on one half, and top with a pinch of cheese. Fold in half and cook 2-3 minutes per side until deeply golden and crisp.",
      "Mix sour cream with the remaining lime juice and a pinch of salt to make the lime crema.",
      "Serve the crispy tacos topped with pickled onion, avocado slices, cilantro, a drizzle of lime crema, and hot sauce.",
    ],
    tags: ["mexican", "quick", "vegetarian"],
    sourceUrl: "https://www.loveandlemons.com/black-bean-tacos/",
  },
  {
    title: "Vegetarian Burrito Bowls",
    description:
      "Loaded burrito bowls with cilantro-lime rice, seasoned beans, and all the fixings.",
    prepTime: "15 min",
    cookTime: "20 min",
    servings: "4",
    ingredients: [
      { amount: "1.5", unit: "cups", item: "long-grain white rice" },
      { amount: "0.25", unit: "cup", item: "fresh cilantro", notes: "chopped" },
      { amount: "2", unit: "tbsp", item: "lime juice" },
      { amount: "1", unit: "can", item: "black beans", notes: "drained and rinsed" },
      { amount: "1", unit: "cup", item: "corn kernels", notes: "fresh or frozen" },
      { amount: "1", unit: "tsp", item: "chili powder" },
      { amount: "0.5", unit: "tsp", item: "ground cumin" },
      { amount: "1", unit: "cup", item: "cherry tomatoes", notes: "halved" },
      { amount: "1", unit: "", item: "avocado", notes: "diced" },
      { amount: "0.5", unit: "cup", item: "shredded cheddar or Monterey Jack" },
      { amount: "0.25", unit: "cup", item: "pickled jalapenos" },
      { amount: "0.5", unit: "cup", item: "sour cream or Greek yogurt" },
      { amount: "", unit: "", item: "hot sauce", notes: "to taste" },
    ],
    steps: [
      "Cook the rice according to package directions. When done, fluff with a fork and stir in chopped cilantro and lime juice. Season with salt to taste.",
      "In a small saucepan, combine black beans, corn, chili powder, cumin, and a splash of water. Cook over medium heat for 5-7 minutes until warmed through and well seasoned.",
      "Divide cilantro-lime rice among four bowls. Top each with the seasoned beans and corn mixture.",
      "Add cherry tomatoes, diced avocado, shredded cheese, and pickled jalapenos to each bowl.",
      "Finish with a dollop of sour cream and hot sauce. Serve immediately.",
    ],
    tags: ["mexican", "bowl", "meal-prep", "vegetarian"],
    sourceUrl: "https://www.budgetbytes.com/burrito-bowls/",
  },
];

async function seed() {
  console.log("Seeding recipes...");

  for (const r of recipes) {
    await prisma.recipe.create({ data: r });
    console.log(`  + ${r.title}`);
  }

  console.log(`Done. Seeded ${recipes.length} recipes.`);
}

seed()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
