"use client";

import { CartProvider } from "@/lib/cart";
import SmoothScroll from "./SmoothScroll";
import CartDrawer from "./CartDrawer";
import WhatsAppButton from "./WhatsAppButton";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SmoothScroll />
      {children}
      <CartDrawer />
      <WhatsAppButton />
    </CartProvider>
  );
}
