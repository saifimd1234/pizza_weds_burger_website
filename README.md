# 🍕 Pizza Weds Burger — Restaurant Website

A bold, animated, fully-responsive restaurant website for **Pizza Weds Burger**.
Built with Next.js, TypeScript, Tailwind CSS, Framer Motion and Lenis smooth scroll.

> Two legends, one fiery love story — wood-fired pizzas meet smashed-patty burgers.

---

## ✨ Features

- **Cinematic scroll animations** — a hero pizza that spins, with spices that
  assemble on load and fly outward as you scroll; parallax, staggered reveals,
  hover micro-interactions and a "fresh • hot • spicy" marquee.
- **Buttery smooth scrolling** via Lenis (auto-disabled for users who prefer
  reduced motion).
- **Full restaurant menu** with category tabs, veg/spicy/bestseller tags & prices.
- **Takeaway ordering** — add items to a cart, then send the order straight to
  the kitchen on **WhatsApp** (no backend required).
- **Table reservations** — a booking form that opens WhatsApp pre-filled.
- **Floating WhatsApp button**, gallery, customer reviews, map, hours & contact.
- **Mobile-first & performance optimized** — `next/image`, fonts via `next/font`,
  SEO metadata, Open Graph, JSON-LD structured data.
- **100% modular content** — everything lives in `/data`.

---

## 🛠️ Edit your content (no code needed)

Everything you'll want to change is in the **`/data`** folder:

| File | What it controls |
| --- | --- |
| `data/restaurant.ts` | Name, tagline, **phone**, **WhatsApp number**, email, **address**, **Google Maps embed**, opening hours, social links, stats. |
| `data/menu.ts` | Every menu item — category, name, description, **price**, photo, veg/spicy flags, bestseller. |
| `data/gallery.ts` | The photo gallery images. |
| `data/testimonials.ts` | Customer reviews. |

### Set your real WhatsApp number

In `data/restaurant.ts`, set `whatsapp` to your number **with country code, no
`+` or spaces** (e.g. `"919876543210"`). Bookings, the cart checkout and the
floating button all use it automatically.

### Swap in your own photos

Replace the `image` URLs in `data/menu.ts` / `data/gallery.ts`. To use images
from a new domain, add that domain to `images.remotePatterns` in
`next.config.mjs`.

### Brand colours

Edit the palette in `tailwind.config.ts` under `theme.extend.colors`
(`ember`, `chili`, `flame`, `gold`, `cheese`, `cream`, …).

---

## 🚀 Develop locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Build for production:

```bash
npm run build
npm run start
```

---

## ☁️ Deploy

This project is optimized for **Vercel**. Push to GitHub and import the repo at
[vercel.com/new](https://vercel.com/new), or run `vercel` from the CLI. No
environment variables are required.

---

## 🧱 Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Lenis](https://lenis.darkroom.engineering/) smooth scroll
- [lucide-react](https://lucide.dev/) icons
