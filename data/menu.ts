/**
 * ──────────────────────────────────────────────────────────────
 *  MENU DATA  (fully modular — add / edit / remove freely)
 * ──────────────────────────────────────────────────────────────
 *  Each category has an id, label, emoji icon and an array of
 *  items. Flags: `veg`, `spicy` (0-3 chilies), `bestseller`.
 *  Swap the `image` URLs for your own photos any time.
 *
 *  Tabs use a flat per-item `veg` flag (the badge marks veg /
 *  non-veg), so veg + non-veg sub-sections are merged into one
 *  category each. Prices are in ₹.
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

/** Helper to build an Unsplash image URL from a photo id. */
const u = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const menu: MenuCategory[] = [
  {
    id: "pizzas",
    label: "Pizzas",
    icon: "🍕",
    blurb: "Cheesy, loaded & baked fresh — veg and non-veg, your call.",
    items: [
      // ---- Veg pizzas ----
      {
        id: "pz-veg-paneer",
        name: "Veg Paneer Pizza",
        description:
          "Soft paneer cubes and vegetables on a cheesy base — a comforting veg classic.",
        price: 229,
        image: u("1571407970349-bc81e7e96d47"),
        veg: true,
        spicy: 1,
      },
      {
        id: "pz-veg-loaded",
        name: "Veg Loaded Pizza",
        description:
          "Garden-fresh vegetables layered generously over melted cheese — colourful and wholesome.",
        price: 229,
        image: u("1513104890138-7c749659a591"),
        veg: true,
        spicy: 1,
      },
      {
        id: "pz-paneer-tikka",
        name: "Paneer Tikka Pizza",
        description:
          "Smoky tikka paneer with onion and capsicum — rich North Indian flavours on a pizza.",
        price: 229,
        image: u("1571407970349-bc81e7e96d47"),
        veg: true,
        spicy: 2,
      },
      {
        id: "pz-peri-paneer",
        name: "Peri Peri Paneer Pizza",
        description:
          "Zesty peri-peri spices lift soft paneer and cheese into a lively, flavour-packed pizza.",
        price: 229,
        image: u("1590947132387-155cc02f3212"),
        veg: true,
        spicy: 2,
      },
      {
        id: "pz-veg-special",
        name: "Veg Special Pizza",
        description:
          "Bell peppers, sweet corn and olives create a bright, well-balanced vegetarian pizza.",
        price: 229,
        image: u("1590947132387-155cc02f3212"),
        veg: true,
        spicy: 1,
      },
      {
        id: "pz-veg-supreme",
        name: "Veg Supreme Pizza",
        description:
          "Loaded with assorted vegetables for rich layers of taste and texture in every bite.",
        price: 229,
        image: u("1513104890138-7c749659a591"),
        veg: true,
        spicy: 1,
      },
      {
        id: "pz-veg-russian",
        name: "Veg Russian Pizza",
        description:
          "Creamy Russian-style flavours coat the vegetables for a smooth, mildly tangy profile.",
        price: 229,
        image: u("1593560708920-61dd98c46a4e"),
        veg: true,
        spicy: 0,
      },
      {
        id: "pz-corn-delight",
        name: "Classic Corn Delight Pizza",
        description:
          "Sweet corn and baby corn with capsicum — light, crunchy and comforting.",
        price: 219,
        image: u("1595854341625-f33ee10dbf94"),
        veg: true,
        spicy: 0,
      },
      {
        id: "pz-veg-tangy",
        name: "Veg Tangy Pizza",
        description:
          "Tangy sauce and vegetables add a playful zing to this refreshing veg pizza.",
        price: 219,
        image: u("1548369937-47519962c11a"),
        veg: true,
        spicy: 1,
      },
      {
        id: "pz-veg-schezwan",
        name: "Veg Schezwan Pizza",
        description:
          "Spicy schezwan sauce energises vegetables and cheese for a bold Indo-Chinese pizza.",
        price: 219,
        image: u("1571066811602-716837d681de"),
        veg: true,
        spicy: 2,
      },
      {
        id: "pz-corn-cheese",
        name: "Corn N Cheese Pizza",
        description:
          "Creamy cheese and juicy corn — a smooth, comforting pizza with gentle sweetness.",
        price: 199,
        image: u("1595854341625-f33ee10dbf94"),
        veg: true,
        spicy: 0,
      },
      {
        id: "pz-margherita",
        name: "Margherita Pizza",
        description:
          "Pure cheese goodness on a perfectly baked base — the authentic pizza experience.",
        price: 179,
        image: u("1604068549290-dea0e4a305ca"),
        veg: true,
        spicy: 0,
      },
      // ---- Non-veg pizzas ----
      {
        id: "pz-chicken-schezwan",
        name: "Chicken Schezwan Pizza",
        description:
          "Fiery schezwan sauce coats juicy chicken, capsicum, onion and corn — a bold Indo-Chinese kick.",
        price: 249,
        image: u("1628840042765-356cda07504e"),
        veg: false,
        spicy: 3,
      },
      {
        id: "pz-chicken-corn",
        name: "Chicken Corn Pizza",
        description:
          "Buttery sweet corn and tender chicken on melted cheese — comforting and family-friendly.",
        price: 239,
        image: u("1565299624946-b28f40a0ae38"),
        veg: false,
        spicy: 1,
      },
      {
        id: "pz-tikka-chicken",
        name: "Classic Tikka Chicken Pizza",
        description:
          "Smoky tikka chicken with onion and capsicum — rich Indian flavours on a pizza.",
        price: 239,
        image: u("1565299624946-b28f40a0ae38"),
        veg: false,
        spicy: 2,
      },
      {
        id: "pz-bbq-chicken",
        name: "Barbeque Chicken Pizza",
        description:
          "Smoky barbeque chicken meets olives and jalapenos for a sweet-spicy, flame-grilled flavour.",
        price: 249,
        image: u("1565299624946-b28f40a0ae38"),
        veg: false,
        spicy: 1,
        bestseller: true,
      },
      {
        id: "pz-hot-spicy-chicken",
        name: "Hot N Spicy Chicken Pizza",
        description:
          "Explosive spice levels with fiery chicken and crisp capsicum toppings throughout.",
        price: 249,
        image: u("1601924582970-9238bcb495d9"),
        veg: false,
        spicy: 3,
      },
      {
        id: "pz-seekh-kabab",
        name: "Chicken Seekh Kabab Pizza",
        description:
          "Juicy seekh kabab chicken, onions, capsicum and jalapenos — a street-style pizza twist.",
        price: 249,
        image: u("1628840042765-356cda07504e"),
        veg: false,
        spicy: 2,
      },
      {
        id: "pz-russian-chicken",
        name: "Russian Chicken Pizza",
        description:
          "Creamy Russian dip with juicy chicken, olives, capsicum and paprika — smooth and mildly tangy.",
        price: 249,
        image: u("1601924582970-9238bcb495d9"),
        veg: false,
        spicy: 1,
        bestseller: true,
      },
      {
        id: "pz-peri-chicken",
        name: "Peri Peri Chicken Pizza",
        description:
          "Zesty peri-peri spice over tender chicken, capsicum and onion for a lively, fiery pizza.",
        price: 249,
        image: u("1565299624946-b28f40a0ae38"),
        veg: false,
        spicy: 2,
      },
      {
        id: "pz-chicken-overloaded",
        name: "Chicken Overloaded Pizza",
        description:
          "Generous layers of three chicken varieties with onion and capsicum — a protein-packed pizza.",
        price: 249,
        image: u("1628840042765-356cda07504e"),
        veg: false,
        spicy: 2,
      },
      {
        id: "pz-shawarma-chicken",
        name: "Shawarma Chicken Pizza",
        description:
          "Middle-Eastern shawarma spices infuse tender chicken, onion and capsicum for a unique twist.",
        price: 249,
        image: u("1601924582970-9238bcb495d9"),
        veg: false,
        spicy: 1,
      },
      {
        id: "pz-lovely-chicken",
        name: "Lovely Chicken Pizza",
        description:
          "Colourful bell peppers and mildly-spiced red chicken make a vibrant, eye-catching pizza.",
        price: 249,
        image: u("1565299624946-b28f40a0ae38"),
        veg: false,
        spicy: 1,
      },
      {
        id: "pz-supreme-chicken",
        name: "Supreme Chicken Pizza",
        description:
          "Garlic-infused chicken with paprika, onion and capsicum delivers bold, layered flavours.",
        price: 249,
        image: u("1628840042765-356cda07504e"),
        veg: false,
        spicy: 2,
      },
    ],
  },
  {
    id: "burgers",
    label: "Burgers",
    icon: "🍔",
    blurb: "Soft buns, juicy patties and sauces that bite back.",
    items: [
      // ---- Veg burgers ----
      {
        id: "bg-veg-cheese-burst",
        name: "Veg Cheese Burst Burger",
        description:
          "Oozing cheese and a soft veg patty — rich, indulgent and impossible to resist.",
        price: 169,
        image: u("1550547660-d9450f859349"),
        veg: true,
        spicy: 0,
        bestseller: true,
      },
      {
        id: "bg-peri-paneer",
        name: "Peri Peri Paneer Burger",
        description:
          "Spicy peri-peri paneer adds heat and boldness to a satisfying veg burger.",
        price: 139,
        image: u("1572802419224-296b0aeee0d9"),
        veg: true,
        spicy: 2,
      },
      {
        id: "bg-spicy-paneer",
        name: "Spicy Paneer Burger",
        description:
          "A fiery paneer filling delivers a punchy, flavour-packed veg burger experience.",
        price: 139,
        image: u("1550547660-d9450f859349"),
        veg: true,
        spicy: 2,
      },
      {
        id: "bg-veg-mexican",
        name: "Veg Mexican Burger",
        description:
          "Mexican-style spices bring warmth and zest to this hearty vegetable burger.",
        price: 129,
        image: u("1520072959219-c595dc870360"),
        veg: true,
        spicy: 1,
      },
      {
        id: "bg-veg-spicy",
        name: "Veg Spicy Burger",
        description:
          "Bold spices and a crisp veg patty make this burger exciting and filling.",
        price: 109,
        image: u("1572802419224-296b0aeee0d9"),
        veg: true,
        spicy: 2,
      },
      {
        id: "bg-veg-peri",
        name: "Veg Peri Peri Burger",
        description:
          "Zesty peri-peri seasoning lifts this veg burger with tangy heat and flavour.",
        price: 109,
        image: u("1520072959219-c595dc870360"),
        veg: true,
        spicy: 2,
      },
      {
        id: "bg-veg-classic",
        name: "Veg Burger",
        description:
          "A classic vegetable patty with balanced seasoning — simple and satisfying.",
        price: 89,
        image: u("1571091718767-18b5b1457add"),
        veg: true,
        spicy: 0,
      },
      // ---- Non-veg burgers ----
      {
        id: "bg-zinger",
        name: "Crispy Chicken Zinger Burger",
        description:
          "Crunchy fried chicken delivers juicy texture and bold flavour in every bite.",
        price: 199,
        image: u("1606755962773-d324e0a13086"),
        veg: false,
        spicy: 1,
        bestseller: true,
      },
      {
        id: "bg-tangy-chicken",
        name: "Tangy Chicken Burger",
        description:
          "A tangy sauce complements tender chicken for a lively, flavour-rich burger.",
        price: 179,
        image: u("1565299507177-b0ac66763828"),
        veg: false,
        spicy: 1,
      },
      {
        id: "bg-grilled-chicken",
        name: "Grilled Chicken Burger",
        description:
          "Juicy grilled chicken makes a wholesome burger with smoky, savoury notes.",
        price: 199,
        image: u("1568901346375-23c9450c58cd"),
        veg: false,
        spicy: 0,
      },
      {
        id: "bg-double-patty",
        name: "Double Patty Chicken Burger",
        description:
          "Two chicken patties stacked high for a filling, protein-packed indulgence.",
        price: 219,
        image: u("1553979459-d2229ba7433b"),
        veg: false,
        spicy: 1,
      },
      {
        id: "bg-cheese-burst-chicken",
        name: "Cheese Burst Chicken Burger",
        description:
          "Melted cheese flows through juicy chicken for an indulgent, satisfying burger.",
        price: 249,
        image: u("1586190848861-99aa4a171e90"),
        veg: false,
        spicy: 0,
      },
      {
        id: "bg-mexican-chicken",
        name: "Mexican Chicken Burger",
        description:
          "Mexican spices coat the chicken perfectly for a warm, zesty burger experience.",
        price: 179,
        image: u("1565299507177-b0ac66763828"),
        veg: false,
        spicy: 1,
      },
      {
        id: "bg-classic-chicken",
        name: "Classic Chicken Burger",
        description:
          "Timeless chicken flavours and soft buns make this burger endlessly enjoyable.",
        price: 139,
        image: u("1606755962773-d324e0a13086"),
        veg: false,
        spicy: 0,
      },
    ],
  },
  {
    id: "combos",
    label: "Combos",
    icon: "🍱",
    blurb: "Pizza, burger, pasta & a chilled Coke — meals built to share.",
    items: [
      {
        id: "cb-veg-pizza-burger",
        name: 'Veg Pizza [10"] + Veg Burger + Coke',
        description:
          "A complete combo: veg pizza, veg burger and a chilled 250 ml Coke — perfect for group meals.",
        price: 579,
        image: u("1574071318508-1cdbab80d002"),
        veg: true,
        spicy: 0,
      },
      {
        id: "cb-veg-pizza-pasta",
        name: 'Veg Pizza [8"] + Pasta + Coke',
        description:
          "A perfectly sized veg pizza with pasta and a 250 ml Coke — balanced and enjoyable.",
        price: 429,
        image: u("1548369937-47519962c11a"),
        veg: true,
        spicy: 0,
      },
      {
        id: "cb-nonveg-pizza-pasta",
        name: 'Non Veg Pizza [7"] + Pasta + Coke',
        description:
          "A compact non-veg pizza with pasta and a 250 ml Coke for a satisfying quick meal.",
        price: 379,
        image: u("1601924582970-9238bcb495d9"),
        veg: false,
        spicy: 1,
      },
      {
        id: "cb-nonveg-pizza-burger",
        name: 'Non Veg Pizza [7"] + Non Veg Burger + Coke',
        description:
          "Non-veg pizza paired with a non-veg burger and a chilled 250 ml Coke — a hearty feast.",
        price: 369,
        image: u("1628840042765-356cda07504e"),
        veg: false,
        spicy: 1,
      },
      {
        id: "cb-chicken-burger-fries",
        name: "Chicken Burger + French Fries + Coke",
        description:
          "A juicy chicken burger with fries and a 250 ml Coke — comfort and convenience in one.",
        price: 269,
        image: u("1610440042657-612c34d95e9f"),
        veg: false,
        spicy: 1,
      },
    ],
  },
  {
    id: "starters",
    label: "Chicken Starters",
    icon: "🍗",
    blurb: "Grilled, fried & flame-kissed — the crunchy way to begin.",
    items: [
      {
        id: "st-leg-grilled",
        name: "Chicken Leg Grilled",
        description:
          "Grilled chicken leg with smoky flavour and tender, juicy texture.",
        price: 199,
        image: u("1606728035253-49e8a23146de"),
        veg: false,
        spicy: 1,
      },
      {
        id: "st-bbq-strips",
        name: "Barbeque Chicken Strips [10 pcs]",
        description:
          "Ten smoky barbeque chicken strips with bold flavour and tender, juicy meat.",
        price: 199,
        image: u("1527477396000-e27163b481c2"),
        veg: false,
        spicy: 1,
      },
      {
        id: "st-peri-strips",
        name: "Peri Peri Chicken Strips [10 pcs]",
        description:
          "Zesty peri-peri chicken strips bring heat, crunch and irresistible spice.",
        price: 199,
        image: u("1626645738196-c2a7c87a8f58"),
        veg: false,
        spicy: 2,
      },
      {
        id: "st-strips",
        name: "Chicken Strips [10 pcs]",
        description:
          "Classic chicken strips, crisp outside with juicy, well-seasoned meat inside.",
        price: 179,
        image: u("1527477396000-e27163b481c2"),
        veg: false,
        spicy: 1,
      },
      {
        id: "st-leg-fry",
        name: "Chicken Leg Fry",
        description:
          "Crispy fried chicken leg — juicy meat with a crunchy, well-seasoned coating.",
        price: 199,
        image: u("1626645738196-c2a7c87a8f58"),
        veg: false,
        spicy: 1,
      },
      {
        id: "st-fry-wings",
        name: "Fry Wings",
        description:
          "Crispy fried chicken wings — crunchy outside, juicy and flavourful inside.",
        price: 139,
        image: u("1608039755401-742074f0548d"),
        veg: false,
        spicy: 1,
      },
      {
        id: "st-grilled-wings",
        name: "Grilled Wings",
        description:
          "Smoky grilled wings — tender chicken with charred flavour and balanced seasoning.",
        price: 139,
        image: u("1608039755401-742074f0548d"),
        veg: false,
        spicy: 1,
      },
      {
        id: "st-whole-chicken",
        name: "Whole Chicken Grilled",
        description:
          "A whole chicken grilled to perfection — smoky skin and succulent meat throughout.",
        price: 500,
        image: u("1606728035253-49e8a23146de"),
        veg: false,
        spicy: 1,
      },
      {
        id: "st-nuggets",
        name: "Chicken Nuggets [8 pcs]",
        description:
          "Crispy nuggets with juicy centres and golden crunch — perfect for sharing or snacking.",
        price: 199,
        image: u("1562967914-608f82629710"),
        veg: false,
        spicy: 0,
      },
      {
        id: "st-popcorn",
        name: "Chicken Popcorn",
        description:
          "Bite-sized crispy chicken popcorn — crunchy texture with juicy, seasoned flavour.",
        price: 199,
        image: u("1626645738196-c2a7c87a8f58"),
        veg: false,
        spicy: 1,
      },
    ],
  },
  {
    id: "pasta",
    label: "Pasta",
    icon: "🍝",
    blurb: "Red, white & creamy — comfort in a bowl.",
    items: [
      {
        id: "pa-red",
        name: "Red Sauce Pasta",
        description:
          "Classic red-sauce pasta with tangy tomato flavours, smooth texture and comforting warmth.",
        price: 149,
        image: u("1621996346565-e3dbc646d9a9"),
        veg: true,
        spicy: 1,
      },
      {
        id: "pa-white",
        name: "White Sauce Pasta",
        description:
          "Creamy white-sauce pasta with rich cheese flavour and a luxuriously smooth finish.",
        price: 179,
        image: u("1551183053-bf91a1d81141"),
        veg: true,
        spicy: 0,
      },
      {
        id: "pa-white-chicken",
        name: "White Sauce Chicken Pasta",
        description:
          "Tender chicken folded into creamy white-sauce pasta for a rich, filling meal.",
        price: 219,
        image: u("1611270629569-8b357cb88da9"),
        veg: false,
        spicy: 0,
      },
      {
        id: "pa-red-chicken",
        name: "Red Sauce Chicken Pasta",
        description:
          "Tangy red sauce and juicy chicken combine for a bold, satisfying pasta dish.",
        price: 199,
        image: u("1621996346565-e3dbc646d9a9"),
        veg: false,
        spicy: 1,
      },
    ],
  },
  {
    id: "sandwiches",
    label: "Sandwiches",
    icon: "🥪",
    blurb: "Toasted, grilled & stacked — veg and non-veg favourites.",
    items: [
      // ---- Veg sandwiches ----
      {
        id: "sw-veg",
        name: "Veg Sandwich",
        description:
          "Fresh vegetables between soft bread — a light, refreshing sandwich option.",
        price: 79,
        image: u("1539252554453-80ab65ce3586"),
        veg: true,
        spicy: 0,
      },
      {
        id: "sw-veg-cheese",
        name: "Veg Cheese Sandwich",
        description:
          "Melted cheese with vegetables for a smooth, satisfying veg sandwich.",
        price: 89,
        image: u("1539252554453-80ab65ce3586"),
        veg: true,
        spicy: 0,
      },
      {
        id: "sw-veg-cheese-grilled",
        name: "Veg Cheese Grilled Sandwich",
        description:
          "Toasted bread and gooey cheese make this grilled veg sandwich warm and comforting.",
        price: 139,
        image: u("1528735602780-2552fd46c7af"),
        veg: true,
        spicy: 0,
      },
      {
        id: "sw-peri-paneer-grilled",
        name: "Peri Peri Paneer Grilled Sandwich",
        description:
          "Spicy peri-peri paneer, grilled for smoky edges and bold, tangy flavour.",
        price: 149,
        image: u("1528735602780-2552fd46c7af"),
        veg: true,
        spicy: 2,
      },
      {
        id: "sw-paneer-tikka-grilled",
        name: "Paneer Tikka Grilled Sandwich",
        description:
          "Smoky paneer tikka tucked in toasted bread delivers rich, satisfying flavours.",
        price: 149,
        image: u("1528735602780-2552fd46c7af"),
        veg: true,
        spicy: 1,
      },
      // ---- Non-veg sandwiches ----
      {
        id: "sw-tikka-chicken-grilled",
        name: "Classic Tikka Chicken Grilled Sandwich",
        description:
          "Smoky tikka chicken in toasted bread makes a warm, flavour-packed grilled sandwich.",
        price: 149,
        image: u("1554433607-66b5efe9d304"),
        veg: false,
        spicy: 2,
      },
      {
        id: "sw-hot-chicken-grilled",
        name: "Hot Chicken Grilled Sandwich",
        description:
          "A spicy chicken filling adds heat and excitement to this crispy grilled sandwich.",
        price: 149,
        image: u("1554433607-66b5efe9d304"),
        veg: false,
        spicy: 3,
      },
      {
        id: "sw-peri-chicken-grilled",
        name: "Peri Peri Chicken Grilled Sandwich",
        description:
          "Zesty peri-peri spices coat chicken perfectly for a lively grilled sandwich.",
        price: 149,
        image: u("1554433607-66b5efe9d304"),
        veg: false,
        spicy: 2,
      },
      {
        id: "sw-shawarma-chicken-grilled",
        name: "Shawarma Chicken Grilled Sandwich",
        description:
          "Middle-Eastern shawarma spices bring aromatic depth to this grilled chicken sandwich.",
        price: 149,
        image: u("1528735602780-2552fd46c7af"),
        veg: false,
        spicy: 1,
      },
      {
        id: "sw-cheesy-chicken-grilled",
        name: "Cheesy Chicken Grilled Sandwich",
        description:
          "Melted cheese and juicy chicken make this grilled sandwich rich and indulgent.",
        price: 149,
        image: u("1554433607-66b5efe9d304"),
        veg: false,
        spicy: 0,
      },
      {
        id: "sw-bbq-chicken-grilled",
        name: "Barbeque Chicken Grilled Sandwich",
        description:
          "Smoky barbeque chicken adds sweet-spicy flavour to this toasted sandwich delight.",
        price: 149,
        image: u("1528735602780-2552fd46c7af"),
        veg: false,
        spicy: 1,
      },
    ],
  },
  {
    id: "sides",
    label: "Sides",
    icon: "🍟",
    blurb: "Crispy fries and garlicky sticks — the perfect sidekicks.",
    items: [
      {
        id: "sd-fries",
        name: "French Fries",
        description:
          "Crispy golden fries with light seasoning and irresistible crunch in every bite.",
        price: 79,
        image: u("1630384060421-cb20d0e0649d"),
        veg: true,
        spicy: 0,
      },
      {
        id: "sd-peri-fries",
        name: "Peri Peri French Fries",
        description:
          "Spicy peri-peri seasoning adds heat and excitement to classic crispy fries.",
        price: 99,
        image: u("1576107232684-1279f390859f"),
        veg: true,
        spicy: 2,
      },
      {
        id: "sd-cheesy-fries",
        name: "Cheesy French Fries",
        description:
          "Melted cheese coats hot fries for a rich, indulgent snack experience.",
        price: 109,
        image: u("1573080496219-bb080dd4f877"),
        veg: true,
        spicy: 0,
      },
      {
        id: "sd-garlic-sticks",
        name: "Butter Garlic Sticks",
        description:
          "Warm bread sticks brushed with butter and garlic deliver rich aroma and flavour.",
        price: 129,
        image: u("1573140247632-f8fd74997d5c"),
        veg: true,
        spicy: 0,
      },
      {
        id: "sd-cheese-garlic-sticks",
        name: "Cheese Garlic Stuffed Sticks",
        description:
          "Stuffed with melted cheese, these garlic sticks offer gooey, savoury satisfaction.",
        price: 149,
        image: u("1573140247632-f8fd74997d5c"),
        veg: true,
        spicy: 0,
      },
    ],
  },
  {
    id: "shawarma",
    label: "Shawarma & Rolls",
    icon: "🌯",
    blurb: "Wrapped tight with smoky spice — veg rolls to Arabian shawarma.",
    items: [
      {
        id: "sh-paneer-tikka-roll",
        name: "Paneer Tikka Roll",
        description:
          "Smoky paneer tikka wrapped in soft bread delivers rich flavour and satisfying texture.",
        price: 129,
        image: u("1561651823-34feb02250e4"),
        veg: true,
        spicy: 1,
      },
      {
        id: "sh-corn-cheese-roll",
        name: "Corn Cheese Roll",
        description:
          "Creamy cheese and sweet corn create a smooth, comforting vegetarian roll.",
        price: 109,
        image: u("1561651823-34feb02250e4"),
        veg: true,
        spicy: 0,
      },
      {
        id: "sh-veg-schezwan-roll",
        name: "Veg Schezwan Roll",
        description:
          "Spicy schezwan vegetables wrapped tight for a bold, flavour-packed roll.",
        price: 129,
        image: u("1561651823-34feb02250e4"),
        veg: true,
        spicy: 2,
      },
      {
        id: "sh-chicken-tikka-roll",
        name: "Chicken Tikka Roll",
        description:
          "Juicy chicken tikka wrapped with sauce delivers smoky spice in every bite.",
        price: 129,
        image: u("1529006557810-274b9b2fc783"),
        veg: false,
        spicy: 1,
      },
      {
        id: "sh-schezwan-chicken-roll",
        name: "Schezwan Chicken Roll",
        description:
          "Fiery schezwan chicken brings heat and intensity to this loaded roll.",
        price: 129,
        image: u("1529006557810-274b9b2fc783"),
        veg: false,
        spicy: 3,
      },
      {
        id: "sh-hot-spicy-chicken-roll",
        name: "Hot N Spicy Chicken Roll",
        description:
          "An extra-spicy chicken filling makes this roll bold, hot and deeply satisfying.",
        price: 129,
        image: u("1529006557810-274b9b2fc783"),
        veg: false,
        spicy: 3,
      },
      {
        id: "sh-pita-chicken",
        name: "Pita Bread Chicken Shawarma",
        description:
          "Soft pita bread holds juicy chicken and sauce for an authentic shawarma experience.",
        price: 149,
        image: u("1561651823-34feb02250e4"),
        veg: false,
        spicy: 1,
      },
      {
        id: "sh-cheese-chicken",
        name: "Cheese Chicken Shawarma",
        description:
          "Melted cheese and seasoned chicken combine for a rich, indulgent shawarma wrap.",
        price: 149,
        image: u("1529006557810-274b9b2fc783"),
        veg: false,
        spicy: 0,
      },
      {
        id: "sh-arabian-chicken",
        name: "Arabian Chicken Shawarma",
        description:
          "Traditional Arabian spices infuse tender chicken for a warm, aromatic shawarma roll.",
        price: 199,
        image: u("1529006557810-274b9b2fc783"),
        veg: false,
        spicy: 1,
      },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    icon: "🍫",
    blurb: "A warm, gooey ending to a fiery feast.",
    items: [
      {
        id: "ds-choco-lava",
        name: "Choco Lava Cake",
        description:
          "Warm eggless chocolate cake with a molten centre — rich, gooey dessert indulgence.",
        price: 109,
        image: u("1606313564200-e75d5e30476c"),
        veg: true,
        spicy: 0,
        bestseller: true,
      },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    icon: "🥤",
    blurb: "Fizzy mojitos and thick milkshakes — cool down the heat.",
    items: [
      // ---- Mojitos (non-alcoholic) ----
      {
        id: "dr-mojito-strawberry",
        name: "Strawberry Mojito",
        description:
          "Non-alcoholic. Sweet berry notes with citrusy fizz for a cool, refreshing drink.",
        price: 109,
        image: u("1536935338788-846bb9981813"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-mojito-mango",
        name: "Mango Mojito",
        description:
          "Non-alcoholic. Tropical mango flavours mixed with minty freshness — bright and refreshing.",
        price: 109,
        image: u("1600271886742-f049cd451bba"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-mojito-pineapple",
        name: "Pineapple Mojito",
        description:
          "Non-alcoholic. Juicy pineapple and soda — a crisp, tangy mojito with tropical character.",
        price: 109,
        image: u("1600271886742-f049cd451bba"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-mojito-blueberry",
        name: "Blueberry Mojito",
        description:
          "Non-alcoholic. Sweet blueberry notes and gentle fizz for a smooth, refreshing mojito.",
        price: 109,
        image: u("1536935338788-846bb9981813"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-mojito-blackcurrant",
        name: "Blackcurrant Mojito",
        description:
          "Non-alcoholic. Bold blackcurrant with citrus sparkle for a refreshing, fruity mojito.",
        price: 109,
        image: u("1536935338788-846bb9981813"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-mojito-butterscotch",
        name: "Butterscotch Mojito",
        description:
          "Non-alcoholic. A sweet butterscotch twist adds richness to this playful, refreshing drink.",
        price: 109,
        image: u("1551538827-9c037cb4f32a"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-mojito-orange",
        name: "Orange Mojito",
        description:
          "Non-alcoholic. Zesty orange flavours brighten this fizzy, refreshing cooler.",
        price: 109,
        image: u("1600271886742-f049cd451bba"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-mojito-kiwi",
        name: "Kiwi Mojito",
        description:
          "Non-alcoholic. Tangy kiwi and mint create a lively, thirst-quenching mojito.",
        price: 109,
        image: u("1551538827-9c037cb4f32a"),
        veg: true,
        spicy: 0,
      },
      // ---- Milkshakes ----
      {
        id: "dr-shake-oreo",
        name: "Oreo Milkshake",
        description:
          "Creamy milkshake blended with Oreo cookies — rich chocolatey crunch and smooth sweetness.",
        price: 139,
        image: u("1572490122747-3968b75cc699"),
        veg: true,
        spicy: 0,
        bestseller: true,
      },
      {
        id: "dr-shake-chocolate",
        name: "Chocolate Milkshake",
        description:
          "A classic chocolate milkshake with deep cocoa flavour and a thick, creamy texture.",
        price: 139,
        image: u("1541658016709-82535e94bc69"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-shake-kiwi",
        name: "Kiwi Milkshake",
        description:
          "Fresh kiwi blended into milk for a light, fruity and refreshing milkshake.",
        price: 139,
        image: u("1568901839119-631418a3910d"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-shake-blackcurrant",
        name: "Blackcurrant Milkshake",
        description:
          "Sweet blackcurrant flavour mixed smoothly with milk for a rich, fruity shake.",
        price: 139,
        image: u("1579954115545-a95591f28bfc"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-shake-butterscotch",
        name: "Butterscotch Milkshake",
        description:
          "A silky butterscotch milkshake with caramel-like sweetness and creamy comfort.",
        price: 139,
        image: u("1568901839119-631418a3910d"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-shake-blueberry",
        name: "Blueberry Milkshake",
        description:
          "Juicy blueberry notes add freshness and colour to this smooth, creamy milkshake.",
        price: 139,
        image: u("1579954115545-a95591f28bfc"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-shake-pineapple",
        name: "Pineapple Milkshake",
        description:
          "Tropical pineapple flavour blended with milk for a light, refreshing shake.",
        price: 139,
        image: u("1568901839119-631418a3910d"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-shake-strawberry",
        name: "Strawberry Milkshake",
        description:
          "Sweet strawberry goodness in a classic, creamy milkshake loved by all ages.",
        price: 139,
        image: u("1579954115545-a95591f28bfc"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-shake-mango",
        name: "Mango Milkshake",
        description:
          "Ripe mango blended with milk delivers rich tropical flavour and smooth texture.",
        price: 139,
        image: u("1568901839119-631418a3910d"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-shake-cold-coffee",
        name: "Cold Coffee Milkshake",
        description:
          "A chilled coffee milkshake with bold coffee notes and creamy sweetness — energising refreshment.",
        price: 139,
        image: u("1461023058943-07fcbe16d735"),
        veg: true,
        spicy: 0,
      },
      {
        id: "dr-shake-orange",
        name: "Orange Milkshake",
        description:
          "Bright orange flavour blended with milk for a smooth, citrusy and creamy shake.",
        price: 139,
        image: u("1568901839119-631418a3910d"),
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
