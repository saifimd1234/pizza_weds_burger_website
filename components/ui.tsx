"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Flame, Leaf } from "lucide-react";

/* ───────────────────────── Reveal on scroll ───────────────────────── */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Stagger helpers for grids of cards */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ───────────────────────── Section heading ───────────────────────── */

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl text-left"
      }
    >
      <Reveal>
        <span className="eyebrow">{eyebrow}</span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
          {title} {highlight && <span className="text-gradient">{highlight}</span>}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base text-cream/70 sm:text-lg">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ───────────────────────── Badges ───────────────────────── */

export function SpiceLevel({ level }: { level: number }) {
  if (level <= 0) return null;
  return (
    <span
      className="inline-flex items-center gap-0.5"
      title={`Spice level ${level}/3`}
      aria-label={`Spice level ${level} of 3`}
    >
      {Array.from({ length: level }).map((_, i) => (
        <Flame key={i} className="h-3.5 w-3.5 text-chili" fill="currentColor" />
      ))}
    </span>
  );
}

export function VegBadge({ veg }: { veg: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
        veg ? "border-basil" : "border-ember"
      }`}
      title={veg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span
        className={`h-2 w-2 rounded-full ${veg ? "bg-basil" : "bg-ember"}`}
      />
    </span>
  );
}

export function VegLeaf() {
  return <Leaf className="h-3.5 w-3.5 text-basil" />;
}

/* ───────────────────────── Marquee strip ───────────────────────── */

export function Marquee({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const loop = [...items, ...items];
  return (
    <div className="flex overflow-hidden">
      <div
        className={`flex shrink-0 items-center gap-8 whitespace-nowrap pr-8 ${
          reverse ? "animate-marquee [animation-direction:reverse]" : "animate-marquee"
        }`}
      >
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="font-display text-2xl uppercase tracking-wide text-cream/90 sm:text-3xl">
              {item}
            </span>
            <Flame className="h-5 w-5 text-flame" fill="currentColor" />
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className={`flex shrink-0 items-center gap-8 whitespace-nowrap pr-8 ${
          reverse ? "animate-marquee [animation-direction:reverse]" : "animate-marquee"
        }`}
      >
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="font-display text-2xl uppercase tracking-wide text-cream/90 sm:text-3xl">
              {item}
            </span>
            <Flame className="h-5 w-5 text-flame" fill="currentColor" />
          </span>
        ))}
      </div>
    </div>
  );
}
