import type { Metadata } from "next";
import { getCatalog } from "@/lib/data";
import { ShopClient } from "@/components/ShopClient";

export const revalidate = 60;
export const metadata: Metadata = { title: "Shop" };

export default async function Shop({ searchParams }: { searchParams: { category?: string } }) {
  const { products, categories, live } = await getCatalog();
  const initial = categories.some((c) => c.slug === searchParams.category) ? searchParams.category! : "all";
  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="text-5xl sm:text-6xl">The collection</h1>
      <p className="mt-4 max-w-xl text-ivory-dim">Prices are in US dollars. Shipping is quoted for your country when we confirm your order.</p>
      {!live && <p className="mt-6 border border-gold/40 bg-gold/10 p-4 text-sm text-gold-light">Demo catalog: Supabase is not connected yet, so these are sample products. See the README to connect your database.</p>}
      <div className="mt-10"><ShopClient products={products} categories={categories} initialCategory={initial} /></div>
    </div>
  );
}
