"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X, MessageCircle } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { useCart } from "@/lib/cart";

export default function CartDrawer() {
  const {
    lines,
    count,
    total,
    isOpen,
    close,
    increment,
    decrement,
    remove,
    clear,
    checkoutLink,
  } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-white/10 bg-charcoal shadow-soft"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <h3 className="flex items-center gap-2 font-display text-xl uppercase">
                <ShoppingBag className="h-5 w-5 text-flame" /> Your order
                {count > 0 && (
                  <span className="text-sm text-cream/50">({count})</span>
                )}
              </h3>
              <button
                onClick={close}
                aria-label="Close order"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-cream hover:border-flame hover:text-flame"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Lines */}
            <div className="flex-1 overflow-y-auto p-5">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="text-5xl">🍕</span>
                  <p className="mt-4 font-display text-lg uppercase text-cream/80">
                    Your order is empty
                  </p>
                  <p className="mt-1 text-sm text-cream/50">
                    Add something fiery from the menu.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-night/60 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-cream">
                          {l.name}
                        </div>
                        <div className="text-xs text-cream/55">
                          {restaurant.currency}
                          {l.price} each
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => decrement(l.id)}
                          aria-label="Decrease"
                          className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-cream hover:border-flame"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {l.qty}
                        </span>
                        <button
                          onClick={() => increment(l.id)}
                          aria-label="Increase"
                          className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-cream hover:border-flame"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="w-16 text-right font-display text-cheese">
                        {restaurant.currency}
                        {l.qty * l.price}
                      </div>
                      <button
                        onClick={() => remove(l.id)}
                        aria-label="Remove"
                        className="text-cream/40 hover:text-chili"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {lines.length > 0 && (
              <div className="border-t border-white/10 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cream/60">Subtotal</span>
                  <span className="font-display text-2xl text-cream">
                    {restaurant.currency}
                    {total}
                  </span>
                </div>
                <a
                  href={checkoutLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp mt-4 w-full"
                >
                  <MessageCircle className="h-4 w-4" /> Send order on WhatsApp
                </a>
                <button
                  onClick={clear}
                  className="mt-2 w-full text-center text-xs text-cream/45 hover:text-chili"
                >
                  Clear order
                </button>
                <p className="mt-3 text-center text-[11px] text-cream/40">
                  Final price & availability confirmed on WhatsApp.
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
