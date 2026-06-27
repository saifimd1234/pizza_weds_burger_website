/**
 * ──────────────────────────────────────────────────────────────
 *  GLOBAL RESTAURANT CONFIG  (edit everything here)
 * ──────────────────────────────────────────────────────────────
 *  This is the single source of truth for brand, contact, hours,
 *  WhatsApp & social links. Change a value here and it updates
 *  across the whole website.
 */

export const restaurant = {
  name: "Pizza Weds Burger",
  shortName: "PWB",
  // The fun "wedding of pizza & burger" concept line:
  tagline: "Where Pizza Weds Burger",
  subtagline:
    "Wood-fired pizzas meet smashed-patty burgers. Two legends, one fiery love story — served hot, fast & seriously spicy.",
  established: "2019",
  currency: "₹",

  // --- Contact -------------------------------------------------
  phoneDisplay: "+91 98765 43210",
  // Used for tel: links — digits only, with country code.
  phone: "919876543210",
  // Used for WhatsApp (wa.me) — country code + number, NO plus / spaces.
  whatsapp: "919876543210",
  email: "hello@pizzawedsburger.com",

  // --- Location ------------------------------------------------
  address: {
    line1: "Shop 12, Flavour Street",
    line2: "Connaught Place",
    city: "New Delhi",
    pincode: "110001",
  },
  // Google Maps embed src (replace with your own place).
  mapEmbed:
    "https://www.google.com/maps?q=Connaught+Place+New+Delhi&output=embed",
  mapLink: "https://maps.google.com/?q=Connaught+Place+New+Delhi",

  // --- Hours ---------------------------------------------------
  hours: [
    { day: "Mon – Thu", time: "11:00 AM – 11:00 PM" },
    { day: "Fri – Sat", time: "11:00 AM – 1:00 AM" },
    { day: "Sunday", time: "12:00 PM – 11:00 PM" },
  ],

  // --- Social --------------------------------------------------
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },

  // --- Highlight stats (shown in the About section) -----------
  stats: [
    { value: "60K+", label: "Orders served" },
    { value: "4.8★", label: "Avg. rating" },
    { value: "25 min", label: "Avg. delivery" },
    { value: "100%", label: "Fresh dough daily" },
  ],
} as const;

export type Restaurant = typeof restaurant;

/** Helper: build a pre-filled WhatsApp link. */
export function whatsappLink(message: string) {
  return `https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(
    message
  )}`;
}

export function fullAddress() {
  const a = restaurant.address;
  return `${a.line1}, ${a.line2}, ${a.city} ${a.pincode}`;
}
