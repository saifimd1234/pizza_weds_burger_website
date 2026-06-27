"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { gallery } from "@/data/gallery";
import { SectionHeading, staggerChild, staggerParent } from "./ui";

export default function Gallery() {
  return (
    <section id="gallery" className="relative bg-night py-24 sm:py-32">
      <div className="container-pwb">
        <SectionHeading
          eyebrow="The Feed"
          title="Straight from"
          highlight="the oven"
          subtitle="A little taste of what's waiting for you. Yes, it looks this good in person too."
        />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid auto-rows-[170px] grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
        >
          {gallery.map((img, i) => (
            <motion.div
              key={i}
              variants={staggerChild}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 ${
                img.span ?? ""
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
