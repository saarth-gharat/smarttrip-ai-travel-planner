"use client";

import { CalendarDays, Sparkles, WalletCards } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: CalendarDays,
    title: "Choose your trip",
    description:
      "Pick a destination, travel dates, number of travelers, and your preferred travel style.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Personalize it",
    description:
      "Tell Travelora what you love — food, beaches, nature, culture, adventure, nightlife and more.",
  },
  {
    number: "03",
    icon: WalletCards,
    title: "Travel smarter",
    description:
      "Get a practical itinerary, estimated budget and organized trip plan in one place.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Simple by design
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Plan your trip in three steps
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-500">
            Everything you need to go from an idea to a trip you can actually
            enjoy.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon size={21} />
                  </div>

                  <span className="text-sm font-bold text-slate-300">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-semibold text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}