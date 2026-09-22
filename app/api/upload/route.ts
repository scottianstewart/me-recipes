import { put } from "@vercel/blob";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB, under Vercel's request body limit
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Photo uploads aren't set up yet. Add BLOB_READ_WRITE_TOKEN to your .env." },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file received." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return Response.json({ error: "That doesn't look like an image. Try a JPG, PNG, or WebP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "That photo is over 4 MB. Try a smaller one." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const blob = await put(`recipes/photo.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  return Response.json({ url: blob.url });
}
