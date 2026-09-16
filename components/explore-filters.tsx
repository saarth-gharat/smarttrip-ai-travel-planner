"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ExploreFilters({
  countries,
}: {
  countries: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(Boolean(searchParams.get("country")));

  const currentCountry = searchParams.get("country") ?? "";

  function updateCountry(country: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (country) {
      params.set("country", country);
    } else {
      params.delete("country");
    }

    const query = params.toString();
    router.push(query ? `/explore?${query}` : "/explore");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        aria-expanded={open}
      >
        <SlidersHorizontal size={18} />
        Filters
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <label
            htmlFor="country-filter"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Country
          </label>

          <select
            id="country-filter"
            value={currentCountry}
            onChange={(event) => updateCountry(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-950 focus:bg-white"
          >
            <option value="">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
