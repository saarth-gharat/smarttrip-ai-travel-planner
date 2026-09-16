"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Save,
  Sparkles,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AISelection = {
  destination_id: string;
  destination_name: string;
  country: string;
  days: number;
  people: number;
  budget: number;
  interests: string[];
  selected_area: string;
  selected_hotel: string;
};

type Activity = {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  estimatedCostPerPerson: number;
  category: string;
};

type ItineraryDay = {
  day: number;
  title: string;
  summary: string;
  activities: Activity[];
  estimatedDailyCostPerPerson: number;
};

type AIItinerary = {
  title: string;
  overview: string;
  days: ItineraryDay[];
  estimatedActivityCost: number;
  estimatedTransportCost: number;
  estimatedFoodCost: number;
  estimatedMiscellaneousCost: number;
  estimatedTotalWithoutHotel: number;
  budgetAdvice: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function AIItineraryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selection, setSelection] = useState<AISelection | null>(null);
  const [itinerary, setItinerary] = useState<AIItinerary | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const generateItinerary = useCallback(async (trip: AISelection) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: trip.destination_name,
          country: trip.country,
          days: trip.days,
          people: trip.people,
          budget: trip.budget,
          interests: trip.interests,
          selectedArea: trip.selected_area,
          selectedHotel: trip.selected_hotel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to generate your itinerary."
        );
      }

      if (!data.itinerary) {
        throw new Error("The AI did not return an itinerary.");
      }

      setItinerary(data.itinerary as AIItinerary);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating your itinerary."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadItinerary() {
      const storedSelection = sessionStorage.getItem(
        "travelora_ai_selection"
      );

      if (!storedSelection) {
        router.replace("/planner");
        return;
      }

      try {
        const parsed = JSON.parse(storedSelection) as AISelection;
        if (!active) return;
        setSelection(parsed);
        await generateItinerary(parsed);
      } catch {
        if (!active) return;
        setError("We couldn't read your selected trip.");
        setLoading(false);
      }
    }

    void loadItinerary();

    return () => {
      active = false;
    };
  }, [generateItinerary, router]);

  async function saveTrip() {
    if (!selection || !itinerary) {
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        router.push("/auth/login");
        return;
      }

      /*
       * Create the trip first.
       *
       * Dates are intentionally left empty because the new Travelora AI
       * planner currently asks for only five inputs:
       * destination, days, budget, people and interests.
       */
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          user_id: user.id,
          name: itinerary.title || `${selection.destination_name} Trip`,
          title: itinerary.title || `${selection.destination_name} Trip`,
          destination_id: selection.destination_id || null,
          start_date: null,
          end_date: null,
          travelers: selection.people,
          budget: selection.budget,
          interests: selection.interests,
          selected_area: selection.selected_area,
          hotel_name: selection.selected_hotel,
          ai_generated: true,
        })
        .select("id")
        .single();

      if (tripError || !trip) {
        throw new Error(
          tripError?.message || "Unable to create your trip."
        );
      }

      /*
       * Convert the AI itinerary into Travelora's existing
       * itinerary_items structure.
       */
      const itineraryRows = itinerary.days.flatMap((day) =>
        day.activities.map((activity, index) => ({
          trip_id: trip.id,
          trip_day_id: null,
          day_number: day.day,
          title: activity.title,
          description: activity.description || null,
          location: activity.location || null,
          start_time: activity.startTime || null,
          end_time: activity.endTime || null,
          estimated_cost:
            Number(activity.estimatedCostPerPerson) || 0,
          notes: `AI suggested activity • ${activity.category || "Travel"}`,
          sort_order: index,
        }))
      );

      if (itineraryRows.length > 0) {
        const { error: itemsError } = await supabase
          .from("itinerary_items")
          .insert(itineraryRows);

        if (itemsError) {
          /*
           * Delete the trip if activities could not be saved.
           * Because itinerary_items.trip_id uses ON DELETE CASCADE,
           * this also removes any activity rows that may have been inserted.
           */
          await supabase
            .from("trips")
            .delete()
            .eq("id", trip.id);

          throw new Error(
            `Trip was not saved completely: ${itemsError.message}`
          );
        }
      }

      /*
       * Clear the temporary AI session data after a successful save.
       */
      sessionStorage.removeItem("travelora_ai_request");
      sessionStorage.removeItem("travelora_ai_selection");

      router.push(`/my-trips/${trip.id}`);
    } catch (err) {
      console.error("Save AI trip error:", err);

      setSaveError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving your trip."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
              Travelora AI is building your itinerary
            </h1>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
              We&apos;re organizing your days around{" "}
              {selection?.selected_area} and your selected hotel.
            </p>

            <div className="mx-auto mt-8 h-2 w-64 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-900" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              We couldn&apos;t build your itinerary
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {error}
            </p>

            <button
              onClick={() => router.push("/planner/recommendation")}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to recommendations
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!selection || !itinerary) {
    return null;
  }

  const totalForGroup =
    itinerary.estimatedTotalWithoutHotel * selection.people;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push("/planner/recommendation")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to recommendations
          </button>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            <Sparkles className="h-4 w-4" />
            Travelora AI
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {itinerary.title}
          </h1>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">
            {itinerary.overview}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <TripBadge
              icon={<MapPin className="h-4 w-4" />}
              text={selection.destination_name}
            />

            <TripBadge
              icon={<MapPin className="h-4 w-4" />}
              text={selection.selected_area}
            />

            <TripBadge
              icon={<CalendarDays className="h-4 w-4" />}
              text={`${selection.days} days`}
            />

            <TripBadge
              icon={<Wallet className="h-4 w-4" />}
              text={`${formatCurrency(selection.budget)} budget`}
            />
          </div>
        </div>

        {/* Hotel */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Your base
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {selection.selected_hotel}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selection.selected_area} • All prices in this itinerary are
                estimates.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              <Check className="h-4 w-4" />
              Selected hotel
            </div>
          </div>
        </section>

        {/* Days */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Your itinerary
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {itinerary.days.length} days planned for you
            </h2>
          </div>

          <div className="space-y-8">
            {itinerary.days.map((day) => (
              <DayCard key={day.day} day={day} />
            ))}
          </div>
        </section>

        {/* Cost summary */}
        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  AI budget advice
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {itinerary.budgetAdvice}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl">
            <p className="text-sm font-medium text-slate-400">
              Estimated trip costs
            </p>

            <div className="mt-5 space-y-4">
              <CostRow
                label="Activities"
                value={itinerary.estimatedActivityCost}
              />

              <CostRow
                label="Transport"
                value={itinerary.estimatedTransportCost}
              />

              <CostRow
                label="Food"
                value={itinerary.estimatedFoodCost}
              />

              <CostRow
                label="Miscellaneous"
                value={itinerary.estimatedMiscellaneousCost}
              />

              <div className="border-t border-white/10 pt-4">
                <CostRow
                  label="Estimated per person"
                  value={itinerary.estimatedTotalWithoutHotel}
                  strong
                />
              </div>

              <CostRow
                label={`Estimated for ${selection.people} people`}
                value={totalForGroup}
                strong
              />
            </div>

            <div className="mt-6 rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-400">Note</p>

              <p className="mt-1 text-sm leading-6 text-slate-300">
                Hotel costs are not included in this section. Activity,
                transport, food and miscellaneous amounts are AI estimates,
                not live prices.
              </p>
            </div>
          </div>
        </section>

        {/* Save trip */}
        <section className="mt-10 rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Save className="h-5 w-5 text-slate-700" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Save this trip
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Save your AI-generated itinerary to your Travelora account. You
            can then edit activities, reorder them, add notes and manage the
            trip from My Trips.
          </p>

          {saveError && (
            <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
              {saveError}
            </div>
          )}

          <button
            onClick={saveTrip}
            disabled={saving}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                Saving your trip...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Trip to My Trips
              </>
            )}
          </button>
        </section>
      </div>
    </main>
  );
}

