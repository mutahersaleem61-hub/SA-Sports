"use client";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const out = product.stock <= 0;
  return (
    <article className="group card flex flex-col overflow-hidden transition duration-500 hover:border-gold/50">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-ink" aria-label={product.name}>
        <ProductImage src={product.image_url} category={product.category_slug} alt={product.name} className="zoom-img" />
        {out && <span className="absolute left-3 top-3 bg-ink/90 px-3 py-1 text-xs text-ivory-dim">Sold out</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {categoryName && <p className="text-xs text-gold">{categoryName}</p>}
        <h3 className="mt-1 font-display text-[1.45rem] leading-snug">
          <Link href={`/shop/${product.slug}`} className="hover:text-gold-light">{product.name}</Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="font-display text-2xl text-gold-light">{money(product.price)}</span>
          <button
            disabled={out}
            onClick={() => { add(product); setAdded(true); setTimeout(() => setAdded(false), 1600); }}
            className="btn-ghost btn-sm"
            aria-live="polite"
          >
            {added ? <><Check size={16} /> Added</> : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
