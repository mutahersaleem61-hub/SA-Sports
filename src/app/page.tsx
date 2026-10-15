import Link from "next/link";
import { getCatalog } from "@/lib/data";
import { HeroMark } from "@/components/HeroMark";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 60;

export default async function Home() {
  const { categories, products } = await getCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name;

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden border-b border-gold/20">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 75% 30%, #2a2016 0%, #0a0908 62%)" }} />
        <div className="container-x relative grid items-center gap-10 py-14 sm:py-20 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <h1 className="hero-rise text-[2.9rem] leading-[1.02] sm:text-7xl lg:text-[5.4rem]" style={{ animationDelay: ".5s" }}>
              Leather made to be carried for a <span className="gold-text italic">lifetime</span>.
            </h1>
            <p className="hero-rise mt-7 max-w-xl text-lg text-ivory-dim" style={{ animationDelay: ".8s" }}>
              Jackets, boots, bags and boxing gloves from SA SPORTS: selected hides, firm stitching, hardware that does not tarnish in a season. Retail orders and wholesale supply, shipped internationally.
            </p>
            <div className="hero-rise mt-10 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: "1.1s" }}>
              <Link href="/shop" className="btn-gold">Shop the collection</Link>
              <Link href="/wholesale" className="btn-ghost">Wholesale enquiries</Link>
            </div>
          </div>
          <div className="order-first lg:order-none">
            <HeroMark />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container-x">
          <h2 className="max-w-2xl text-4xl sm:text-5xl">Everything we make, from hide to finished piece</h2>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {categories.map((c) => (
              <Link key={c.slug} href={`/shop?category=${c.slug}`} className="group relative aspect-[4/5] overflow-hidden border border-white/10 transition duration-500 hover:border-gold/60 sm:aspect-[5/4]">
                <ProductArt category={c.slug} className="zoom-img h-full w-full" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent p-4 pt-14 sm:p-6 sm:pt-20">
                  <h3 className="text-xl leading-tight sm:text-3xl">{c.name}</h3>
                  <p className="mt-1 hidden text-sm text-ivory-dim sm:block">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="section border-y border-white/10 bg-coal">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-4xl sm:text-5xl">Featured pieces</h2>
              <Link href="/shop" className="text-gold hover:text-gold-light">See all products</Link>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => <ProductCard key={p.slug} product={p} categoryName={catName(p.category_slug)} />)}
            </div>
          </div>
        </section>
      )}

      {/* How ordering works: a real sequence */}
      <section className="section">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-4xl sm:text-5xl">How ordering works</h2>
            <p className="mt-5 max-w-md text-ivory-dim">We confirm every order personally before you pay, so freight and customs are quoted correctly for your country.</p>
          </div>
          <ol className="divide-y divide-white/10 border-y border-white/10">
            {[
              ["Choose your products", "Add items to your cart and send an order request. No payment is taken on the website."],
              ["We confirm by email", "We reply with final totals, shipping cost to your country and the payment methods we accept."],
              ["Pay, then we ship", "Once payment is confirmed we pack and dispatch your order and send tracking."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-6 py-7">
                <span className="font-display text-4xl text-gold" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3 className="text-2xl">{t}</h3>
                  <p className="mt-1 text-ivory-dim">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Wholesale & custom */}
      <section className="grain relative overflow-hidden border-t border-gold/20 bg-leather">
        <div className="container-x relative grid gap-px bg-gold/20 py-0 md:grid-cols-2">
          <div className="bg-leather py-16 pr-0 md:pr-12">
            <h2 className="text-4xl">Buying in volume?</h2>
            <p className="mt-4 max-w-md text-ivory-dim">Retailers, gyms, tanneries and brands: tell us the products and quantities and we will send a wholesale quotation.</p>
            <Link href="/wholesale" className="btn-gold mt-8">Request wholesale prices</Link>
          </div>
          <div className="bg-leather py-16 md:pl-12">
            <h2 className="text-4xl">Need something made to order?</h2>
            <p className="mt-4 max-w-md text-ivory-dim">Your design, sizes, colours and logo, in genuine leather. Send us a brief and a reference image.</p>
            <Link href="/custom" className="btn-ghost mt-8">Start a custom project</Link>
          </div>
        </div>
      </section>
    </>
  );
}
