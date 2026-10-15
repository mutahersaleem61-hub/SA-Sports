import seed from "./seed.json";
import { getAnonClient } from "./supabase/server";
import type { Category, Product } from "./types";

/**
 * Reads the catalog from Supabase when it is configured.
 * If Supabase is not configured (or unreachable) the site falls back to the bundled demo catalog
 * so the storefront still renders. `live` tells the caller which one it got.
 */
export async function getCatalog(): Promise<{ categories: Category[]; products: Product[]; live: boolean }> {
  const sb = getAnonClient();
  if (sb) {
    try {
      const [c, p] = await Promise.all([
        sb.from("categories").select("*").order("sort_order"),
        sb.from("products").select("*").eq("active", true).order("created_at"),
      ]);
      if (!c.error && !p.error && c.data && p.data) {
        return {
          categories: c.data as Category[],
          products: (p.data as Product[]).map((x) => ({ ...x, price: Number(x.price) })),
          live: true,
        };
      }
    } catch {
      /* fall through to demo data */
    }
  }
  return { categories: seed.categories as Category[], products: seed.products as Product[], live: false };
}

export async function getProductBySlug(slug: string) {
  const { products, categories, live } = await getCatalog();
  const product = products.find((p) => p.slug === slug) ?? null;
  const category = product ? categories.find((c) => c.slug === product.category_slug) ?? null : null;
  return { product, category, related: products.filter((p) => p.category_slug === product?.category_slug && p.slug !== slug).slice(0, 3), live };
}
