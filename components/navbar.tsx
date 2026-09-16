"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar({
  variant = "overlay",
}: {
  variant?: "overlay" | "solid";
}) {
  const router = useRouter();
  const supabase = createClient();
  const isSolid = variant === "solid";

  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();

    setUser(null);
    setMobileOpen(false);

    router.push("/");
  }

  return (
    <header
      className={
        isSolid
          ? "sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur"
          : "absolute left-0 right-0 top-0 z-50"
      }
    >
      <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={`text-2xl font-bold tracking-tight ${
              isSolid ? "text-slate-950" : "text-white"
            }`}
          >
            Travelora
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                isSolid
                  ? "text-slate-600 hover:text-slate-950"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Home
            </Link>

            <Link
              href="/explore"
              className={`text-sm font-medium transition ${
                isSolid
                  ? "text-slate-600 hover:text-slate-950"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Explore
            </Link>

            {user ? (
              <>
                <Link
                  href="/my-trips"
                  className={`text-sm font-medium transition ${
                    isSolid
                      ? "text-slate-600 hover:text-slate-950"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  My Trips
                </Link>

                <Link
                  href="/planner"
                  className={`text-sm font-medium transition ${
                    isSolid
                      ? "text-slate-600 hover:text-slate-950"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Plan a trip
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    isSolid
                      ? "bg-slate-950 text-white hover:bg-slate-800"
                      : "bg-white text-slate-950 hover:bg-white/90"
                  }`}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`text-sm font-medium transition ${
                    isSolid
                      ? "text-slate-600 hover:text-slate-950"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Log in
                </Link>

                <Link
                  href="/auth/signup"
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    isSolid
                      ? "bg-slate-950 text-white hover:bg-slate-800"
                      : "bg-white text-slate-950 hover:bg-white/90"
                  }`}
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile button */}
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur md:hidden ${
              isSolid
                ? "bg-slate-100 text-slate-950"
                : "bg-white/10 text-white"
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile navigation */}
        {mobileOpen && (
          <div className="mt-4 rounded-3xl bg-white p-5 shadow-xl md:hidden">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Home
              </Link>

              <Link
                href="/explore"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Explore
              </Link>

              {user ? (
                <>
                  <Link
                    href="/my-trips"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Trips
                  </Link>

                  <Link
                    href="/planner"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Plan a trip
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Log in
                  </Link>

                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
