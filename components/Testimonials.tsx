"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { Reveal, SectionHeading } from "./ui";

export default function Testimonials() {
  return (
    <section id="reviews" className="relative bg-charcoal py-24 sm:py-32">
      <div className="container-pwb">
        <SectionHeading
          eyebrow="Word on the street"
          title="Loved by"
          highlight="the hungry"
          subtitle="We let the food do the talking — but our regulars have a lot to say too."
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
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
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
