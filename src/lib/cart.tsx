"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, Product } from "./types";

type CartCtx = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (p: Product, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  ready: boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "sa-sports-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
    }
  }, [lines, ready]);

  const value = useMemo<CartCtx>(() => ({
    lines,
    ready,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    total: lines.reduce((n, l) => n + l.quantity * l.price, 0),
    add: (p, qty = 1) =>
      setLines((prev) => {
        const found = prev.find((l) => l.slug === p.slug);
        if (found) return prev.map((l) => (l.slug === p.slug ? { ...l, quantity: Math.min(l.quantity + qty, 99) } : l));
        return [...prev, { slug: p.slug, name: p.name, price: p.price, image_url: p.image_url, category_slug: p.category_slug, quantity: qty }];
      }),
    setQty: (slug, qty) => setLines((prev) => prev.map((l) => (l.slug === slug ? { ...l, quantity: Math.max(1, Math.min(qty, 99)) } : l))),
    remove: (slug) => setLines((prev) => prev.filter((l) => l.slug !== slug)),
    clear: () => setLines([]),
  }), [lines, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
