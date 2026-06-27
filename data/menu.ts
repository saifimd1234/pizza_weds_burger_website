/**
 * ──────────────────────────────────────────────────────────────
 *  MENU DATA  (fully modular — add / edit / remove freely)
 * ──────────────────────────────────────────────────────────────
 *  Each category has an id, label, emoji icon and an array of
 *  items. Flags: `veg`, `spicy` (0-3 chilies), `bestseller`.
 *  Swap the `image` URLs for your own photos any time.
 */

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  veg: boolean;
  spicy: 0 | 1 | 2 | 3;
  bestseller?: boolean;
};

export type MenuCategory = {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  items: MenuItem[];
};

export const menu: MenuCategory[] = [
  {
    id: "pizzas",
    label: "Pizzas",
    icon: "🍕",
    blurb: "Hand-stretched, wood-fired, blistered to perfection.",
    items: [
      {
        id: "pz-margherita",
        name: "Classic Margherita",
        description:
          "San Marzano tomato, fior di latte, fresh basil, cold-pressed olive oil.",
        price: 349,
        image:
          "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 0,
        bestseller: true,
      },
      {
        id: "pz-pepperoni",
        name: "Inferno Pepperoni",
        description:
          "Double pepperoni, molten mozzarella, chili honey drizzle, cracked pepper.",
        price: 499,
        image:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80",
        veg: false,
        spicy: 2,
        bestseller: true,
      },
      {
        id: "pz-paneer",
        name: "Tandoori Paneer Tikka",
        description:
          "Smoky paneer, onion, capsicum, mint mayo, a whisper of garam masala.",
        price: 429,
        image:
          "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 2,
      },
      {
        id: "pz-bbq-chicken",
        name: "Smoky BBQ Chicken",
        description:
          "Slow-cooked chicken, red onion, smoked BBQ sauce, coriander.",
        price: 519,
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
        veg: false,
        spicy: 1,
      },
      {
        id: "pz-veggie-supreme",
        name: "Garden Supreme",
        description:
          "Bell peppers, mushroom, olives, corn, jalapeño, sun-dried tomato.",
        price: 459,
        image:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 1,
      },
      {
        id: "pz-truffle",
        name: "Truffle Mushroom",
        description:
          "Wild mushrooms, truffle oil, mozzarella, parmesan snow, thyme.",
        price: 599,
        image:
          "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 0,
      },
    ],
  },
  {
    id: "burgers",
    label: "Burgers",
    icon: "🍔",
    blurb: "Smashed patties, toasted brioche, sauces that bite back.",
    items: [
      {
        id: "bg-classic-smash",
        name: "OG Smash Burger",
        description:
          "Double smashed beef, American cheese, pickles, house burger sauce.",
        price: 329,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
        veg: false,
        spicy: 1,
        bestseller: true,
      },
      {
        id: "bg-peri-chicken",
        name: "Peri-Peri Chicken Burger",
        description:
          "Crispy chicken, peri-peri glaze, slaw, jalapeño, garlic aioli.",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80",
        veg: false,
        spicy: 3,
        bestseller: true,
      },
      {
        id: "bg-paneer-makhani",
        name: "Makhani Paneer Burger",
        description:
          "Crispy paneer, makhani sauce, onion rings, mint-yogurt drizzle.",
        price: 279,
        image:
          "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 2,
      },
      {
        id: "bg-mushroom-swiss",
        name: "Mushroom Swiss Melt",
        description:
          "Veg patty, sautéed mushroom, Swiss cheese, caramelised onion.",
        price: 289,
        image:
          "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 0,
      },
    ],
  },
  {
    id: "sides",
    label: "Sides & Bites",
    icon: "🍟",
    blurb: "The supporting cast that steals the show.",
    items: [
      {
        id: "sd-loaded-fries",
        name: "Loaded Cheese Fries",
        description:
          "Crispy fries, molten cheddar, jalapeño, smoky paprika dust.",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 1,
        bestseller: true,
      },
      {
        id: "sd-wings",
        name: "Fire Chicken Wings",
        description: "6 pcs, buffalo-chili glaze, blue cheese dip.",
        price: 249,
        image:
          "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=900&q=80",
        veg: false,
        spicy: 3,
      },
      {
        id: "sd-garlic-bread",
        name: "Cheesy Garlic Bread",
        description: "Wood-fired, herbed garlic butter, mozzarella pull.",
        price: 179,
        image:
          "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 0,
      },
      {
        id: "sd-nuggets",
        name: "Crispy Nuggets",
        description: "8 pcs golden nuggets, choice of dip.",
        price: 189,
        image:
          "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=80",
        veg: false,
        spicy: 0,
      },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    icon: "🥤",
    blurb: "Cool down the fire — or fan the flames.",
    items: [
      {
        id: "dr-cola",
        name: "Classic Cola",
        description: "Ice-cold, fizzy, the eternal sidekick.",
        price: 79,
        image:
          "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-mint-lemonade",
        name: "Spicy Mint Lemonade",
        description: "Fresh lime, mint, a sneaky kick of green chili.",
        price: 99,
        image:
          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 1,
        bestseller: true,
      },
      {
        id: "dr-cold-coffee",
        name: "Thick Cold Coffee",
        description: "Double-shot, blended, topped with cocoa.",
        price: 129,
        image:
          "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-oreo-shake",
        name: "Oreo Thickshake",
        description: "Cookies & cream, whipped cream, choco crumble.",
        price: 149,
        image:
          "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 0,
      },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    icon: "🍫",
    blurb: "A sweet ending to a fiery affair.",
    items: [
      {
        id: "ds-lava-cake",
        name: "Molten Lava Cake",
        description: "Warm chocolate centre, vanilla scoop, gold dust.",
        price: 169,
        image:
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 0,
        bestseller: true,
      },
      {
        id: "ds-brownie",
        name: "Fudge Brownie Sundae",
        description: "Dense brownie, ice cream, hot fudge, peanut crunch.",
        price: 179,
        image:
          "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 0,
      },
      {
        id: "ds-tiramisu",
        name: "Classic Tiramisu",
        description: "Espresso-soaked layers, mascarpone, cocoa.",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80",
        veg: true,
        spicy: 0,
      },
    ],
  },
];

/** A flat list of bestsellers for the "Chef's Specials" section. */
export const bestsellers: MenuItem[] = menu
  .flatMap((c) => c.items)
  .filter((i) => i.bestseller);
