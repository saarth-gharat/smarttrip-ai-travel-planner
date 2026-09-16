"use client";

import { FormEvent, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar variant="solid" />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Contact
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          We&apos;d love to hear from you.
        </h1>

        <p className="mt-6 text-base leading-7 text-slate-600">
          Questions, feedback, or a destination you want added? Send a message
          and we&apos;ll get back to you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
        >
          {submitted ? (
            <div className="rounded-2xl bg-green-50 px-4 py-4 text-sm leading-6 text-green-800">
              Thanks, {name || "there"}. Your message has been noted. We&apos;ll
              reply to {email} soon.
            </div>
          ) : (
            <>
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Name
                </label>
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Send message
              </button>
            </>
          )}
        </form>
      </section>

      <Footer />
    </main>
  );
}
