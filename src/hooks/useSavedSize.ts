"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "stride-saved-size";

export function useSavedSize() {
  const [savedSize, setSavedSize] = useState<string | null>(null);

  useEffect(() => {
    setSavedSize(localStorage.getItem(STORAGE_KEY));
  }, []);

  const saveSize = (size: string) => {
    localStorage.setItem(STORAGE_KEY, size);
    setSavedSize(size);
  };

  return { savedSize, saveSize };
}
