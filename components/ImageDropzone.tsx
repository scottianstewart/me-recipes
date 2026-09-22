"use client";

import { useRef, useState } from "react";
import { CameraIcon } from "./Icons";

interface ImageDropzoneProps {
  value: string | null;
  onChange: (url: string | null) => void;
  compact?: boolean;
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

export default function ImageDropzone({ value, onChange, compact }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const cls = [
    "dropzone",
    over ? "over" : "",
    value ? "has-image" : "",
    uploading ? "uploading" : "",
  ].join(" ");

  return (
    <div>
      <div
        className={cls}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {value ? (
          <>
            <img src={value} alt="Recipe photo" />
            <div className="dz-overlay" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => inputRef.current?.click()}
              >
                Change
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => onChange(null)}
              >
                Remove
              </button>
            </div>
          </>
        ) : uploading ? (
          <>
            <div className="spinner" style={{ margin: "0 auto 0.5rem" }} />
            Uploading photo...
          </>
        ) : (
          <>
            <div className="dz-icon">
              <CameraIcon size={20} />
            </div>
            {compact ? "Add a photo" : "Drop a photo here, or click to choose one"}
            <div className="dz-sub">JPG, PNG or WebP, up to 4 MB</div>
          </>
        )}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
