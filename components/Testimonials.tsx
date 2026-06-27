"use client";

import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { Reveal, SectionHeading } from "./ui";

/** First letters of the reviewer's name, for the avatar badge. */
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function Testimonials() {
  return (
    <section id="reviews" className="relative bg-charcoal py-24 sm:py-32">
      <div className="container-pwb">
        <SectionHeading
          eyebrow="Word on the street"
          title="Loved by"
          highlight="the hungry"
          subtitle="Real reviews from our guests on Google — Sakchi's favourite for pizza, burgers, sandwiches & more."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="card h-full p-6">
                <Quote className="h-8 w-8 text-flame/40" />
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 text-cheese"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-cream/80">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-flame to-chili text-sm font-bold text-cream"
                  >
                    {initials(t.name)}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-cream">
                      {t.name}
                    </div>
                    <div className="text-xs text-cream/55">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
