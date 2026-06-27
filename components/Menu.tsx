"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Star } from "lucide-react";
import { menu, type MenuItem } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { useCart } from "@/lib/cart";
import {
  Reveal,
  SectionHeading,
  SpiceLevel,
  VegBadge,
  staggerChild,
  staggerParent,
} from "./ui";

function MenuCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  return (
    <motion.article
      variants={staggerChild}
      className="card group flex flex-col"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/10 to-transparent" />
        {item.bestseller && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold uppercase text-charcoal">
            <Star className="h-3 w-3" fill="currentColor" /> Bestseller
          </span>
        )}
        <span className="absolute right-3 top-3">
          <VegBadge veg={item.veg} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg uppercase leading-tight tracking-tight">
            {item.name}
          </h3>
          <SpiceLevel level={item.spicy} />
        </div>
        <p className="mt-2 flex-1 text-sm text-cream/65">{item.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-xl text-cheese">
            {restaurant.currency}
            {item.price}
          </span>
          <button
            onClick={() =>
              add({ id: item.id, name: item.name, price: item.price })
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-flame to-chili px-4 py-2 text-xs font-bold uppercase text-cream transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function Menu() {
  const [active, setActive] = useState(menu[0].id);
  const category = menu.find((c) => c.id === active) ?? menu[0];

  const tabsRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = tabsRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = tabsRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scrollTabs = (dir: -1 | 1) =>
    tabsRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });

  return (
    <section id="menu" className="relative bg-night py-24 sm:py-32">
      <div className="container-pwb">
        <SectionHeading
          eyebrow="The Menu"
          title="Built fresh,"
          highlight="served fiery"
          subtitle="From 48-hour dough to smashed patties — every item is made to order. Tap a category and add your favourites to the order."
        />

        {/* Tabs */}
        <div className="relative mt-10">
          {/* edge fades */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-night to-transparent transition-opacity ${
              canLeft ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-night to-transparent transition-opacity ${
              canRight ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* left arrow */}
          <button
            type="button"
            onClick={() => scrollTabs(-1)}
            aria-label="Scroll categories left"
            className={`absolute left-0 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-night/90 text-cream shadow-soft backdrop-blur transition-all hover:border-flame hover:text-flame ${
              canLeft ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* right arrow */}
          <button
            type="button"
            onClick={() => scrollTabs(1)}
            aria-label="Scroll categories right"
            className={`absolute right-0 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-night/90 text-cream shadow-soft backdrop-blur transition-all hover:border-flame hover:text-flame ${
              canRight ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* scrollable strip — centers when it fits, scrolls when it overflows */}
          <div ref={tabsRef} className="no-scrollbar overflow-x-auto">
            <div className="mx-auto flex w-max gap-3 px-12 pb-2">
              {menu.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                    active === c.id
                      ? "border-flame bg-gradient-to-r from-flame to-chili text-cream shadow-ember"
                      : "border-white/15 bg-white/5 text-cream/75 hover:border-flame/50"
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Reveal>
          <p className="mt-6 text-center text-sm italic text-cream/55">
            {category.blurb}
          </p>
        </Reveal>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category.id}
            variants={staggerParent}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {category.items.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
