import { Suspense } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import DestinationCard from "@/components/destination-card";
import DestinationSearch from "@/components/destination-search";
import ExploreFilters from "@/components/explore-filters";

type ExplorePageProps = {
  searchParams: Promise<{
    q?: string;
    country?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q, country } = await searchParams;
  const supabase = await createClient();

  const { data: destinations, error } = await supabase
    .from("destinations")
    .select("id, name, country, description, image_url")
    .order("name");

  if (error) {
    console.error("Failed to load destinations:", error);
  }

  const allDestinations = destinations ?? [];
  const query = q?.trim().toLowerCase() ?? "";

  const filteredDestinations = allDestinations.filter((destination) => {
    const matchesQuery =
      !query ||
      destination.name.toLowerCase().includes(query) ||
      destination.country.toLowerCase().includes(query) ||
      (destination.description ?? "").toLowerCase().includes(query);

    const matchesCountry = !country || destination.country === country;

    return matchesQuery && matchesCountry;
  });

  const countries = Array.from(
    new Set(allDestinations.map((destination) => destination.country))
  ).sort();

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar variant="solid" />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-10 lg:px-8">
          <div className="mt-2 max-w-3xl">
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

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Suspense
              fallback={
                <div className="h-[58px] flex-1 rounded-2xl border border-slate-200 bg-slate-50" />
              }
            >
              <DestinationSearch />
            </Suspense>

            <Suspense fallback={null}>
              <ExploreFilters countries={countries} />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-500">
                {filteredDestinations.length} destinations
                {query ? ` matching “${q}”` : ""}
                {country ? ` in ${country}` : ""}
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Popular destinations
              </h2>
            </div>
          </div>

          {filteredDestinations.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDestinations.map((destination) => (
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

              <p className="mt-2 text-sm text-slate-500">
                Try another search or clear the filters.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
