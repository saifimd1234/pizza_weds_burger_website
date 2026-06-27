"use client";

import { Instagram, Facebook, Youtube, ArrowUp } from "lucide-react";
import { restaurant, fullAddress } from "@/data/restaurant";
import { scrollToSection } from "@/lib/scroll";

const navLinks = [
  { id: "about", label: "About" },
  { id: "menu", label: "Menu" },
  { id: "specials", label: "Specials" },
  { id: "gallery", label: "Gallery" },
  { id: "reserve", label: "Book a table" },
  { id: "contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-night">
      <div className="container-pwb py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <button
              onClick={() => scrollToSection("home")}
              className="flex items-center gap-2"
            >
              <span className="text-2xl">🍕</span>
              <span className="font-display text-xl uppercase tracking-tight">
                Pizza{" "}
                <span className="font-script text-cheese normal-case">weds</span>{" "}
                <span className="text-gradient">Burger</span>
              </span>
            </button>
            <p className="mt-4 max-w-xs text-sm text-cream/60">
              {restaurant.subtagline}
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { href: restaurant.social.instagram, Icon: Instagram },
                { href: restaurant.social.facebook, Icon: Facebook },
                { href: restaurant.social.youtube, Icon: Youtube },
              ].map(({ href, Icon }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-cream/80 transition-colors hover:border-flame hover:text-flame"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wide text-cream/50">
              Explore
            </h4>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollToSection(l.id)}
                    className="text-sm text-cream/70 transition-colors hover:text-flame"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wide text-cream/50">
              Visit
            </h4>
            <address className="mt-4 space-y-2.5 not-italic text-sm text-cream/70">
              <p>{fullAddress()}</p>
              <p>
                <a
                  href={`tel:+${restaurant.phone}`}
                  className="hover:text-flame"
                >
                  {restaurant.phoneDisplay}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${restaurant.email}`}
                  className="hover:text-flame"
                >
                  {restaurant.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-cream/45">
            © {new Date().getFullYear()} {restaurant.name}. All rights reserved.
          </p>
          <button
            onClick={() => scrollToSection("home")}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-cream/60 hover:text-flame"
          >
            Back to top <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
