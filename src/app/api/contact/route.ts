import { NextResponse } from "next/server";
import { getAnonClient } from "@/lib/supabase/server";
import { guard, err, notConfigured } from "@/lib/api";
import { isEmail, str } from "@/lib/validate";
import { notifyOwner } from "@/lib/notify";

export async function POST(req: Request) {
  const g = await guard(req, "contact");
  if ("response" in g) return g.response;
  const b = g.body;
  const row = {
    name: str(b.name, 120), email: str(b.email, 200), country: str(b.country, 100),
    product_category: str(b.product_category, 100), phone: str(b.phone, 40) || null, message: str(b.message, 4000),
  };
  if (!row.name || !row.country || !row.product_category || !row.message) return err("Please fill in every required field.");
  if (!isEmail(row.email)) return err("Please enter a valid email address.");

  const sb = getAnonClient();
  if (!sb) return notConfigured();
  const { error } = await sb.from("inquiries").insert(row);
  if (error) { console.error("inquiry insert failed:", error.message); return err("We could not save your message. Please try again shortly.", 500); }

  const mail = await notifyOwner(`New inquiry from ${row.name} (${row.country})`, {
    Name: row.name, Email: row.email, Country: row.country, Category: row.product_category, Phone: row.phone ?? "", Message: row.message,
  });
  console.log("inquiry saved; email notification:", mail);
  return NextResponse.json({ ok: true });
}
