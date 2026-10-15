"use client";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";

export default function CartPage() {
  const { lines, total, setQty, remove, ready } = useCart();
  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="text-5xl sm:text-6xl">Your cart</h1>
      {!ready ? null : lines.length === 0 ? (
        <div className="mt-10 border border-dashed border-gold/40 p-10 text-center">
          <p className="font-display text-3xl">Your cart is empty.</p>
          <Link href="/shop" className="btn-gold mt-6">Browse the collection</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {lines.map((l) => (
              <li key={l.slug} className="flex gap-4 py-6 sm:gap-6">
                <Link href={`/shop/${l.slug}`} className="h-28 w-24 shrink-0 overflow-hidden border border-white/10 sm:h-32 sm:w-28">
                  <ProductImage src={l.image_url} category={l.category_slug} alt={l.name} />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <Link href={`/shop/${l.slug}`} className="font-display text-2xl leading-tight hover:text-gold-light">{l.name}</Link>
                    <button onClick={() => remove(l.slug)} className="flex h-10 w-10 shrink-0 items-center justify-center text-ivory-dim hover:text-gold-light" aria-label={`Remove ${l.name}`}><Trash2 size={18} /></button>
                  </div>
                  <p className="text-ivory-dim">{money(l.price)}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center border border-white/15">
                      <button className="flex h-10 w-10 items-center justify-center" onClick={() => setQty(l.slug, l.quantity - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                      <span className="w-8 text-center">{l.quantity}</span>
                      <button className="flex h-10 w-10 items-center justify-center" onClick={() => setQty(l.slug, l.quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                    </div>
                    <span className="font-display text-2xl text-gold-light">{money(l.price * l.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit border border-gold/30 bg-coal p-6 sm:p-8">
            <h2 className="text-3xl">Order summary</h2>
            <div className="mt-6 flex justify-between text-lg"><span>Subtotal</span><span className="text-gold-light">{money(total)}</span></div>
            <p className="mt-3 text-sm text-ivory-dim">Shipping and any import duties are quoted when we confirm your order. You pay nothing on this website.</p>
            <Link href="/checkout" className="btn-gold mt-8 w-full">Continue to order request</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
