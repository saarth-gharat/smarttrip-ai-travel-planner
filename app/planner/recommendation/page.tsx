"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Check,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";

type AIRequest = {
  destination_id: string;
  destination_name: string;
  country: string;
  days: number;
  people: number;
  budget: number;
  interests: string[];
};

type AreaRecommendation = {
  name: string;
  description: string;
  whyRecommended: string;
  estimatedDailySpendPerPerson: number;
  score: number;
};

type HotelRecommendation = {
  name: string;
  area: string;
  description: string;
  estimatedNightlyPrice: number;
  estimatedTotalStay: number;
  rating: number;
  score: number;
  budgetFit: string;
};

type AIRecommendation = {
  summary: string;
  recommendedAreas: AreaRecommendation[];
  recommendedHotels: HotelRecommendation[];
  estimatedExpenses: {
    hotel: number;
    food: number;
    transport: number;
    activities: number;
    miscellaneous: number;
    total: number;
  };
  bestArea: string;
  bestHotel: string;
  budgetStatus: string;
  budgetRemaining: number;
  recommendationReason: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RecommendationPage() {
  const router = useRouter();

  const [request, setRequest] = useState<AIRequest | null>(null);
  const [recommendation, setRecommendation] =
    useState<AIRecommendation | null>(null);

  const [selectedArea, setSelectedArea] = useState("");
  const [selectedHotel, setSelectedHotel] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedRequest = sessionStorage.getItem("travelora_ai_request");

    if (!storedRequest) {
      router.replace("/planner");
      return;
    }

    try {
      const parsedRequest = JSON.parse(storedRequest) as AIRequest;
      setRequest(parsedRequest);

      generateRecommendation(parsedRequest);
    } catch {
      setError("We couldn't read your trip details.");
      setLoading(false);
    }
  }, [router]);

  async function generateRecommendation(tripRequest: AIRequest) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: tripRequest.destination_name,
          country: tripRequest.country,
          days: tripRequest.days,
          people: tripRequest.people,
          budget: tripRequest.budget,
          interests: tripRequest.interests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to generate recommendations."
        );
      }

      if (!data.recommendation) {
        throw new Error("The AI did not return recommendations.");
      }

      const result = data.recommendation as AIRecommendation;

      setRecommendation(result);

      if (result.bestArea) {
        setSelectedArea(result.bestArea);
      } else if (result.recommendedAreas?.length) {
        setSelectedArea(result.recommendedAreas[0].name);
      }

      if (result.bestHotel) {
        setSelectedHotel(result.bestHotel);
      } else if (result.recommendedHotels?.length) {
        setSelectedHotel(result.recommendedHotels[0].name);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating recommendations."
      );
    } finally {
      setLoading(false);
    }
  }

  function continueToItinerary() {
    if (!request || !recommendation) return;

    const selectedHotelData =
      recommendation.recommendedHotels.find(
        (hotel) => hotel.name === selectedHotel
      ) || recommendation.recommendedHotels[0];

    sessionStorage.setItem(
      "travelora_ai_selection",
      JSON.stringify({
        ...request,
        selected_area: selectedArea,
        selected_hotel: selectedHotel,
        selected_hotel_data: selectedHotelData,
        recommendation,
      })
    );

    router.push("/planner/itinerary");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Travelora AI is planning your trip
            </h1>

            <p className="mt-3 text-slate-600">
              We&apos;re analyzing your destination, budget, travelers and
              interests to find the best travel strategy.
            </p>

            <div className="mx-auto mt-8 h-2 w-56 overflow-hidden rounded-full bg-slate-200">
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              We couldn&apos;t generate your recommendations
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {error}
            </p>

            <button
              onClick={() => router.push("/planner")}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to planner
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!request || !recommendation) {
    return null;
  }

  const expenses = recommendation.estimatedExpenses;

  const budgetPercentage = Math.min(
    100,
    Math.round((expenses.total / request.budget) * 100)
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            <Sparkles className="h-4 w-4" />
            Travelora AI
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Your {request.destination_name} trip strategy
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            {recommendation.summary}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
              {request.days} days
            </span>

            <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
              {request.people} travelers
            </span>

            <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
              Budget {formatCurrency(request.budget)}
            </span>
          </div>
        </div>

        {/* Best area */}
        <section>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Step 1
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Choose the best area
            </h2>

            <p className="mt-2 text-slate-600">
              Travelora AI ranked these areas according to your budget and
              interests.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {recommendation.recommendedAreas.map((area) => {
              const selected = selectedArea === area.name;

              return (
                <button
                  key={area.name}
                  onClick={() => setSelectedArea(area.name)}
                  className={`text-left rounded-3xl border p-6 transition ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white shadow-xl"
                      : "border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-white/10"
                          : "bg-slate-100"
                      }`}
                    >
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        selected
                          ? "bg-white text-slate-900"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {area.score}/100
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-bold">{area.name}</h3>

                  <p
                    className={`mt-2 text-sm leading-6 ${
                      selected ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {area.description}
                  </p>

                  <div
                    className={`mt-5 border-t pt-4 ${
                      selected
                        ? "border-white/10"
                        : "border-slate-100"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        selected ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Why AI recommends it
                    </p>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        selected ? "text-slate-200" : "text-slate-700"
                      }`}
                    >
                      {area.whyRecommended}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        selected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      Estimated daily spend
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(area.estimatedDailySpendPerPerson)}
                    </span>
                  </div>

                  {selected && (
                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold">
                      <Check className="h-4 w-4" />
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Hotels */}
        <section className="mt-14">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Step 2
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Choose your hotel
            </h2>

            <p className="mt-2 text-slate-600">
              These are AI recommendations based on your trip budget. Prices
              shown here are estimates, not live booking prices.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {recommendation.recommendedHotels.map((hotel) => {
              const selected = selectedHotel === hotel.name;

              return (
                <button
                  key={hotel.name}
                  onClick={() => {
                    setSelectedHotel(hotel.name);
                    setSelectedArea(hotel.area);
                  }}
                  className={`text-left rounded-3xl border p-6 transition ${
                    selected
                      ? "border-slate-900 bg-white shadow-xl ring-2 ring-slate-900"
                      : "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                      <Building2 className="h-5 w-5 text-slate-700" />
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      AI {hotel.score}/100
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    {hotel.name}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {hotel.area}
                  </p>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {hotel.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-500">Estimated rating</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {hotel.rating.toFixed(1)} / 5
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">Estimated / night</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatCurrency(hotel.estimatedNightlyPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Estimated total stay
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {formatCurrency(hotel.estimatedTotalStay)}
                    </p>
                  </div>

                  {selected && (
                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Check className="h-4 w-4" />
                      Selected hotel
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Expenses */}
        <section className="mt-14">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Step 3
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Estimated trip budget
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-5">
                <ExpenseRow
                  label="Hotel"
                  value={expenses.hotel}
                />

                <ExpenseRow
                  label="Food"
                  value={expenses.food}
                />

                <ExpenseRow
                  label="Transport"
                  value={expenses.transport}
                />

                <ExpenseRow
                  label="Activities"
                  value={expenses.activities}
                />

                <ExpenseRow
                  label="Miscellaneous"
                  value={expenses.miscellaneous}
                />

                <div className="border-t border-slate-200 pt-5">
                  <ExpenseRow
                    label="Estimated total"
                    value={expenses.total}
                    strong
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Wallet className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm text-slate-400">Your budget</p>
                  <p className="font-semibold">
                    {formatCurrency(request.budget)}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold">
                    {formatCurrency(expenses.total)}
                  </p>

                  <p className="text-sm text-slate-400">
                    {budgetPercentage}% used
                  </p>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${budgetPercentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">
                  Budget status
                </p>

                <p className="mt-1 font-semibold capitalize">
                  {recommendation.budgetStatus.replaceAll("_", " ")}
                </p>
              </div>

              <div className="mt-4 rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">
                  Estimated remaining
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatCurrency(
                    Math.max(0, recommendation.budgetRemaining)
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI explanation */}
        <section className="mt-14">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Why Travelora chose this strategy
                </h2>

                <p className="mt-3 max-w-4xl leading-7 text-slate-600">
                  {recommendation.recommendationReason}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Continue */}
        <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-3xl bg-slate-900 p-6 text-white sm:flex-row">
          <div>
            <p className="text-lg font-bold">
              Ready to build your itinerary?
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {selectedArea} • {selectedHotel}
            </p>
          </div>

          <button
            onClick={continueToItinerary}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
          >
            Build my itinerary
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

function ExpenseRow({
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
          strong
            ? "font-bold text-slate-900"
            : "text-slate-600"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-bold text-slate-900"
            : "font-semibold text-slate-900"
        }
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}