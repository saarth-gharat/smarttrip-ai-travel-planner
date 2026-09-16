import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar variant="solid" />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          About
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Travel planning without the chaos.
        </h1>

        <p className="mt-6 text-base leading-7 text-slate-600">
          Travelora helps you discover destinations, save the places you love,
          and turn those ideas into a trip you can actually take. Choose dates,
          budget, and interests, then let the planner build a practical
          itinerary.
        </p>

        <p className="mt-4 text-base leading-7 text-slate-600">
          The goal is simple: less tab-switching, more time for the trip
          itself.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/explore"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Explore destinations
          </Link>

          <Link
            href="/planner"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Start planning
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
