import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Trip = {
  id: string;
  name: string;
  destination_id: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  budget: number;
  interests: string[];
  created_at: string;
  destinations:
    | {
        name: string;
        country: string;
        image_url: string | null;
      }
    | null;
};

function formatDate(date: string | null) {
  if (!date) return "Dates not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatBudget(budget: number | null) {
  if (!budget || budget <= 0) return "Budget not set";

  return `₹${budget.toLocaleString("en-IN")}`;
}

export default async function MyTripsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-950">
            Sign in to view your trips
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your saved trips will appear here after you sign in.
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const { data: trips, error } = await supabase
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
      created_at,
      destinations (
        name,
        country,
        image_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load trips:", error);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Your travel plans
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                My Trips
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
                Keep all your adventures in one place and start planning your
                next journey.
              </p>
            </div>

            <Link
              href="/planner"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={18} />
              New trip
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {trips && trips.length > 0 ? (
            <>
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {trips.length} {trips.length === 1 ? "trip" : "trips"}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    Your adventures
                  </h2>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/my-trips/${trip.id}`}
                    className="group block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                      {trip.destinations?.image_url ? (
                        <img
                          src={trip.destinations.image_url}
                          alt={trip.destinations.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                          No destination image
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {trip.destinations && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm font-medium text-white">
                          <MapPin size={16} />
                          <span>
                            {trip.destinations.name},{" "}
                            {trip.destinations.country}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold tracking-tight text-slate-950">
                            {trip.name}
                          </h3>

                          {trip.destinations && (
                            <p className="mt-1 text-sm text-slate-500">
                              {trip.destinations.name}
                            </p>
                          )}
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
                          <ArrowRight size={17} />
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <CalendarDays
                            size={17}
                            className="shrink-0 text-slate-400"
                          />
                          <span>
                            {formatDate(trip.start_date)}{" "}
                            {trip.end_date
                              ? `— ${formatDate(trip.end_date)}`
                              : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <Users
                            size={17}
                            className="shrink-0 text-slate-400"
                          />
                          <span>
                            {trip.travelers}{" "}
                            {trip.travelers === 1 ? "traveler" : "travelers"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <Wallet
                            size={17}
                            className="shrink-0 text-slate-400"
                          />
                          <span>{formatBudget(trip.budget)}</span>
                        </div>
                      </div>

                      {trip.interests && trip.interests.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {trip.interests.slice(0, 3).map((interest) => (
                            <span
                              key={interest}
                              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <MapPin size={28} className="text-slate-500" />
              </div>

              <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                No trips yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Your next adventure is waiting. Create your first trip and
                start building your perfect itinerary.
              </p>

              <Link
                href="/planner"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus size={18} />
                Create your first trip
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}