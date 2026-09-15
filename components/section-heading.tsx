import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h2>

        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
        >
          View all
          <ArrowRight
            size={17}
            className="transition group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}