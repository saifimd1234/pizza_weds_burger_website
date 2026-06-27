"use client";

import { useState } from "react";
import { CalendarCheck, Clock, Phone, Users } from "lucide-react";
import { restaurant, whatsappLink } from "@/data/restaurant";
import { Reveal } from "./ui";

const guestOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];

export default function Reservation() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    notes: "",
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hi ${restaurant.name}! 🍽️ I'd like to *book a table*:

Name: ${form.name || "—"}
Phone: ${form.phone || "—"}
Date: ${form.date || "—"}
Time: ${form.time || "—"}
Guests: ${form.guests}
${form.notes ? `Note: ${form.notes}` : ""}`;
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-charcoal/60 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none transition-colors focus:border-flame";

  return (
    <section id="reserve" className="relative overflow-hidden bg-night py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-flame/15 blur-[120px]"
      />
      <div className="container-pwb grid items-center gap-12 lg:grid-cols-2">
        {/* Info */}
        <div>
          <Reveal>
            <span className="eyebrow">Reservations</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">
              Save your seat at{" "}
              <span className="text-gradient">the fire</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-cream/75 sm:text-lg">
              Big group, date night, or a quick solo feast — book in seconds and
              we&apos;ll confirm right on WhatsApp. No app, no waiting.
            </p>
          </Reveal>

          <div className="mt-8 space-y-4">
            <Reveal delay={0.2}>
              <div className="flex items-center gap-3 text-cream/80">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-flame/15 text-flame">
                  <Clock className="h-5 w-5" />
                </span>
                <div className="text-sm">
                  {restaurant.hours.map((h) => (
                    <div key={h.day}>
                      <span className="font-semibold text-cream">{h.day}:</span>{" "}
                      {h.time}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.28}>
              <a
                href={`tel:+${restaurant.phone}`}
                className="flex items-center gap-3 text-cream/80 transition-colors hover:text-flame"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-flame/15 text-flame">
                  <Phone className="h-5 w-5" />
                </span>
                <span className="text-sm">
                  Prefer to call? {restaurant.phoneDisplay}
                </span>
              </a>
            </Reveal>
          </div>
        </div>

        {/* Form */}
        <Reveal delay={0.1}>
          <form
            onSubmit={handleSubmit}
            className="glass rounded-3xl p-6 shadow-soft sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream/60">
                  Full name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream/60">
                  Phone
                </label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="Your number"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cream/60">
                  <Users className="h-3.5 w-3.5" /> Guests
                </label>
                <select
                  value={form.guests}
                  onChange={(e) => update("guests", e.target.value)}
                  className={inputClass}
                >
                  {guestOptions.map((g) => (
                    <option key={g} value={g} className="bg-charcoal">
                      {g} {g === "1" ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream/60">
                  Date
                </label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream/60">
                  Time
                </label>
                <input
                  required
                  type="time"
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream/60">
                  Special requests <span className="text-cream/40">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Birthday, window seat, allergies…"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <button type="submit" className="btn-whatsapp mt-6 w-full">
              <CalendarCheck className="h-4 w-4" /> Confirm on WhatsApp
            </button>
            <p className="mt-3 text-center text-xs text-cream/45">
              Opens WhatsApp with your details pre-filled — just hit send.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
