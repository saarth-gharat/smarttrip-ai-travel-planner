"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Hotel,
  MapPin,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AddItineraryItem from "@/components/add-itinerary-item";
import ItineraryList from "@/components/itinerary-list";

type Trip = {
  id: string;
  name: string;
  destination_id: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  budget: number;
  interests: string[];
  selected_area: string | null;
  hotel_name: string | null;
  ai_generated: boolean;
  created_at: string;
  destinations:
    | {
        name: string;
        country: string;
        image_url: string | null;
      }
    | null;
};

type ItineraryItem = {
  id: string;
  trip_id: string;
  day_number: number;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  estimated_cost: number;
  notes: string | null;
  sort_order: number;
};

function formatDate(date: string | null) {
  if (!date) return "Not set";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatBudget(amount: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function calculateDayCount(
  startDate: string | null,
  endDate: string | null
) {
  if (!startDate || !endDate) {
    return 1;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const difference =
    Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  return Math.min(Math.max(difference, 1), 60);
}

export default function TripDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [tripId, setTripId] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [activeDay, setActiveDay] = useState(1);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrip() {
      try {
        const { id } = await params;

        setTripId(id);

        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/auth/login");
          return;
        }

        const { data: tripData, error: tripError } = await supabase
          .from("trips")
          .select(`
            id,
            name,
            destination_id,
            start_date,
            end_date,
            travelers,
            budget,
            interests,
            selected_area,
            hotel_name,
            ai_generated,
            created_at,
            destinations (
              name,
              country,
              image_url
            )
          `)
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (tripError) {
          console.error("Trip loading error:", tripError);

          setError(
            tripError.message || "Could not load this trip."
          );

          return;
        }

        const destinations = Array.isArray(tripData.destinations)
          ? tripData.destinations[0] ?? null
          : tripData.destinations;

        setTrip({ ...tripData, destinations } as Trip);

        const { data: itineraryData, error: itineraryError } =
          await supabase
            .from("itinerary_items")
            .select(`
              id,
              trip_id,
              day_number,
              title,
              description,
              location,
              start_time,
              end_time,
              estimated_cost,
              notes,
              sort_order
            `)
            .eq("trip_id", id)
            .order("day_number", { ascending: true })
            .order("sort_order", { ascending: true });

        if (itineraryError) {
          console.error(
            "Itinerary loading error:",
            itineraryError
          );

          setError(
            itineraryError.message ||
              "Could not load the itinerary."
          );

          return;
        }

        setItems((itineraryData || []) as ItineraryItem[]);
      } catch (loadError) {
        console.error(
          "Unexpected trip loading error:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Something went wrong while loading the trip."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [params, router]);

  /*
   * AI-generated trips don't have calendar dates yet because
   * the AI planner intentionally uses only five inputs.
   *
   * For those trips, determine the number of days from the
   * itinerary itself.
   */
  const itineraryDayCount = useMemo(() => {
    if (items.length === 0) {
      return 1;
    }

    return Math.max(
      1,
      ...items.map((item) => item.day_number)
    );
  }, [items]);

  const calendarDayCount = useMemo(
    () =>
      calculateDayCount(
        trip?.start_date ?? null,
        trip?.end_date ?? null
      ),
    [trip?.start_date, trip?.end_date]
  );

  const dayCount = trip?.ai_generated
    ? itineraryDayCount
    : calendarDayCount;

  const currentDayItems = useMemo(
    () =>
      items
        .filter((item) => item.day_number === activeDay)
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, activeDay]
  );

  const totalEstimatedActivityCost = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + Number(item.estimated_cost || 0),
        0
      ),
    [items]
  );

  function handleItemsChange(
    updatedItems: ItineraryItem[]
  ) {
    setItems((currentItems) => {
      const updatedIds = new Set(
        updatedItems.map((item) => item.id)
      );

      return [
        ...currentItems.filter(
          (item) => !updatedIds.has(item.id)
        ),
        ...updatedItems,
      ];
    });
  }

  function moveDay(direction: "up" | "down") {
    if (direction === "up" && activeDay > 1) {
      setActiveDay((day) => day - 1);
    }

    if (
      direction === "down" &&
      activeDay < dayCount
    ) {
      setActiveDay((day) => day + 1);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 h-48 animate-pulse rounded-3xl bg-slate-200" />
          <div className="mt-8 h-40 animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (error || !trip || !tripId) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/my-trips"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Trips
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-xl font-bold text-red-900">
              Trip could not be loaded
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {error ||
                "This trip does not exist or you do not have access to it."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}
        <Link
          href="/my-trips"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Trips
        </Link>

        {/* Hero */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="relative h-64 overflow-hidden sm:h-80">
            {trip.destinations?.image_url ? (
              <img
                src={trip.destinations.image_url}
                alt={trip.destinations.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">

              {trip.ai_generated && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md ring-1 ring-white/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Generated Trip
                </div>
              )}

              <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
                {trip.destinations?.country || "Your trip"}
              </p>

              <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
                {trip.name}
              </h1>

              {trip.destinations && (
                <div className="mt-2 flex items-center gap-2 text-white/90">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.destinations.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Trip information */}
          <div className="grid gap-4 border-t border-slate-100 p-6 sm:grid-cols-2 lg:grid-cols-4">

            <InfoItem
              icon={<CalendarDays className="h-5 w-5 text-slate-700" />}
              label="Duration"
              value={`${dayCount} ${
                dayCount === 1 ? "day" : "days"
              }`}
            />

            <InfoItem
              icon={<Users className="h-5 w-5 text-slate-700" />}
              label="Travelers"
              value={String(trip.travelers)}
            />

            <InfoItem
              icon={<DollarSign className="h-5 w-5 text-slate-700" />}
              label="Budget"
              value={formatBudget(trip.budget)}
            />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Interests
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {trip.interests?.length ? (
                  trip.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">
                    No interests selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI trip details */}
          {trip.ai_generated && (
            <div className="border-t border-slate-100 bg-slate-50 p-6">

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Bot className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Travelora AI
                  </p>

                  <h2 className="text-lg font-black text-slate-900">
                    Your selected base
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <MapPin className="h-5 w-5 text-slate-700" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Selected area
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {trip.selected_area || "Not set"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <Hotel className="h-5 w-5 text-slate-700" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Selected hotel
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {trip.hotel_name || "Not set"}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                <p className="text-sm leading-6 text-amber-800">
                  Hotel prices, ratings and activity costs from the AI
                  planning stage are estimates. They are not live booking
                  prices or availability.
                </p>
              </div>
            </div>
          )}

          {/* Normal trip dates */}
          {!trip.ai_generated && (
            <div className="border-t border-slate-100 px-6 py-5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4" />

                <span>
                  {formatDate(trip.start_date)}
                  {trip.start_date && trip.end_date
                    ? " – "
                    : ""}
                  {formatDate(trip.end_date)}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Main content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* Itinerary */}
          <section>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Your itinerary
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Day {activeDay}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAddActivity(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add activity
              </button>
            </div>

            {/* Day selector */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">

              {Array.from(
                { length: dayCount },
                (_, index) => {
                  const day = index + 1;

                  const hasItems = items.some(
                    (item) =>
                      item.day_number === day
                  );

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() =>
                        setActiveDay(day)
                      }
                      className={`relative shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        activeDay === day
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Day {day}

                      {hasItems && (
                        <span
                          className={`ml-2 inline-block h-1.5 w-1.5 rounded-full ${
                            activeDay === day
                              ? "bg-white"
                              : "bg-slate-400"
                          }`}
                        />
                      )}
                    </button>
                  );
                }
              )}

            </div>

            {/* Day navigation */}
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">

              <button
                type="button"
                onClick={() => moveDay("up")}
                disabled={activeDay === 1}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
                Previous day
              </button>

              <span className="text-sm font-bold text-slate-700">
                Day {activeDay} of {dayCount}
              </span>

              <button
                type="button"
                onClick={() => moveDay("down")}
                disabled={activeDay === dayCount}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next day
                <ChevronDown className="h-4 w-4" />
              </button>

            </div>

            {/* Activities */}
            <div className="mt-5">
              <ItineraryList
                items={currentDayItems}
                onItemsChange={handleItemsChange}
              />
            </div>
          </section>

          {/* Sidebar */}
          <aside className="h-fit space-y-5">

            {/* Summary */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-black text-slate-900">
                Trip summary
              </h3>

              <div className="mt-5 space-y-4">

                <SummaryRow
                  label="Destination"
                  value={
                    trip.destinations
                      ? `${trip.destinations.name}, ${trip.destinations.country}`
                      : "Not selected"
                  }
                />

                {trip.selected_area && (
                  <SummaryRow
                    label="Area"
                    value={trip.selected_area}
                  />
                )}

                {trip.hotel_name && (
                  <SummaryRow
                    label="Hotel"
                    value={trip.hotel_name}
                  />
                )}

                <SummaryRow
                  label="Duration"
                  value={`${dayCount} ${
                    dayCount === 1
                      ? "day"
                      : "days"
                  }`}
                />

                <SummaryRow
                  label="Activities"
                  value={String(items.length)}
                />

                <SummaryRow
                  label="Budget"
                  value={formatBudget(trip.budget)}
                />

              </div>
            </div>

            {/* Activity cost */}
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Activity estimates
              </p>

              <p className="mt-2 text-3xl font-black">
                {formatBudget(totalEstimatedActivityCost)}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Sum of the estimated activity costs currently saved in your
                itinerary.
              </p>

            </div>

            {/* AI badge */}
            {trip.ai_generated && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="font-black text-slate-900">
                      AI planned
                    </p>

                    <p className="text-xs text-slate-500">
                      Personalized around your interests
                    </p>
                  </div>

                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {trip.interests?.map(
                    (interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {interest}
                      </span>
                    )
                  )}
                </div>

              </div>
            )}
          </aside>
        </div>
      </div>

      {showAddActivity && (
        <AddItineraryItem
          tripId={trip.id}
          dayNumber={activeDay}
          onClose={() =>
            setShowAddActivity(false)
          }
        />
      )}
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="text-sm font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}
