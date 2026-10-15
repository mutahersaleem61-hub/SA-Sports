"use client";
import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { ProductsAdmin, CategoriesAdmin } from "./CatalogAdmin";
import { InquiriesAdmin, WholesaleAdmin, OrdersAdmin, Overview } from "./LeadsAdmin";

const TABS = ["Overview", "Products", "Categories", "Inquiries", "Wholesale", "Orders"] as const;
type Tab = (typeof TABS)[number];

export function AdminApp() {
  const sb = getBrowserClient();
  const [state, setState] = useState<"loading" | "out" | "denied" | "in">("loading");
  const [tab, setTab] = useState<Tab>("Overview");
  const [err, setErr] = useState("");

  async function check(client: SupabaseClient) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return setState("out");
    // RLS only lets a user read their own row in `admins`, so this is true only for real admins.
    const { data } = await client.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    setState(data ? "in" : "denied");
  }
  useEffect(() => { if (sb) check(sb); else setState("out"); }, []); // eslint-disable-line

  if (!sb) {
    return <div className="container-x py-20"><h1 className="text-4xl">Admin unavailable</h1><p className="mt-4 max-w-xl text-ivory-dim">Supabase is not connected. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see README), then reload.</p></div>;
  }
  if (state === "loading") return <div className="container-x py-20 text-ivory-dim">Loading...</div>;

  if (state === "out" || state === "denied") {
    return (
      <div className="container-x max-w-md py-16 sm:py-24">
        <h1 className="text-5xl">Staff sign in</h1>
        {state === "denied" && <p role="alert" className="mt-4 border border-red-400/40 bg-red-500/10 p-4 text-red-200">This account is signed in but is not an administrator. Add it with supabase/make-admin.sql, or sign in with another account.</p>}
        <form className="mt-8 space-y-5" onSubmit={async (e) => {
          e.preventDefault(); setErr("");
          const f = new FormData(e.currentTarget);
          const { error } = await sb.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
          if (error) return setErr(error.message);
          check(sb);
        }}>
          <div><label className="label" htmlFor="a-email">Email</label><input id="a-email" name="email" type="email" required autoComplete="username" className="field" /></div>
          <div><label className="label" htmlFor="a-pass">Password</label><input id="a-pass" name="password" type="password" required autoComplete="current-password" className="field" /></div>
          {err && <p role="alert" className="text-red-300">{err}</p>}
          <button className="btn-gold w-full">Sign in</button>
        </form>
        {state === "denied" && <button className="btn-ghost mt-4 w-full" onClick={async () => { await sb.auth.signOut(); setState("out"); }}>Sign out</button>}
      </div>
    );
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl">Dashboard</h1>
        <button className="btn-ghost btn-sm" onClick={async () => { await sb.auth.signOut(); setState("out"); }}>Sign out</button>
      </div>
      <div className="-mx-5 mt-6 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex gap-2" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`shrink-0 border px-5 py-2.5 text-sm transition ${tab === t ? "border-gold bg-gold text-ink" : "border-white/15 text-ivory-dim hover:border-gold/60"}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="mt-8">
        {tab === "Overview" && <Overview sb={sb} go={(t) => setTab(t as Tab)} />}
        {tab === "Products" && <ProductsAdmin sb={sb} />}
        {tab === "Categories" && <CategoriesAdmin sb={sb} />}
        {tab === "Inquiries" && <InquiriesAdmin sb={sb} />}
        {tab === "Wholesale" && <WholesaleAdmin sb={sb} />}
        {tab === "Orders" && <OrdersAdmin sb={sb} />}
      </div>
    </div>
  );
}
