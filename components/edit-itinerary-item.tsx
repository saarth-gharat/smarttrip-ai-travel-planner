"use client";

import { useState } from "react";
import { Loader2, Pencil, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ItineraryItem = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  estimated_cost: number;
  notes: string | null;
};

type EditItineraryItemProps = {
  item: ItineraryItem;
  onClose: () => void;
};

export default function EditItineraryItem({
  item,
  onClose,
}: EditItineraryItemProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(
    item.description ?? ""
  );
  const [location, setLocation] = useState(item.location ?? "");
  const [startTime, setStartTime] = useState(
    item.start_time ? item.start_time.slice(0, 5) : ""
  );
  const [endTime, setEndTime] = useState(
    item.end_time ? item.end_time.slice(0, 5) : ""
  );
  const [estimatedCost, setEstimatedCost] = useState(
    item.estimated_cost ? String(item.estimated_cost) : ""
  );
  const [notes, setNotes] = useState(item.notes ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter an activity name.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to edit an activity.");
        return;
      }

      const { error: updateError } = await supabase
        .from("itinerary_items")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          start_time: startTime || null,
          end_time: endTime || null,
          estimated_cost: Number(estimatedCost) || 0,
          notes: notes.trim() || null,
        })
        .eq("id", item.id);

      if (updateError) {
        console.error(
          "Edit itinerary item error:",
          updateError
        );

        const message =
          updateError.message ||
          "Unknown Supabase error.";

        const details = updateError.details || "";
        const hint = updateError.hint || "";
        const code = updateError.code || "";

        setError(
          [
            message,
            details,
            hint,
            code ? `Error code: ${code}` : "",
          ]
            .filter(Boolean)
            .join(" ")
        );

        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(
        "Unexpected itinerary edit error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while editing the activity."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Pencil
              size={19}
              className="text-slate-700"
            />

            <h3 className="text-lg font-bold text-slate-950">
              Edit activity
            </h3>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Update the details of this activity.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 transition hover:text-slate-950"
          aria-label="Close edit form"
        >
          <X size={17} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        <div>
          <label
            htmlFor={`edit-title-${item.id}`}
            className="text-sm font-semibold text-slate-800"
          >
            Activity name
          </label>

          <input
            id={`edit-title-${item.id}`}
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        <div>
          <label
            htmlFor={`edit-description-${item.id}`}
            className="text-sm font-semibold text-slate-800"
          >
            Description
          </label>

          <textarea
            id={`edit-description-${item.id}`}
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        <div>
          <label
            htmlFor={`edit-location-${item.id}`}
            className="text-sm font-semibold text-slate-800"
          >
            Location
          </label>

          <input
            id={`edit-location-${item.id}`}
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`edit-start-${item.id}`}
              className="text-sm font-semibold text-slate-800"
            >
              Start time
            </label>

            <input
              id={`edit-start-${item.id}`}
              type="time"
              value={startTime}
              onChange={(event) =>
                setStartTime(event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor={`edit-end-${item.id}`}
              className="text-sm font-semibold text-slate-800"
            >
              End time
            </label>

            <input
              id={`edit-end-${item.id}`}
              type="time"
              value={endTime}
              onChange={(event) =>
                setEndTime(event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`edit-cost-${item.id}`}
            className="text-sm font-semibold text-slate-800"
          >
            Estimated cost
          </label>

          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₹
            </span>

            <input
              id={`edit-cost-${item.id}`}
              type="number"
              min="0"
              value={estimatedCost}
              onChange={(event) =>
                setEstimatedCost(event.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm outline-none transition focus:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`edit-notes-${item.id}`}
            className="text-sm font-semibold text-slate-800"
          >
            Notes
          </label>

          <textarea
            id={`edit-notes-${item.id}`}
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            rows={2}
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            <strong>
              Couldn&apos;t update activity.
            </strong>

            <br />

            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : null}

            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
