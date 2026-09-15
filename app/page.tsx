import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import DestinationCard from "@/components/destination-card";
import SectionHeading from "@/components/section-heading";
import HowItWorks from "@/components/how-it-works";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: destinations, error } = await supabase
    .from("destinations")
    .select(
      "id, name, country, description, image_url"
    )
    .order("name");

  if (error) {
    console.error("Failed to load destinations:", error);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="relative">
        <Navbar />
        <Hero />
      </div>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Explore the world"
            title="Places worth discovering"
            description="Find your next escape from a collection of destinations curated for curious travelers."
            href="/explore"
          />

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
              <p className="font-medium text-slate-700">
                No destinations available yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Add destinations to Supabase to see them here.
              </p>
            </div>
          )}
        </div>
      </section>

      <HowItWorks />

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-16 sm:px-12 lg:px-20">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
                Your journey starts here
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Stop wondering where to go.
                <br />
                Start planning.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
                Build a personalized travel plan around your dates, budget and
                interests.
              </p>

              <button className="mt-8 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Start planning
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}