"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { bestsellers } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { useCart } from "@/lib/cart";
import { Marquee, Reveal, SpiceLevel } from "./ui";

export default function Specials() {
  const { add } = useCart();

  return (
    <section id="specials" className="relative overflow-hidden bg-charcoal py-24 sm:py-32">
      {/* Marquee bands */}
      <div className="relative -rotate-2 border-y border-flame/20 bg-gradient-to-r from-ember/15 via-flame/10 to-gold/15 py-4">
        <Marquee
          items={["Fresh Dough", "Wood-Fired", "Smash Patties", "House Sauces", "Seriously Spicy", "Made To Order"]}
        />
      </div>

      <div className="container-pwb mt-20">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <Reveal>
              <span className="eyebrow">Chef&apos;s Specials</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">
                The crowd <span className="text-gradient">favourites</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <p className="max-w-sm text-cream/65">
              The legends our regulars keep coming back for. Add them to your
              order in one tap.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {bestsellers.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                className="card group relative h-80 overflow-hidden"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-center gap-2">
                    <SpiceLevel level={item.spicy} />
                  </div>
                  <h3 className="mt-2 font-display text-2xl uppercase leading-tight">
                    {item.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-cream/70">
                    {item.description}
                  </p>
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
                      <Plus className="h-4 w-4" /> Add to order
                    </button>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
