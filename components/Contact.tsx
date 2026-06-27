"use client";

import { MapPin, Phone, Mail, Clock, ShoppingBag, MessageCircle, Check } from "lucide-react";
import { restaurant, whatsappLink, fullAddress } from "@/data/restaurant";
import { useCart } from "@/lib/cart";
import { Reveal, SectionHeading } from "./ui";

export default function Contact() {
  const { open: openCart } = useCart();

  return (
    <section id="contact" className="relative bg-charcoal py-24 sm:py-32">
      <div className="container-pwb">
        <SectionHeading
          eyebrow="Find us / Order"
          title="Come get"
          highlight="your fix"
          subtitle="Dine in, take away, or get it delivered. We're easy to find and even easier to order from."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Map */}
          <Reveal>
            <div className="card h-full min-h-[340px] overflow-hidden">
              <iframe
                title="Restaurant location"
                src={restaurant.mapEmbed}
                className="h-full min-h-[340px] w-full grayscale-[0.3]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>

          {/* Details + actions */}
          <div className="grid gap-6">
            <Reveal delay={0.08}>
              <div className="card p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-flame/15 text-flame">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-cream/50">
                        Visit
                      </div>
                      <a
                        href={restaurant.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cream/85 hover:text-flame"
                      >
                        {fullAddress()}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-flame/15 text-flame">
                      <Clock className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-cream/50">
                        Hours
                      </div>
                      {restaurant.hours.map((h) => (
                        <div key={h.day} className="text-sm text-cream/85">
                          {h.day}: {h.time}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-flame/15 text-flame">
                      <Phone className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-cream/50">
                        Call
                      </div>
                      <a
                        href={`tel:+${restaurant.phone}`}
                        className="text-sm text-cream/85 hover:text-flame"
                      >
                        {restaurant.phoneDisplay}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-flame/15 text-flame">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-cream/50">
                        Email
                      </div>
                      <a
                        href={`mailto:${restaurant.email}`}
                        className="text-sm text-cream/85 hover:text-flame"
                      >
                        {restaurant.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Order CTA */}
            <Reveal delay={0.16}>
              <div className="card bg-gradient-to-br from-ember/20 to-night p-6">
                <h3 className="font-display text-2xl uppercase">
                  Hungry right now?
                </h3>
                <p className="mt-2 text-sm text-cream/70">
                  Build your takeaway order and send it straight to our kitchen
                  on WhatsApp — or message us for anything else.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={openCart} className="btn-primary">
                    <ShoppingBag className="h-4 w-4" /> Start an order
                  </button>
                  <a
                    href={whatsappLink(
                      `Hi ${restaurant.name}! I have a question.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                  >
                    <MessageCircle className="h-4 w-4" /> Chat with us
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Good to know — service options & amenities (from Google) */}
        <Reveal delay={0.2}>
          <div className="card mt-6 p-6 sm:p-8">
            <h3 className="font-display text-xl uppercase">Good to know</h3>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              {restaurant.goodToKnow.map((group) => (
                <div key={group.title}>
                  <div className="text-xs uppercase tracking-wide text-cream/50">
                    {group.title}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-cream/85"
                      >
                        <Check className="h-4 w-4 shrink-0 text-flame" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
