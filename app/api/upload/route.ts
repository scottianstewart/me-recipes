import { put } from "@vercel/blob";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB, under Vercel's request body limit
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];

export async function POST(req: Request) {
  // Vercel Blob auth: OIDC (BLOB_STORE_ID + VERCEL_OIDC_TOKEN) is the default for new
  // stores; a static BLOB_READ_WRITE_TOKEN also works. The SDK picks whichever is present.
  const hasOidc = !!process.env.BLOB_STORE_ID && !!process.env.VERCEL_OIDC_TOKEN;
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  if (!hasOidc && !hasToken) {
    return Response.json(
      { error: "Photo uploads aren't set up yet. Add BLOB_STORE_ID to your .env (or run vercel env pull)." },
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
