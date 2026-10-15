import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/data";
import { money } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { AddToCart } from "@/components/AddToCart";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { product } = await getProductBySlug(params.slug);
  return { title: product?.name ?? "Product", description: product?.description };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { product, category, related } = await getProductBySlug(params.slug);
  if (!product) notFound();
  return (
    <div className="container-x py-10 sm:py-16">
      <nav className="text-sm text-ivory-dim" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-gold-light">Shop</Link>
        {category && <> / <Link href={`/shop?category=${category.slug}`} className="hover:text-gold-light">{category.name}</Link></>}
      </nav>
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[4/5] overflow-hidden border border-white/10">
          <ProductImage src={product.image_url} category={product.category_slug} alt={product.name} />
        </div>
        <div className="lg:py-6">
          <h1 className="text-4xl sm:text-6xl">{product.name}</h1>
          <p className="mt-5 font-display text-4xl text-gold-light">{money(product.price)}</p>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ivory-dim">{product.description}</p>
          <p className="mt-6 text-sm text-ivory-dim">{product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left` : "In stock") : "Sold out"}</p>
          <div className="mt-8"><AddToCart product={product} /></div>
          <div className="stitch-border mt-10 p-5 text-sm text-ivory-dim">
            <p>Order request: you will not be charged on the website. We confirm total, shipping and payment with you by email before anything ships.</p>
            <p className="mt-3">Need this in a different size, colour or quantity? <Link href="/contact" className="text-gold underline underline-offset-4">Ask us</Link>, or see <Link href="/wholesale" className="text-gold underline underline-offset-4">wholesale</Link>.</p>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-3xl sm:text-4xl">More from {category?.name ?? "this collection"}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <ProductCard key={p.slug} product={p} categoryName={category?.name} />)}
          </div>
        </section>
      )}
    </div>
  );
}
