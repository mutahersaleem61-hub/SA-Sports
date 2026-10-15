"use client";
import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { money } from "@/lib/format";

const when = (s: string) => new Date(s).toLocaleString();

function useRows<T>(sb: SupabaseClient, table: string, select = "*") {
  const [rows, setRows] = useState<T[]>([]);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await sb.from(table).select(select).order("created_at", { ascending: false }).limit(200);
    if (error) setMsg(error.message); setRows((data as unknown as T[]) ?? []);
  }, [sb, table, select]);
  useEffect(() => { load(); }, [load]);
  async function patch(id: string, p: object) { const { error } = await sb.from(table).update(p).eq("id", id); setMsg(error ? error.message : ""); load(); }
  async function del(id: string) { if (!confirm("Delete this record permanently?")) return; const { error } = await sb.from(table).delete().eq("id", id); setMsg(error ? error.message : ""); load(); }
  return { rows, msg, patch, del };
}

const Empty = ({ text }: { text: string }) => <p className="border border-dashed border-gold/40 p-8 text-center text-ivory-dim">{text}</p>;
const StatusSelect = ({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) => (
  <select aria-label="Status" className="field !w-auto !py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select>
);

type Inq = { id: string; name: string; email: string; country: string; product_category: string; phone: string | null; message: string; status: string; created_at: string };
export function InquiriesAdmin({ sb }: { sb: SupabaseClient }) {
  const { rows, msg, patch, del } = useRows<Inq>(sb, "inquiries");
  return (
    <div>
      <h2 className="text-3xl">Customer inquiries ({rows.length})</h2>
      {msg && <p className="mt-3 text-red-300">{msg}</p>}
      <div className="mt-6 space-y-4">
        {rows.length === 0 && <Empty text="No inquiries yet. Test the contact form to see one appear here." />}
        {rows.map((r) => (
          <article key={r.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-display text-2xl">{r.name} <span className="text-base text-ivory-dim">from {r.country}</span></p><p className="text-sm text-ivory-dim">{when(r.created_at)} · {r.product_category}</p></div>
              <StatusSelect value={r.status} options={["new", "replied", "closed"]} onChange={(v) => patch(r.id, { status: v })} />
            </div>
            <p className="mt-4 whitespace-pre-wrap">{r.message}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"><a className="text-gold" href={`mailto:${r.email}`}>{r.email}</a>{r.phone && <a className="text-gold" href={`tel:${r.phone}`}>{r.phone}</a>}<button className="text-red-300" onClick={() => del(r.id)}>Delete</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}

type Lead = { id: string; company_name: string; country: string; email: string; product_category: string; estimated_quantity: string; message: string; status: string; notes: string; created_at: string };
export function WholesaleAdmin({ sb }: { sb: SupabaseClient }) {
  const { rows, msg, patch, del } = useRows<Lead>(sb, "wholesale_leads");
  return (
    <div>
      <h2 className="text-3xl">Wholesale leads ({rows.length})</h2>
      {msg && <p className="mt-3 text-red-300">{msg}</p>}
      <div className="mt-6 space-y-4">
        {rows.length === 0 && <Empty text="No wholesale leads yet." />}
        {rows.map((r) => (
          <article key={r.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-display text-2xl">{r.company_name} <span className="text-base text-ivory-dim">({r.country})</span></p><p className="text-sm text-ivory-dim">{when(r.created_at)} · {r.product_category} · {r.estimated_quantity}</p></div>
              <StatusSelect value={r.status} options={["new", "contacted", "quoted", "won", "lost"]} onChange={(v) => patch(r.id, { status: v })} />
            </div>
            {r.message && <p className="mt-4 whitespace-pre-wrap">{r.message}</p>}
            <label className="label mt-4" htmlFor={`n-${r.id}`}>Internal notes</label>
            <textarea id={`n-${r.id}`} rows={2} defaultValue={r.notes} className="field text-sm" onBlur={(e) => e.target.value !== r.notes && patch(r.id, { notes: e.target.value })} />
            <div className="mt-4 flex gap-6 text-sm"><a className="text-gold" href={`mailto:${r.email}`}>{r.email}</a><button className="text-red-300" onClick={() => del(r.id)}>Delete</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}

type Order = { id: string; reference: string; customer_name: string; email: string; phone: string | null; country: string; address: string; notes: string; total: number; status: string; created_at: string; order_items: { id: string; product_name: string; unit_price: number; quantity: number }[] };
export function OrdersAdmin({ sb }: { sb: SupabaseClient }) {
  const { rows, msg, patch, del } = useRows<Order>(sb, "orders", "*, order_items(*)");
  return (
    <div>
      <h2 className="text-3xl">Order requests ({rows.length})</h2>
      <p className="mt-2 max-w-2xl text-sm text-ivory-dim">Moving an order to confirmed deducts stock automatically; cancelling a confirmed order restores it. Payment is arranged by email, outside the site.</p>
      {msg && <p className="mt-3 text-red-300">{msg}</p>}
      <div className="mt-6 space-y-4">
        {rows.length === 0 && <Empty text="No orders yet." />}
        {rows.map((r) => (
          <article key={r.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-display text-2xl">{r.reference} <span className="text-base text-ivory-dim">{r.customer_name}, {r.country}</span></p><p className="text-sm text-ivory-dim">{when(r.created_at)}</p></div>
              <StatusSelect value={r.status} options={["pending", "confirmed", "shipped", "delivered", "cancelled"]} onChange={(v) => patch(r.id, { status: v })} />
            </div>
            <ul className="mt-4 divide-y divide-white/10 text-sm">{r.order_items.map((i) => <li key={i.id} className="flex justify-between py-2"><span>{i.product_name} × {i.quantity}</span><span>{money(i.unit_price * i.quantity)}</span></li>)}</ul>
            <p className="mt-3 text-right text-lg text-gold-light">Total {money(Number(r.total))}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ivory-dim">{r.address}{r.notes ? `\nNotes: ${r.notes}` : ""}</p>
            <div className="mt-4 flex flex-wrap gap-6 text-sm"><a className="text-gold" href={`mailto:${r.email}`}>{r.email}</a>{r.phone && <a className="text-gold" href={`tel:${r.phone}`}>{r.phone}</a>}<button className="text-red-300" onClick={() => del(r.id)}>Delete</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function Overview({ sb, go }: { sb: SupabaseClient; go: (t: string) => void }) {
  const [c, setC] = useState<Record<string, number>>({});
  useEffect(() => {
    (async () => {
      const q = (t: string, f?: [string, string]) => { let x = sb.from(t).select("id", { count: "exact", head: true }); if (f) x = x.eq(f[0], f[1]); return x; };
      const [a, b, d, e, p] = await Promise.all([q("inquiries", ["status", "new"]), q("wholesale_leads", ["status", "new"]), q("orders", ["status", "pending"]), q("products"), sb.from("products").select("id", { count: "exact", head: true }).lte("stock", 5)]);
      setC({ Inquiries: a.count ?? 0, Wholesale: b.count ?? 0, Orders: d.count ?? 0, Products: e.count ?? 0, low: p.count ?? 0 });
    })();
  }, [sb]);
  const cards: [string, string, string][] = [["Inquiries", "New inquiries", "Inquiries"], ["Wholesale", "New wholesale leads", "Wholesale"], ["Orders", "Pending orders", "Orders"], ["Products", "Products in catalog", "Products"]];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([k, label, tab]) => (
        <button key={k} onClick={() => go(tab)} className="card p-6 text-left transition hover:border-gold/60"><p className="font-display text-5xl text-gold-light">{c[k] ?? "-"}</p><p className="mt-2 text-ivory-dim">{label}</p></button>
      ))}
      <p className="sm:col-span-2 lg:col-span-4 text-ivory-dim">{c.low ? `${c.low} product(s) have 5 or fewer in stock.` : "No low-stock products."}</p>
    </div>
  );
}
