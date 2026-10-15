import { NextResponse } from "next/server";
import { getAnonClient } from "@/lib/supabase/server";
import { guard, err, notConfigured } from "@/lib/api";
import { isEmail, str } from "@/lib/validate";
import { notifyOwner } from "@/lib/notify";

export async function POST(req: Request) {
  const g = await guard(req, "orders", 8);
  if ("response" in g) return g.response;
  const b = g.body;
  const name = str(b.name, 120), email = str(b.email, 200), country = str(b.country, 100), address = str(b.address, 500);
  if (!name || !country || !address) return err("Please fill in every required field.");
  if (!isEmail(email)) return err("Please enter a valid email address.");
  const items = Array.isArray(b.items)
    ? b.items.slice(0, 40).map((i: any) => ({ slug: str(i?.slug, 120), quantity: Math.floor(Number(i?.quantity)) })).filter((i) => i.slug && i.quantity >= 1 && i.quantity <= 500)
    : [];
  if (items.length === 0) return err("Your cart is empty.");

  const sb = getAnonClient();
  if (!sb) return notConfigured();
  // Prices are computed inside the database function from the products table. The browser never sets a price.
  const { data, error } = await sb.rpc("place_order", {
    p_name: name, p_email: email, p_phone: str(b.phone, 40), p_country: country, p_address: address, p_notes: str(b.notes, 2000), p_items: items,
  });
  if (error) {
    console.error("place_order failed:", error.message);
    const m = error.message || "";
    if (/Not enough stock|Product not available/.test(m)) return err(m.replace(/^.*?(Not enough stock|Product not available)/, "$1"), 409);
    return err("We could not save your order request. Please try again shortly.", 500);
  }
  const mail = await notifyOwner(`New order request ${data} from ${name} (${country})`, {
    Reference: String(data), Name: name, Email: email, Country: country, Address: address, Items: items.map((i) => `${i.slug} x ${i.quantity}`).join("\n"),
  });
  console.log("order saved; email notification:", mail);
  return NextResponse.json({ ok: true, reference: data });
}
