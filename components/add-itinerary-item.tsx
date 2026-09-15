"use client";

import { useState } from "react";
import { CalendarPlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AddItineraryItemProps = {
  tripId: string;
  dayNumber: number;
  onClose: () => void;
};

export default function AddItineraryItem({
  tripId,
  dayNumber,
  onClose,
}: AddItineraryItemProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [notes, setNotes] = useState("");

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
        setError(
          "You must be logged in to add an activity."
        );
        return;
      }

      /*
       * Find the highest existing sort order for this day.
       * The new activity will be placed after it.
       */
      const { data: existingItems, error: orderError } =
        await supabase
          .from("itinerary_items")
          .select("sort_order")
          .eq("trip_id", tripId)
          .eq("day_number", dayNumber)
          .order("sort_order", {
            ascending: false,
          })
          .limit(1);

      if (orderError) {
        console.error(
          "Failed to determine activity order:",
          orderError
        );

        setError(orderError.message);
        return;
      }

      const highestSortOrder =
        existingItems?.[0]?.sort_order ?? -1;

      const nextSortOrder = highestSortOrder + 1;

      const { error: insertError } = await supabase
        .from("itinerary_items")
        .insert({
          trip_id: tripId,
          day_number: dayNumber,
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          start_time: startTime || null,
          end_time: endTime || null,
          estimated_cost:
            Number(estimatedCost) || 0,
          notes: notes.trim() || null,
          sort_order: nextSortOrder,
        });

      if (insertError) {
        console.error(
          "Add itinerary item error:",
          insertError
        );

        const message =
          insertError.message ||
          "Unknown Supabase error.";

        const details = insertError.details || "";
        const hint = insertError.hint || "";
        const code = insertError.code || "";

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
        "Unexpected itinerary error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while adding the activity."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarPlus
              size={20}
              className="text-slate-700"
            />

            <h3 className="text-lg font-bold text-slate-950">
              Add activity
            </h3>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Add something to Day {dayNumber}.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 transition hover:text-slate-950"
          aria-label="Close"
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
            htmlFor="activity-title"
            className="text-sm font-semibold text-slate-800"
          >
            Activity name
          </label>

          <input
            id="activity-title"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Visit the Taj Mahal"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        <div>
          <label
            htmlFor="activity-description"
            className="text-sm font-semibold text-slate-800"
          >
            Description
          </label>

          <textarea
            id="activity-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="What do you want to do here?"
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        <div>
          <label
            htmlFor="activity-location"
            className="text-sm font-semibold text-slate-800"
          >
            Location
          </label>

          <input
            id="activity-location"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            placeholder="Agra, Uttar Pradesh"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="activity-start"
              className="text-sm font-semibold text-slate-800"
            >
              Start time
            </label>

            <input
              id="activity-start"
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
              htmlFor="activity-end"
              className="text-sm font-semibold text-slate-800"
            >
              End time
            </label>

            <input
              id="activity-end"
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
            htmlFor="activity-cost"
            className="text-sm font-semibold text-slate-800"
          >
            Estimated cost
          </label>

          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₹
            </span>

            <input
              id="activity-cost"
              type="number"
              min="0"
              value={estimatedCost}
              onChange={(event) =>
                setEstimatedCost(event.target.value)
              }
              placeholder="500"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm outline-none transition focus:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="activity-notes"
            className="text-sm font-semibold text-slate-800"
          >
            Notes
          </label>

          <textarea
            id="activity-notes"
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            placeholder="Anything you want to remember..."
            rows={2}
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            <strong>
              Couldn't add activity.
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

            {loading
              ? "Saving..."
              : "Add activity"}
          </button>
        </div>
      </form>
    </div>
  );
}