import { NextResponse } from "next/server";
import { getAnonClient } from "@/lib/supabase/server";
import { guard, err, notConfigured } from "@/lib/api";
import { isEmail, str } from "@/lib/validate";
import { notifyOwner } from "@/lib/notify";

export async function POST(req: Request) {
  const g = await guard(req, "wholesale");
  if ("response" in g) return g.response;
  const b = g.body;
  const row = {
    company_name: str(b.company_name, 160), country: str(b.country, 100), email: str(b.email, 200),
    product_category: str(b.product_category, 100), estimated_quantity: str(b.estimated_quantity, 100), message: str(b.message, 4000),
  };
  if (!row.company_name || !row.country || !row.product_category || !row.estimated_quantity) return err("Please fill in every required field.");
  if (!isEmail(row.email)) return err("Please enter a valid email address.");

  const sb = getAnonClient();
  if (!sb) return notConfigured();
  const { error } = await sb.from("wholesale_leads").insert(row);
  if (error) { console.error("wholesale insert failed:", error.message); return err("We could not save your request. Please try again shortly.", 500); }

  const mail = await notifyOwner(`New wholesale lead: ${row.company_name} (${row.country})`, {
    Company: row.company_name, Email: row.email, Country: row.country, Category: row.product_category, Quantity: row.estimated_quantity, Message: row.message,
  });
  console.log("wholesale lead saved; email notification:", mail);
  return NextResponse.json({ ok: true });
}
