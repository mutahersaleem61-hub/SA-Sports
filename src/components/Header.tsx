"use client";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { Monogram, Wordmark } from "./Logo";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/custom", label: "Custom work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-50 border-b border-gold/20 bg-ink/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center gap-3" aria-label="SA SPORTS home" onClick={() => setOpen(false)}>
          <Monogram className="h-10 w-10 sm:h-12 sm:w-12" />
          <Wordmark className="hidden text-lg sm:block" />
        </Link>

        <nav className="hidden items-center gap-9 text-sm md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-ivory-dim transition hover:text-gold-light">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center text-ivory transition hover:text-gold-light" aria-label={`Cart, ${count} items`}>
            <ShoppingBag size={22} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold text-ink">{count}</span>
            )}
          </Link>
          <button className="flex h-11 w-11 items-center justify-center md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-gold/20 bg-ink md:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col py-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-white/5 py-4 font-display text-2xl text-ivory">{l.label}</Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
