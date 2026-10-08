import { menu, type MenuItem } from "@/data/menu";
import { restaurant } from "@/data/restaurant";

export type FlatItem = MenuItem & { categoryId: string; categoryLabel: string };

export const allItems: FlatItem[] = menu.flatMap((c) =>
  c.items.map((i) => ({ ...i, categoryId: c.id, categoryLabel: c.label }))
);

const byId = new Map(allItems.map((i) => [i.id, i]));
export const getItem = (id: string) => byId.get(id);

export const inr = (n: number) => `${restaurant.currency}${n}`;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** Fuzzy name search: token overlap score, with veg/non-veg filter. */
export function searchItems(query: string, opts: { veg?: boolean; limit?: number } = {}) {
  const tokens = norm(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  const scored = allItems
    .filter((i) => opts.veg === undefined || i.veg === opts.veg)
    .map((i) => {
      const hay = norm(`${i.name} ${i.categoryLabel} ${i.description}`);
      const name = norm(i.name);
      let score = 0;
      for (const t of tokens) {
        if (name.includes(t)) score += 3;
        else if (hay.includes(t)) score += 1;
      }
      if (name === norm(query)) score += 10;
      return { item: i, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price);
  return scored.slice(0, opts.limit ?? 8).map((x) => x.item);
}

export const dot = (i: MenuItem) => (i.veg ? "🟢" : "🔴");
const chilli = (n: number) => (n ? " " + "🌶️".repeat(n) : "");

export function itemLine(i: MenuItem) {
  return `${dot(i)} ${i.name} — ${inr(i.price)}${chilli(i.spicy)}${i.bestseller ? " ⭐" : ""}`;
}

/** Whole category as a single WhatsApp-friendly text block. */
export function categoryText(categoryId: string) {
  const c = menu.find((x) => x.id === categoryId);
  if (!c) return null;
  const lines = c.items.map(itemLine).join("\n");
  return `${c.icon} *${c.label}*\n_${c.blurb}_\n\n${lines}\n\n🟢 Veg  🔴 Non-veg  ⭐ Bestseller`;
}

export const categoryList = menu.map((c) => ({
  id: c.id,
  label: c.label,
  icon: c.icon,
  count: c.items.length,
}));

/** Compact catalogue given to the model so it can resolve names → ids. */
export function catalogueForPrompt() {
  return menu
    .map(
      (c) =>
        `## ${c.label}\n` +
        c.items
          .map((i) => `${i.id} | ${i.name} | ${inr(i.price)} | ${i.veg ? "veg" : "non-veg"}`)
          .join("\n")
    )
    .join("\n\n");
}
