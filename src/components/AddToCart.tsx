"use client";
import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  if (product.stock <= 0) return <p className="text-ivory-dim">This item is sold out. <Link href="/contact" className="text-gold underline underline-offset-4">Ask us about restocking.</Link></p>;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center border border-white/15" role="group" aria-label="Quantity">
          <button className="flex h-12 w-12 items-center justify-center hover:text-gold-light" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"><Minus size={16} /></button>
          <span className="w-10 text-center" aria-live="polite">{qty}</span>
          <button className="flex h-12 w-12 items-center justify-center hover:text-gold-light" onClick={() => setQty(Math.min(Math.min(99, product.stock), qty + 1))} aria-label="Increase quantity"><Plus size={16} /></button>
        </div>
        <button className="btn-gold flex-1 sm:flex-none sm:min-w-56" onClick={() => { add(product, qty); setAdded(true); }}>Add to cart</button>
      </div>
      {added && (
        <p className="toast-in text-gold-light" role="status">
          Added to your cart. <Link href="/cart" className="underline underline-offset-4">View cart</Link>
        </p>
      )}
    </div>
  );
}
