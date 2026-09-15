import Link from "next/link";
import { ArrowLeft, Heart, MapPin, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type DestinationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DestinationPage({
  params,
}: DestinationPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: destination, error: destinationError } = await supabase
    .from("destinations")
    .select("*")
    .eq("id", id)
    .single();

  if (destinationError) {
    console.error("Destination error:", destinationError);
  }

  if (!destination) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-950">
            Destination not found
          </h1>

          <p className="mt-3 text-slate-500">
            We couldn't find the destination you're looking for.
          </p>

          <Link
            href="/explore"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to explore
          </Link>
        </div>
      </main>
    );
  }

  const { data: places, error: placesError } = await supabase
    .from("places")
    .select("*")
    .eq("destination_id", id)
    .order("rating", { ascending: false });

  if (placesError) {
    console.error("Places error:", placesError);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative h-[600px] overflow-hidden">
        <img
          src={destination.image_url ?? ""}
          alt={destination.name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-5 pb-12 pt-8 lg:px-8">
          {/* Back button */}
          <Link
            href="/explore"
            className="flex w-fit items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-black/30"
          >
            <ArrowLeft size={17} />
            Back to explore
          </Link>

          {/* Destination information */}
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm text-white/80">
                <MapPin size={16} />
                {destination.country}
              </div>

              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
                {destination.name}
              </h1>
            </div>

            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg transition hover:scale-105"
              aria-label="Save destination"
            >
              <Heart size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          {/* Left side */}
          <div>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              {destination.description}
            </p>

            {/* Places */}
            <div className="mt-12">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Discover
                  </p>

                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    Places to visit
                  </h2>
                </div>

                <span className="text-sm text-slate-500">
                  {places?.length ?? 0} places
                </span>
              </div>

              {places && places.length > 0 ? (
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  {places.map((place) => (
                    <article
                      key={place.id}
                      className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
                    >
                      {/* Place image */}
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={place.image_url ?? ""}
                          alt={place.name}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      </div>

                      {/* Place content */}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {place.category}
                          </span>

                          <div className="flex items-center gap-1 text-sm font-medium text-slate-800">
                            <Star size={15} fill="currentColor" />
                            {place.rating ?? "—"}
                          </div>
                        </div>

                        <h3 className="mt-4 text-xl font-semibold text-slate-950">
                          {place.name}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {place.description}
                        </p>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                          <span className="text-sm text-slate-500">
                            Estimated cost
                          </span>

                          <span className="text-sm font-semibold text-slate-900">
                            ₹{place.estimated_cost ?? 0}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <p className="font-medium text-slate-800">
                    No places added yet.
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Places for this destination will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <aside>
            <div className="sticky top-8 rounded-3xl bg-slate-950 p-7 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">
                Ready to go?
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Plan your {destination.name} trip.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/60">
                Build a personalized itinerary around your dates, interests,
                and budget.
              </p>

              <Link
                href={`/planner?destination=${destination.id}`}
                className="mt-7 flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Start planning
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}