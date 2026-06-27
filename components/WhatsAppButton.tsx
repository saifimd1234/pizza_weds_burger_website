"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { restaurant, whatsappLink } from "@/data/restaurant";

/** Inline WhatsApp glyph (brand mark). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M16.04 4C9.94 4 5 8.94 5 15.04c0 2.03.55 3.96 1.6 5.68L5 28l7.46-1.96a11 11 0 0 0 3.58.6h.01c6.1 0 11.04-4.94 11.04-11.04C27.09 8.94 22.14 4 16.04 4Zm6.46 15.77c-.27.76-1.58 1.46-2.18 1.51-.6.05-1.13.27-3.8-.79-3.2-1.26-5.24-4.55-5.4-4.76-.16-.21-1.29-1.72-1.29-3.28 0-1.56.82-2.33 1.11-2.65.29-.32.63-.4.84-.4.21 0 .42 0 .6.01.2.01.46-.07.72.55.27.63.92 2.19 1 2.35.08.16.13.34.03.55-.1.21-.16.34-.31.53-.16.18-.33.41-.47.55-.16.16-.32.33-.14.64.18.31.81 1.34 1.74 2.17 1.2 1.07 2.21 1.4 2.52 1.56.31.16.49.13.67-.08.18-.21.77-.9.98-1.21.21-.31.42-.26.71-.16.29.11 1.85.87 2.17 1.03.31.16.52.23.6.36.08.13.08.74-.19 1.5Z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowTip(true), 2500);
    const h = setTimeout(() => setShowTip(false), 9000);
    return () => {
      clearTimeout(t);
      clearTimeout(h);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[55] flex items-center gap-3">
      <AnimatePresence>
        {showTip && (
          <motion.button
            onClick={() => setShowTip(false)}
            initial={{ opacity: 0, x: 12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.9 }}
            className="hidden rounded-2xl border border-white/10 bg-charcoal/95 px-4 py-2.5 text-sm text-cream shadow-soft backdrop-blur sm:block"
          >
            Hungry? <span className="text-[#25D366]">Order on WhatsApp</span> 🍕
          </motion.button>
        )}
      </AnimatePresence>

      <motion.a
        href={whatsappLink(
          `Hi ${restaurant.name}! 🍕🍔 I'd like to place an order.`
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.7)]"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </motion.a>
    </div>
  );
}
