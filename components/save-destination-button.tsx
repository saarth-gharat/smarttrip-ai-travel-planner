"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

const STORAGE_KEY = "travelora_saved_destinations";

function readSavedIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export default function SaveDestinationButton({
  destinationId,
}: {
  destinationId: string;
}) {
  const [saved, setSaved] = useState(() =>
    readSavedIds().includes(destinationId)
  );

  function toggleSaved() {
    const current = readSavedIds();
    const next = current.includes(destinationId)
      ? current.filter((id) => id !== destinationId)
      : [...current, destinationId];

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(next.includes(destinationId));
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition hover:scale-105 ${
        saved ? "bg-rose-500 text-white" : "bg-white text-slate-950"
      }`}
      aria-label={saved ? "Remove saved destination" : "Save destination"}
      aria-pressed={saved}
    >
      <Heart size={20} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
