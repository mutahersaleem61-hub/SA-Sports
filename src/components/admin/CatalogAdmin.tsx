"use client";
import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify, money } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const blank: Product = { slug: "", name: "", category_slug: "", description: "", price: 0, image_url: "", stock: 0, featured: false, active: true };

export function ProductsAdmin({ sb }: { sb: SupabaseClient }) {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [edit, setEdit] = useState<Product | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([sb.from("products").select("*").order("created_at", { ascending: false }), sb.from("categories").select("*").order("sort_order")]);
    setItems((p.data as Product[]) ?? []); setCats((c.data as Category[]) ?? []);
    if (p.error) setMsg(p.error.message);
  }, [sb]);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!edit) return;
    setBusy(true); setMsg("");
    const row = { slug: edit.slug || slugify(edit.name), name: edit.name, category_slug: edit.category_slug, description: edit.description, price: Number(edit.price), image_url: edit.image_url, stock: Math.max(0, Math.floor(Number(edit.stock))), featured: edit.featured, active: edit.active ?? true };
    const { error } = edit.id ? await sb.from("products").update(row).eq("id", edit.id) : await sb.from("products").insert(row);
    setBusy(false);
    if (error) return setMsg(error.message);
    setEdit(null); setMsg("Saved."); load();
  }
  async function upload(file: File) {
    if (file.size > 1.5 * 1024 * 1024) return setMsg("Image is over 1.5 MB. Resize or compress it first (free tier storage is limited).");
    setMsg("Uploading...");
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${file.name.split(".").pop()?.toLowerCase() || "jpg"}`;
    const { error } = await sb.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
    if (error) return setMsg(error.message);
    const { data } = sb.storage.from("product-images").getPublicUrl(path);
    setEdit((p) => (p ? { ...p, image_url: data.publicUrl } : p)); setMsg("Image uploaded. Remember to save the product.");
  }
  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const { error } = await sb.from("products").delete().eq("id", p.id!);
    setMsg(error ? error.message : "Deleted."); load();
  }
  async function quick(p: Product, patch: Partial<Product>) {
    const { error } = await sb.from("products").update(patch).eq("id", p.id!);
    if (error) setMsg(error.message); load();
  }

  if (edit) {
    return (
      <form onSubmit={save} className="max-w-3xl space-y-5">
        <h2 className="text-3xl">{edit.id ? "Edit product" : "New product"}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label className="label">Name</label><input required className="field" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value, slug: edit.id ? edit.slug : slugify(e.target.value) })} /></div>
          <div><label className="label">URL slug</label><input required pattern="[a-z0-9-]+" className="field" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} /></div>
          <div><label className="label">Category</label><select required className="field" value={edit.category_slug} onChange={(e) => setEdit({ ...edit, category_slug: e.target.value })}><option value="" disabled>Choose</option>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Price (USD)</label><input required type="number" min="0" step="0.01" className="field" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></div>
            <div><label className="label">Stock</label><input required type="number" min="0" className="field" value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: Number(e.target.value) })} /></div>
          </div>
        </div>
        <div><label className="label">Description</label><textarea rows={4} className="field" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
        <div>
          <label className="label">Image</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input className="field" placeholder="Image URL (or upload a file)" value={edit.image_url} onChange={(e) => setEdit({ ...edit, image_url: e.target.value })} />
            <label className="btn-ghost cursor-pointer">Upload<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
          </div>
          <p className="mt-2 text-xs text-ivory-dim">Use your own photos, compressed to under 1.5 MB (WebP or JPEG). Leave empty to show the built-in illustration.</p>
          {edit.image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={edit.image_url} alt="" className="mt-3 h-40 w-32 border border-white/10 object-cover" />}
        </div>
        <div className="flex gap-8">
          <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#b8975a]" checked={edit.featured} onChange={(e) => setEdit({ ...edit, featured: e.target.checked })} /> Featured on home page</label>
          <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#b8975a]" checked={edit.active ?? true} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Visible in shop</label>
        </div>
        {msg && <p role="status" className="text-gold-light">{msg}</p>}
        <div className="flex gap-3"><button className="btn-gold" disabled={busy}>{busy ? "Saving..." : "Save product"}</button><button type="button" className="btn-ghost" onClick={() => { setEdit(null); setMsg(""); }}>Cancel</button></div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between"><h2 className="text-3xl">Products ({items.length})</h2><button className="btn-gold btn-sm" onClick={() => setEdit({ ...blank, category_slug: cats[0]?.slug ?? "" })}>Add product</button></div>
      {msg && <p role="status" className="mt-3 text-gold-light">{msg}</p>}
      <div className="mt-6 overflow-x-auto border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-coal text-ivory-dim"><tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Visible</th><th className="p-3" /></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-ivory-dim">{cats.find((c) => c.slug === p.category_slug)?.name ?? p.category_slug}</td>
                <td className="p-3">{money(Number(p.price))}</td>
                <td className="p-3"><input aria-label={`Stock for ${p.name}`} type="number" min="0" defaultValue={p.stock} className="field w-24 !py-1" onBlur={(e) => Number(e.target.value) !== p.stock && quick(p, { stock: Math.max(0, Math.floor(Number(e.target.value))) })} /></td>
                <td className="p-3"><input aria-label={`Visible: ${p.name}`} type="checkbox" className="h-5 w-5 accent-[#b8975a]" checked={p.active ?? true} onChange={(e) => quick(p, { active: e.target.checked })} /></td>
                <td className="whitespace-nowrap p-3 text-right"><button className="mr-4 text-gold hover:text-gold-light" onClick={() => setEdit(p)}>Edit</button><button className="text-red-300 hover:text-red-200" onClick={() => remove(p)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-ivory-dim">No products yet. Run supabase/seed.sql or add one.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CategoriesAdmin({ sb }: { sb: SupabaseClient }) {
  const [items, setItems] = useState<Category[]>([]);
  const [edit, setEdit] = useState<(Category & { isNew?: boolean }) | null>(null);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => { const { data, error } = await sb.from("categories").select("*").order("sort_order"); setItems((data as Category[]) ?? []); if (error) setMsg(error.message); }, [sb]);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!edit) return;
    const row = { slug: edit.slug, name: edit.name, description: edit.description, sort_order: Number(edit.sort_order) };
    const { error } = edit.isNew ? await sb.from("categories").insert(row) : await sb.from("categories").update(row).eq("slug", edit.slug);
    if (error) return setMsg(error.message);
    setEdit(null); setMsg("Saved."); load();
  }
  async function remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"? It must have no products.`)) return;
    const { error } = await sb.from("categories").delete().eq("slug", c.slug);
    setMsg(error ? (error.code === "23503" ? "Move or delete the products in this category first." : error.message) : "Deleted."); load();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between"><h2 className="text-3xl">Categories</h2><button className="btn-gold btn-sm" onClick={() => setEdit({ slug: "", name: "", description: "", sort_order: items.length + 1, isNew: true })}>Add category</button></div>
      {msg && <p role="status" className="mt-3 text-gold-light">{msg}</p>}
      {edit && (
        <form onSubmit={save} className="mt-6 space-y-4 border border-gold/30 bg-coal p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Name</label><input required className="field" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value, slug: edit.isNew ? slugify(e.target.value) : edit.slug })} /></div>
            <div><label className="label">Slug</label><input required disabled={!edit.isNew} pattern="[a-z0-9-]+" className="field disabled:opacity-60" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} /></div>
          </div>
          <div><label className="label">Description</label><input className="field" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
          <div><label className="label">Sort order</label><input type="number" className="field w-28" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} /></div>
          <div className="flex gap-3"><button className="btn-gold btn-sm">Save</button><button type="button" className="btn-ghost btn-sm" onClick={() => setEdit(null)}>Cancel</button></div>
        </form>
      )}
      <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
        {items.map((c) => (
          <li key={c.slug} className="flex items-center justify-between gap-4 py-4">
            <div><p className="font-medium">{c.name}</p><p className="text-sm text-ivory-dim">{c.description}</p></div>
            <div className="whitespace-nowrap"><button className="mr-4 text-gold" onClick={() => setEdit(c)}>Edit</button><button className="text-red-300" onClick={() => remove(c)}>Delete</button></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
