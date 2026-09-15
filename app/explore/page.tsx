import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DestinationCard from "@/components/destination-card";

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data: destinations, error } = await supabase
    .from("destinations")
    .select("id, name, country, description, image_url")
    .order("name");

  if (error) {
    console.error("Failed to load destinations:", error);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-10 lg:px-8">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back home
          </Link>

          <div className="mt-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Explore
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Find somewhere
              <br />
              worth going.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500">
              Discover destinations, places and experiences for your next
              adventure.
            </p>
          </div>

          {/* Search */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <Search size={19} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search destinations..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-500">
                {destinations?.length ?? 0} destinations
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Popular destinations
              </h2>
            </div>
          </div>

          {destinations && destinations.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="font-medium text-slate-800">
                No destinations found.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}