function TripBadge({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
      {icon}
      {text}
    </div>
  );
}

function DayCard({ day }: { day: ItineraryDay }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
              {day.day}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Day {day.day}
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {day.title}
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {day.summary}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-xl bg-white px-4 py-3 text-right shadow-sm ring-1 ring-slate-200">
            <p className="text-xs text-slate-500">
              Estimated day cost / person
            </p>

            <p className="mt-1 font-bold text-slate-900">
              {formatCurrency(day.estimatedDailyCostPerPerson)}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {day.activities.map((activity, index) => (
          <div
            key={`${day.day}-${activity.title}-${index}`}
            className="px-6 py-6"
          >
            <div className="flex gap-5">
              <div className="hidden w-20 shrink-0 text-right sm:block">
                <p className="text-sm font-bold text-slate-900">
                  {activity.startTime}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {activity.endTime}
                </p>
              </div>

              <div className="relative hidden sm:block">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                  <Clock3 className="h-4 w-4 text-slate-600" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-bold text-slate-900">
                        {activity.title}
                      </h4>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {activity.category}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-sm font-medium text-slate-500">
                      <MapPin className="h-4 w-4" />
                      {activity.location}
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 sm:text-right">
                    <span className="sm:hidden">
                      {activity.startTime} – {activity.endTime}
                    </span>

                    <span className="hidden sm:inline">
                      {formatCurrency(activity.estimatedCostPerPerson)}
                    </span>
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                  {activity.description}
                </p>

                <div className="mt-4 sm:hidden">
                  <span className="text-sm font-semibold text-slate-700">
                    Estimated cost:{" "}
                    {formatCurrency(activity.estimatedCostPerPerson)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function CostRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong ? "font-bold text-white" : "text-sm text-slate-400"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-bold text-white"
            : "text-sm font-semibold text-slate-200"
        }
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}
