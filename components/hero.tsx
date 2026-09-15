import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[720px] overflow-hidden">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=85"
        alt="Beautiful mountain travel destination"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Image overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-slate-950/80" />

      <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-5 pb-16 pt-32 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            <Sparkles size={15} />
            <span>Smart travel planning made simple</span>
          </div>

          <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-8xl">
            Your next
            <br />
            <span className="text-white/75">adventure</span> starts here.
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            Discover amazing destinations, build personalized itineraries,
            manage your budget, and make every trip unforgettable.
          </p>

          {/* Search / planner card */}
          <div className="mt-10 max-w-4xl rounded-3xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_auto]">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                <MapPin className="shrink-0 text-slate-500" size={20} />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Destination
                  </p>

                  <p className="text-sm font-medium text-slate-800">
                    Where do you want to go?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                <CalendarDays
                  className="shrink-0 text-slate-500"
                  size={20}
                />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Dates
                  </p>

                  <p className="text-sm font-medium text-slate-800">
                    Add dates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                <Sparkles className="shrink-0 text-slate-500" size={20} />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Trip style
                  </p>

                  <p className="text-sm font-medium text-slate-800">
                    Choose interests
                  </p>
                </div>
              </div>

              <button className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 font-semibold text-white transition hover:bg-slate-800">
                <Search size={19} />
                <span className="md:hidden lg:inline">
                  Explore
                </span>
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-white/70">
            <span>Popular:</span>

            <button className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm transition hover:bg-white/20">
              Goa
            </button>

            <button className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm transition hover:bg-white/20">
              Bali
            </button>

            <button className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm transition hover:bg-white/20">
              Dubai
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}