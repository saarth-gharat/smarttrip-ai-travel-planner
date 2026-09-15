"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DestinationSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(initialSearch);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("q", search.trim());
    }

    const query = params.toString();

    router.push(query ? `/explore?${query}` : "/explore");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5"
    >
      <Search size={19} className="text-slate-400" />

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        type="search"
        placeholder="Search destinations..."
        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
      />

      <button
        type="submit"
        className="hidden rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white sm:block"
      >
        Search
      </button>
    </form>
  );
}