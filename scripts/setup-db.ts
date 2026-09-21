import { sql } from "@vercel/postgres";

async function setup() {
  console.log("Creating recipes table...");

  await sql`
    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      prep_time TEXT NOT NULL DEFAULT '',
      cook_time TEXT NOT NULL DEFAULT '',
      servings TEXT NOT NULL DEFAULT '',
      ingredients JSONB NOT NULL DEFAULT '[]',
      steps JSONB NOT NULL DEFAULT '[]',
      tags TEXT[] NOT NULL DEFAULT '{}',
      source_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  console.log("Done. recipes table is ready.");
  process.exit(0);
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
