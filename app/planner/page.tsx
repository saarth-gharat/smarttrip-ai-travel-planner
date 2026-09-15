"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  MapPin,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Destination = {
  id: string;
  name: string;
  country: string;
};

const interests = [
  "Beaches",
  "Food",
  "Adventure",
  "Nature",
  "Culture",
  "History",
  "Nightlife",
  "Shopping",
  "Relaxation",
  "Photography",
];

export default function PlannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const [destinationId, setDestinationId] = useState(
    searchParams.get("destination") || ""
  );

  const [days, setDays] = useState("4");
  const [people, setPeople] = useState("2");
  const [budget, setBudget] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDestinations() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("destinations")
        .select("id, name, country")
        .order("name", { ascending: true });

      if (error) {
        console.error("Destination loading error:", error);
        setError("Could not load destinations.");
        setLoadingDestinations(false);
        return;
      }

      setDestinations(data || []);
      setLoadingDestinations(false);
    }

    loadDestinations();
  }, []);

  function toggleInterest(interest: string) {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!destinationId) {
      setError("Please choose a destination.");
      return;
    }

    const dayCount = Number(days);
    const personCount = Number(people);
    const budgetAmount = Number(budget);

    if (!Number.isInteger(dayCount) || dayCount < 1 || dayCount > 60) {
      setError("Please enter a trip length between 1 and 60 days.");
      return;
    }

    if (
      !Number.isInteger(personCount) ||
      personCount < 1 ||
      personCount > 50
    ) {
      setError("Please enter between 1 and 50 travelers.");
      return;
    }

    if (!Number.isFinite(budgetAmount) || budgetAmount <= 0) {
      setError("Please enter a valid total budget.");
      return;
    }

    if (selectedInterests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      /*
       * For now we store the user's preferences in sessionStorage.
       * In the next step, the AI will use these exact values
       * to generate the recommendation.
       */
      const selectedDestination = destinations.find(
        (destination) => destination.id === destinationId
      );

      sessionStorage.setItem(
        "travelora_ai_request",
        JSON.stringify({
          destination_id: destinationId,
          destination_name: selectedDestination?.name || "",
          country: selectedDestination?.country || "",
          days: dayCount,
          people: personCount,
          budget: budgetAmount,
          interests: selectedInterests,
        })
      );

      router.push("/planner/recommendation");
    } catch (submitError) {
      console.error("Planner error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Sparkles className="h-7 w-7 text-white" />
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-white/60">
              Travelora AI
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Tell us about your trip.
              <span className="block text-white/60">
                We&apos;ll plan the rest.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Give us your destination, time, budget, group size and interests.
              Travelora AI will recommend the best places, stay and itinerary
              for you.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
        >
          <div className="grid gap-8">
            {/* Destination */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Where do you want to go?
                  </h2>

                  <p className="text-sm text-slate-500">
                    Tell Travelora your main destination.
                  </p>
                </div>
              </div>

              <select
                value={destinationId}
                onChange={(event) => setDestinationId(event.target.value)}
                disabled={loadingDestinations}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-medium text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
              >
                <option value="">
                  {loadingDestinations
                    ? "Loading destinations..."
                    : "Choose a destination"}
                </option>

                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.name}, {destination.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Days / People */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <CalendarDays className="h-5 w-5 text-slate-700" />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      How many days?
                    </h2>
                    <p className="text-sm text-slate-500">
                      Your total trip length.
                    </p>
                  </div>
                </div>

                <input
                  type="number"
                  min="1"
                  max="60"
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                  className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base font-medium text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  placeholder="4"
                />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Users className="h-5 w-5 text-slate-700" />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      How many people?
                    </h2>
                    <p className="text-sm text-slate-500">
                      Everyone traveling with you.
                    </p>
                  </div>
                </div>

                <input
                  type="number"
                  min="1"
                  max="50"
                  value={people}
                  onChange={(event) => setPeople(event.target.value)}
                  className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base font-medium text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  placeholder="2"
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Wallet className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    What&apos;s your total budget?
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your total budget for the whole trip.
                  </p>
                </div>
              </div>

              <div className="relative mt-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 py-4 pl-10 pr-4 text-base font-medium text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  placeholder="40000"
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Travelora will try to keep your recommendations within this
                budget.
              </p>
            </div>

            {/* Interests */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Heart className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    What are you interested in?
                  </h2>

                  <p className="text-sm text-slate-500">
                    Choose everything you enjoy.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {interests.map((interest) => {
                  const selected = selectedInterests.includes(interest);

                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                        selected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {selected && <Check className="h-4 w-4" />}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium leading-6 text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || loadingDestinations}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5" />

              {loading ? "Preparing your trip..." : "Plan my trip with AI"}

              {!loading && (
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}