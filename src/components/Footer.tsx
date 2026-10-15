import Link from "next/link";
import { Monogram, Wordmark } from "./Logo";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-coal">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Monogram className="h-12 w-12" />
            <Wordmark className="text-xl" />
          </div>
          <p className="mt-5 max-w-sm text-ivory-dim">Leather goods and boxing equipment made to be used hard and kept for years. Retail and wholesale, shipped worldwide.</p>
        </div>
        <div>
          <h3 className="font-display text-2xl text-gold-light">Explore</h3>
          <ul className="mt-4 space-y-3 text-ivory-dim">
            <li><Link className="hover:text-gold-light" href="/shop">Shop all products</Link></li>
            <li><Link className="hover:text-gold-light" href="/wholesale">Wholesale enquiries</Link></li>
            <li><Link className="hover:text-gold-light" href="/custom">Custom leather work</Link></li>
            <li><Link className="hover:text-gold-light" href="/about">About SA SPORTS</Link></li>
            <li><Link className="hover:text-gold-light" href="/cart">Your cart</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-2xl text-gold-light">Contact</h3>
          <ul className="mt-4 space-y-3 text-ivory-dim">
            <li><a className="hover:text-gold-light" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            <li>{SITE.phone}</li>
            <li>{SITE.address}</li>
            <li>{SITE.hours}</li>
            <li><Link className="text-gold hover:text-gold-light" href="/contact">Send us a message</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-sm text-ivory-dim/70">
        <span>© {new Date().getFullYear()} SA SPORTS. All rights reserved.</span>
        <span className="mx-3 hidden sm:inline">|</span>
        <Link href="/admin" className="block pt-2 hover:text-gold-light sm:inline sm:pt-0">Staff sign in</Link>
      </div>
    </footer>
  );
}
