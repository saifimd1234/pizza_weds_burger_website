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
  phoneDisplay: "+91 72095 38634",
  // Used for tel: links — digits only, with country code.
  phone: "917209538634",
  // Used for WhatsApp (wa.me) — country code + number, NO plus / spaces.
  whatsapp: "917209538634",
  email: "hello@pizzawedsburger.com",

  // --- Location ------------------------------------------------
  address: {
    line1: "Near Sitla Mandir, Rajendra Nagar",
    line2: "Sakchi",
    city: "Jamshedpur",
    state: "Jharkhand",
    pincode: "832110",
  },
  // Google Maps embed src (points at the restaurant in Sakchi).
  mapEmbed:
    "https://www.google.com/maps?q=Pizza+Weds+Burger+Rajendra+Nagar+Sakchi+Jamshedpur&output=embed",
  mapLink:
    "https://maps.google.com/?q=Pizza+Weds+Burger+Rajendra+Nagar+Sakchi+Jamshedpur",

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
    { value: "4.8★", label: "Google rating" },
    { value: "₹200–400", label: "For two (approx.)" },
    { value: "Quick", label: "Bite & service" },
    { value: "100%", label: "Made to order" },
  ],

  // --- Good to know (service options & amenities, from Google) -
  goodToKnow: [
    {
      title: "Service options",
      items: [
        "Dine-in",
        "Takeaway",
        "Delivery",
        "No-contact delivery",
        "Kerbside pickup",
      ],
    },
    {
      title: "Dining",
      items: [
        "Great for solo dining",
        "Good for groups",
        "Good for kids",
        "Casual & cosy",
      ],
    },
    {
      title: "Good to know",
      items: ["Quick bite", "Free parking lot"],
    },
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
  return `${a.line1}, ${a.line2}, ${a.city}, ${a.state} ${a.pincode}`;
}
