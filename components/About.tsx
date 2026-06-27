"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal } from "./ui";
import { restaurant } from "@/data/restaurant";

export default function About() {
  return (
    <section id="about" className="relative bg-charcoal py-24 sm:py-32">
      <div className="container-pwb grid items-center gap-14 lg:grid-cols-2">
        {/* Images */}
        <div className="relative">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=1000&q=80"
                alt="Chef sliding a pizza into the wood-fired oven"
                width={1000}
                height={760}
                className="h-[460px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -6 }}
            whileInView={{ opacity: 1, y: 0, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="absolute -bottom-8 -right-2 w-44 overflow-hidden rounded-3xl border-4 border-charcoal shadow-soft sm:-right-8 sm:w-56"
          >
            <Image
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
              alt="Smash burger close-up"
              width={600}
              height={600}
              className="h-44 w-full object-cover sm:h-56"
            />
          </motion.div>

          <div className="absolute -left-4 top-6 hidden rotate-[-8deg] rounded-2xl bg-gold px-4 py-2 font-display text-sm uppercase text-charcoal shadow-gold sm:block">
            Wood-fired daily
          </div>
        </div>

        {/* Copy */}
        <div>
          <Reveal>
            <span className="eyebrow">Our story</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">
              Two icons fell in love{" "}
              <span className="text-gradient">over fire</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-cream/75 sm:text-lg">
              It started with a simple question: why choose between a blistered
              wood-fired pizza and a dripping smash burger? At{" "}
              <strong className="text-cream">{restaurant.name}</strong>, we
              refused to. We slow-ferment our dough for 48 hours, smash our
              patties on a screaming-hot griddle, and bring the heat with house
              sauces that flirt with danger.
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-4 text-cream/75 sm:text-lg">
              Every plate is built fresh, fast, and full of attitude. No
              shortcuts, no frozen anything — just two legends, married on a
              plate.
            </p>
          </Reveal>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {restaurant.stats.map((s, i) => (
              <Reveal key={s.label} delay={0.1 + i * 0.08}>
                <div className="glass rounded-2xl p-4 text-center">
                  <div className="font-display text-2xl text-gradient sm:text-3xl">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-cream/60">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
