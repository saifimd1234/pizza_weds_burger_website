/** Customer reviews — edit freely. */
export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Aisha Khan",
    role: "Food blogger",
    quote:
      "The Inferno Pepperoni is unreal — that chili honey drizzle had me ordering a second one before I finished the first.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Rohan Mehta",
    role: "Regular since day one",
    quote:
      "Pizza AND burgers under one roof, both done right. The OG Smash is the best in the city, no debate.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Sara D'Souza",
    role: "Spice chaser",
    quote:
      "Peri-Peri Chicken Burger at level 3 spice is a religious experience. Order the mint lemonade to survive it.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Vikram Singh",
    role: "Office lunch hero",
    quote:
      "Booked a table for 8 over WhatsApp in 30 seconds, food was out fast and piping hot. Faultless.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
];
