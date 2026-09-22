import { put } from "@vercel/blob";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB, under Vercel's request body limit
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file received." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return Response.json(
      { error: "That doesn't look like an image. Try a JPG, PNG, or WebP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "That photo is over 4 MB. Try a smaller one." }, { status: 400 });
  }

  // Auth is handled by the SDK: on Vercel it reads the per-request OIDC token
  // (x-vercel-oidc-token) plus BLOB_STORE_ID; locally it uses VERCEL_OIDC_TOKEN
  // from `vercel env pull`; a static BLOB_READ_WRITE_TOKEN also works anywhere.
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const blob = await put(`recipes/photo.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return Response.json({ url: blob.url });
  } catch (err) {
    console.error("Blob upload failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    const isAuth = /token|credential|unauthori[sz]ed|forbidden|403|401|store/i.test(message);
    return Response.json(
      {
        error: isAuth
          ? "Photo storage isn't connected. Make sure the Blob store is linked to this project (BLOB_STORE_ID), or run vercel env pull locally."
          : "Upload failed. Try again in a moment.",
      },
      { status: 500 }
    );
  }
}
