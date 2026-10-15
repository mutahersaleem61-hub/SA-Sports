"use client";
import { useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import type { Category } from "@/lib/types";

function useSubmit(endpoint: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true); setError("");
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setDone(true); form.reset();
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setBusy(false); }
  }
  return { busy, error, done, onSubmit, reset: () => setDone(false) };
}

const Honeypot = () => (<div className="hidden" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>);
const CountryField = () => (
  <div>
    <label className="label" htmlFor="country">Country</label>
    <input id="country" name="country" required maxLength={100} list="country-list" autoComplete="country-name" className="field" />
    <datalist id="country-list">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
  </div>
);
const CategoryField = ({ categories, def }: { categories: Category[]; def?: string }) => (
  <div>
    <label className="label" htmlFor="product_category">Product category</label>
    <select id="product_category" name="product_category" required defaultValue={def ?? ""} className="field">
      <option value="" disabled>Choose a category</option>
      {categories.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
      <option value="Other">Other / not sure</option>
    </select>
  </div>
);
const Status = ({ error }: { error: string }) => (error ? <p role="alert" className="border border-red-400/40 bg-red-500/10 p-4 text-red-200">{error}</p> : null);
const Done = ({ title, text, onAgain }: { title: string; text: string; onAgain: () => void }) => (
  <div className="stitch-border p-8 text-center" role="status">
    <h3 className="text-3xl text-gold-light">{title}</h3>
    <p className="mx-auto mt-3 max-w-md text-ivory-dim">{text}</p>
    <button onClick={onAgain} className="btn-ghost mt-6">Send another</button>
  </div>
);

export function ContactForm({ categories, defaultCategory, messageLabel = "Message", placeholder }: { categories: Category[]; defaultCategory?: string; messageLabel?: string; placeholder?: string }) {
  const s = useSubmit("/api/contact");
  if (s.done) return <Done title="Message received" text="Thank you. We read every enquiry and will reply to the email address you gave us." onAgain={s.reset} />;
  return (
    <form onSubmit={s.onSubmit} className="space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required maxLength={120} autoComplete="name" className="field" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required maxLength={200} autoComplete="email" className="field" /></div>
        <CountryField />
        <CategoryField categories={categories} def={defaultCategory} />
      </div>
      <div><label className="label" htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className="field" /></div>
      <div><label className="label" htmlFor="message">{messageLabel}</label><textarea id="message" name="message" required maxLength={4000} rows={6} placeholder={placeholder} className="field" /></div>
      <Status error={s.error} />
      <button className="btn-gold w-full sm:w-auto" disabled={s.busy}>{s.busy ? "Sending..." : "Send message"}</button>
    </form>
  );
}

export function WholesaleForm({ categories }: { categories: Category[] }) {
  const s = useSubmit("/api/wholesale");
  if (s.done) return <Done title="Wholesale request received" text="Thank you. We will review your quantities and send a quotation to your email." onAgain={s.reset} />;
  return (
    <form onSubmit={s.onSubmit} className="space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="company_name">Company name</label><input id="company_name" name="company_name" required maxLength={160} autoComplete="organization" className="field" /></div>
        <div><label className="label" htmlFor="email">Business email</label><input id="email" name="email" type="email" required maxLength={200} autoComplete="email" className="field" /></div>
        <CountryField />
        <CategoryField categories={categories} />
      </div>
      <div><label className="label" htmlFor="estimated_quantity">Estimated quantity</label><input id="estimated_quantity" name="estimated_quantity" required maxLength={100} placeholder="For example: 200 pairs per season" className="field" /></div>
      <div><label className="label" htmlFor="message">Details (sizes, materials, branding, target prices)</label><textarea id="message" name="message" maxLength={4000} rows={5} className="field" /></div>
      <Status error={s.error} />
      <button className="btn-gold w-full sm:w-auto" disabled={s.busy}>{s.busy ? "Sending..." : "Request wholesale quotation"}</button>
    </form>
  );
}
