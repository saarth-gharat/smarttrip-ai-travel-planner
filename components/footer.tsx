import Link from "next/link";
import { Compass } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Compass size={20} />
              </div>

              <span className="text-lg font-bold">
                TRAVELORA
              </span>
            </Link>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              A smarter way to discover destinations, organize trips and
              create unforgettable adventures.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-8 text-sm">
            <div>
              <p className="font-semibold">Explore</p>

              <div className="mt-4 space-y-3 text-slate-400">
                <Link className="block hover:text-white" href="/explore">
                  Destinations
                </Link>

                <Link className="block hover:text-white" href="/planner">
                  Plan a trip
                </Link>
              </div>
            </div>

            <div>
              <p className="font-semibold">Travelora</p>

              <div className="mt-4 space-y-3 text-slate-400">
                <Link className="block hover:text-white" href="/about">
                  About
                </Link>

                <Link className="block hover:text-white" href="/contact">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          suppressHydrationWarning
          className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-500"
        >
          © {new Date().getFullYear()} Travelora. Built for better journeys.
        </div>
      </div>
    </footer>
  );
}