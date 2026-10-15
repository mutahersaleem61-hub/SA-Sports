"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ShopClient({ products, categories, initialCategory }: { products: Product[]; categories: Category[]; initialCategory: string }) {
  const [cat, setCat] = useState(initialCategory);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");
  const [inStock, setInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");

  const list = useMemo(() => {
    let out = products.filter((p) => (cat === "all" || p.category_slug === cat));
    if (q.trim()) out = out.filter((p) => (p.name + " " + p.description).toLowerCase().includes(q.trim().toLowerCase()));
    if (inStock) out = out.filter((p) => p.stock > 0);
    if (maxPrice && Number(maxPrice) > 0) out = out.filter((p) => p.price <= Number(maxPrice));
    if (sort === "low") out = [...out].sort((a, b) => a.price - b.price);
    else if (sort === "high") out = [...out].sort((a, b) => b.price - a.price);
    else if (sort === "name") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    else out = [...out].sort((a, b) => Number(b.featured) - Number(a.featured));
    return out;
  }, [products, cat, q, sort, inStock, maxPrice]);

  const chip = (active: boolean) =>
    `shrink-0 border px-4 py-2 text-sm transition ${active ? "border-gold bg-gold text-ink" : "border-white/15 text-ivory-dim hover:border-gold/60 hover:text-ivory"}`;

  return (
    <div>
      <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0" role="group" aria-label="Filter by category">
        <div className="flex gap-2 sm:flex-wrap">
          <button className={chip(cat === "all")} onClick={() => setCat("all")}>All</button>
          {categories.map((c) => (
            <button key={c.slug} className={chip(cat === c.slug)} onClick={() => setCat(c.slug)} aria-pressed={cat === c.slug}>{c.name}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <div className="relative">
          <label htmlFor="q" className="sr-only">Search products</label>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ivory-dim" />
          <input id="q" className="field pl-11" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label htmlFor="sort" className="sr-only">Sort</label>
          <select id="sort" className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured first</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div>
          <label htmlFor="max" className="sr-only">Maximum price in US dollars</label>
          <input id="max" type="number" min="0" inputMode="numeric" className="field" placeholder="Max price (USD)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <label className="flex min-h-[48px] items-center gap-3 text-sm text-ivory-dim">
          <input type="checkbox" className="h-5 w-5 accent-[#b8975a]" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          In stock only
        </label>
      </div>

      <p className="mt-8 text-sm text-ivory-dim" aria-live="polite">{list.length} {list.length === 1 ? "product" : "products"}</p>

      {list.length === 0 ? (
        <div className="mt-6 border border-dashed border-gold/40 p-10 text-center">
          <p className="font-display text-2xl">Nothing matches those filters.</p>
          <button className="btn-ghost mt-6" onClick={() => { setCat("all"); setQ(""); setInStock(false); setMaxPrice(""); }}>Clear filters</button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => <ProductCard key={p.slug} product={p} categoryName={categories.find((c) => c.slug === p.category_slug)?.name} />)}
        </div>
      )}
    </div>
  );
}
