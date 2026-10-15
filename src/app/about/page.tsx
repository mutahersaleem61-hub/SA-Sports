import type { Metadata } from "next";
import Link from "next/link";
import { Monogram } from "@/components/Logo";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <div className="container-x py-12 sm:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h1 className="text-5xl sm:text-6xl">About SA SPORTS</h1>
          <div className="mt-8 max-w-2xl space-y-6 font-display text-2xl leading-relaxed text-ivory-dim">
            <p>SA SPORTS makes and supplies leather goods and boxing equipment for people who use them hard: riders, fighters, travellers and the shops and gyms that serve them.</p>
            <p>We work from the material up, so we can sell you a finished jacket, a pair of gloves, or the hides to make your own. Everything can be ordered at retail or in volume, and most things can be made to your specification.</p>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/shop" className="btn-gold">Shop the collection</Link>
            <Link href="/contact" className="btn-ghost">Contact us</Link>
          </div>
        </div>
        <Monogram className="mx-auto w-64 lg:w-full lg:max-w-xs" />
      </div>
      <p className="mt-16 text-sm text-ivory-dim/60">Site owner: replace this page with your real company story, history and certifications in src/app/about/page.tsx.</p>
    </div>
  );
}
