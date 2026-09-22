"use client";

import { useEffect, useState } from "react";

export function useToast(ms = 2200) {
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), ms);
    return () => clearTimeout(t);
  }, [toast, ms]);
  return { toast, show: setToast };
}
