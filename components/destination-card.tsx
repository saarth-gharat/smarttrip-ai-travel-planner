"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

type Destination = {
  id: string;
  name: string;
  country: string;
  description: string | null;
  image_url: string | null;
};

export default function DestinationCard({
  destination,
}: {
  destination: Destination;
}) {
  return (
    <Link
      href={`/explore/${destination.id}`}
      className="group block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={destination.image_url ?? ""}
          alt={destination.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Explore badge */}
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 backdrop-blur">
          Explore
        </div>

        {/* Country */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-sm text-white">
          <MapPin size={15} />
          <span>{destination.country}</span>
        </div>

        {/* Arrow */}
        <div className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 opacity-0 transition duration-300 group-hover:opacity-100">
          <ArrowUpRight size={17} />
        </div>
      </div>

      {/* Card content */}
      <div className="p-5">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
          {destination.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {destination.description}
        </p>
      </div>
    </Link>
  );
}