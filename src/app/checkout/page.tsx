"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { COUNTRIES } from "@/lib/countries";

export default function CheckoutPage() {
  const { lines, total, clear, ready } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ reference: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place the order request.");
      clear();
      setDone({ reference: data.reference });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-5xl sm:text-6xl">Order request received</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ivory-dim">Your reference is <span className="font-semibold text-gold-light">{done.reference}</span>. Keep it for your records. We will email you the final total, shipping cost and payment options. Nothing has been charged.</p>
        <Link href="/shop" className="btn-gold mt-10">Continue shopping</Link>
      </div>
    );
  }
  if (ready && lines.length === 0) {
    return <div className="container-x py-20 text-center"><h1 className="text-4xl">Your cart is empty</h1><Link href="/shop" className="btn-gold mt-8">Browse the collection</Link></div>;
  }

  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="text-5xl sm:text-6xl">Order request</h1>
      <p className="mt-4 max-w-xl text-ivory-dim">Tell us where to send your order. We will reply by email to confirm the total, shipping and payment. No payment is taken here.</p>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="space-y-5">
          <div className="hidden" aria-hidden="true"><label>Leave blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required maxLength={120} autoComplete="name" className="field" /></div>
            <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required maxLength={200} autoComplete="email" className="field" /></div>
            <div><label className="label" htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className="field" /></div>
            <div><label className="label" htmlFor="country">Country</label><input id="country" name="country" required list="countries" maxLength={100} autoComplete="country-name" className="field" /><datalist id="countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist></div>
          </div>
          <div><label className="label" htmlFor="address">Delivery address</label><textarea id="address" name="address" required maxLength={500} rows={3} autoComplete="street-address" className="field" /></div>
          <div><label className="label" htmlFor="notes">Notes (sizes, colours, deadlines)</label><textarea id="notes" name="notes" maxLength={2000} rows={3} className="field" /></div>
          {error && <p role="alert" className="border border-red-400/40 bg-red-500/10 p-4 text-red-200">{error}</p>}
          <button className="btn-gold w-full sm:w-auto" disabled={busy || lines.length === 0}>{busy ? "Sending..." : "Send order request"}</button>
        </form>
        <aside className="h-fit border border-gold/30 bg-coal p-6">
          <h2 className="text-3xl">Your items</h2>
          <ul className="mt-5 divide-y divide-white/10">
            {lines.map((l) => (<li key={l.slug} className="flex justify-between gap-4 py-3 text-ivory-dim"><span>{l.name} × {l.quantity}</span><span>{money(l.price * l.quantity)}</span></li>))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gold/30 pt-4 text-lg"><span>Subtotal</span><span className="text-gold-light">{money(total)}</span></div>
          <p className="mt-3 text-xs text-ivory-dim">Prices are checked against our current price list when your request is saved.</p>
        </aside>
      </div>
    </div>
  );
}
