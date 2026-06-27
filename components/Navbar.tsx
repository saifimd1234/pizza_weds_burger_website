"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { scrollToSection } from "@/lib/scroll";
import { useCart } from "@/lib/cart";

const links = [
  { id: "about", label: "About" },
  { id: "menu", label: "Menu" },
  { id: "specials", label: "Specials" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Reviews" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, open: openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-charcoal/85 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="container-pwb flex h-16 items-center justify-between sm:h-20">
        {/* Logo */}
        <button
          onClick={() => go("home")}
          className="flex items-center gap-2 text-left"
        >
          <span className="text-2xl">🍕</span>
          <span className="font-display text-lg uppercase leading-none tracking-tight sm:text-xl">
            Pizza <span className="font-script text-cheese normal-case">weds</span>{" "}
            <span className="text-gradient">Burger</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="group relative text-sm font-medium text-cream/80 transition-colors hover:text-cream"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-flame transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={openCart}
            aria-label="Open order"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-cream transition-colors hover:border-flame hover:text-flame"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-chili px-1 text-[11px] font-bold text-cream">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => go("reserve")}
            className="btn-primary hidden h-10 px-5 py-0 text-xs sm:inline-flex"
          >
            Book a table
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-cream lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 bg-charcoal/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container-pwb flex flex-col gap-1 py-4">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="rounded-xl px-3 py-3 text-left text-base font-medium text-cream/85 hover:bg-white/5"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => go("reserve")}
                className="btn-primary mt-2 w-full"
              >
                Book a table
              </button>
              <a
                href={`tel:+${restaurant.phone}`}
                className="btn-ghost mt-1 w-full"
              >
                Call {restaurant.phoneDisplay}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
