"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import PizzaSVG from "./PizzaSVG";
import { restaurant, whatsappLink } from "@/data/restaurant";
import { scrollToSection } from "@/lib/scroll";

type Spice = {
  emoji: string;
  /** assembled position (% within the square scene) */
  top: string;
  left: string;
  /** unit radial direction for fly-out / assemble */
  dir: [number, number];
  delay: number;
  size: string;
};

const spices: Spice[] = [
  { emoji: "🌶️", top: "2%", left: "44%", dir: [0, -1], delay: 0.1, size: "text-4xl" },
  { emoji: "🧀", top: "16%", left: "84%", dir: [1, -0.6], delay: 0.18, size: "text-5xl" },
  { emoji: "🍅", top: "52%", left: "94%", dir: [1, 0], delay: 0.26, size: "text-4xl" },
  { emoji: "🌿", top: "86%", left: "80%", dir: [0.7, 1], delay: 0.34, size: "text-3xl" },
  { emoji: "🫑", top: "90%", left: "30%", dir: [-0.6, 1], delay: 0.42, size: "text-4xl" },
  { emoji: "🧄", top: "54%", left: "-4%", dir: [-1, 0], delay: 0.5, size: "text-3xl" },
  { emoji: "🌶️", top: "14%", left: "6%", dir: [-1, -0.6], delay: 0.58, size: "text-4xl" },
];

function FlyingSpice({
  spice,
  progress,
  reduce,
}: {
  spice: Spice;
  progress: MotionValue<number>;
  reduce: boolean | null;
}) {
  const distance = 260;
  const x = useTransform(progress, [0, 1], [0, spice.dir[0] * distance]);
  const y = useTransform(progress, [0, 1], [0, spice.dir[1] * distance]);
  const opacity = useTransform(progress, [0, 0.75], [1, 0]);
  const rotate = useTransform(progress, [0, 1], [0, spice.dir[0] * 90]);

  return (
    <motion.div
      className="absolute z-20 drop-shadow-[0_8px_18px_rgba(0,0,0,0.5)]"
      style={reduce ? {} : { x, y, opacity, rotate }}
      initial={{ top: spice.top, left: spice.left }}
    >
      <motion.div
        className={spice.size}
        initial={
          reduce
            ? false
            : {
                opacity: 0,
                scale: 0.3,
                x: spice.dir[0] * 130,
                y: spice.dir[1] * 130,
              }
        }
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{
          delay: 0.6 + spice.delay,
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span className="block animate-floaty" style={{ animationDelay: `${spice.delay}s` }}>
          {spice.emoji}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pizzaRotate = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const pizzaScale = useTransform(scrollYProgress, [0, 1], [1, 0.7]);
  const pizzaY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.9, 0.2]);

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-charcoal pt-28 sm:pt-24"
    >
      {/* background glow */}
      <motion.div
        aria-hidden
        style={reduce ? {} : { opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0 bg-heat-grid"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-chili/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-flame/20 blur-[120px]"
      />

      <div className="container-pwb relative z-10 grid items-center gap-12 lg:grid-cols-2">
        {/* Left: copy */}
        <motion.div style={reduce ? {} : { y: textY }}>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-flame" />
              Est. {restaurant.established} · {restaurant.address.city}
            </span>
          </motion.div>

          <h1 className="mt-6 font-display uppercase leading-[0.85] tracking-tight heat-text-shadow">
            <motion.span
              className="block text-6xl sm:text-7xl xl:text-8xl"
              initial={reduce ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
            >
              Pizza
            </motion.span>
            <motion.span
              className="block py-1 font-script text-5xl normal-case text-cheese sm:text-6xl xl:text-7xl"
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              weds
            </motion.span>
            <motion.span
              className="block bg-gradient-to-r from-flame to-chili bg-clip-text text-6xl text-transparent sm:text-7xl xl:text-8xl"
              initial={reduce ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
            >
              Burger
            </motion.span>
          </h1>

          <motion.p
            className="mt-6 max-w-md text-base text-cream/75 sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {restaurant.subtagline}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <button onClick={() => scrollToSection("menu")} className="btn-primary">
              Explore the menu <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollToSection("reserve")}
              className="btn-ghost"
            >
              Book a table
            </button>
          </motion.div>

          <motion.div
            className="mt-9 flex items-center gap-4 text-sm text-cream/70"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 text-cheese" fill="currentColor" />
              ))}
            </div>
            <span>
              <strong className="text-cream">4.8/5</strong> — loved by Sakchi foodies
            </span>
          </motion.div>
        </motion.div>

        {/* Right: animated pizza scene */}
        <motion.div
          className="relative mx-auto aspect-square w-full max-w-[460px]"
          style={reduce ? {} : { y: pizzaY }}
        >
          {/* rotating pizza */}
          <motion.div
            className="absolute inset-[12%] z-10"
            style={reduce ? {} : { rotate: pizzaRotate, scale: pizzaScale }}
          >
            <div className={reduce ? "" : "animate-spin-slow"}>
              <PizzaSVG className="h-full w-full drop-shadow-[0_30px_60px_rgba(226,57,29,0.45)]" />
            </div>
          </motion.div>

          {/* glowing plate behind */}
          <div
            aria-hidden
            className="absolute inset-[6%] z-0 rounded-full bg-gradient-to-br from-flame/30 to-chili/10 blur-2xl"
          />

          {/* flying spices */}
          {spices.map((spice, i) => (
            <FlyingSpice
              key={i}
              spice={spice}
              progress={scrollYProgress}
              reduce={reduce}
            />
          ))}
        </motion.div>
      </div>

      {/* scroll hint */}
      <motion.button
        onClick={() => scrollToSection("about")}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-cream/50 hover:text-flame"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="flex flex-col items-center gap-2">
          Scroll
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-flame to-transparent" />
        </span>
      </motion.button>
    </section>
  );
}
