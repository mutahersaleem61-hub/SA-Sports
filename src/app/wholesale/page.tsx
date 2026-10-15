import type { Metadata } from "next";
import { getCatalog } from "@/lib/data";
import { WholesaleForm } from "@/components/InquiryForms";

export const revalidate = 60;
export const metadata: Metadata = { title: "Wholesale" };

export default async function Wholesale() {
  const { categories } = await getCatalog();
  return (
    <div className="container-x grid gap-14 py-12 sm:py-20 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <h1 className="text-5xl sm:text-6xl">Wholesale and trade supply</h1>
        <p className="mt-6 max-w-md text-lg text-ivory-dim">We supply retailers, gyms, boxing clubs, workshops and brands with finished goods, hides and raw materials.</p>
        <ul className="mt-8 space-y-3 text-ivory-dim">
          <li>Tell us the products and rough quantities</li>
          <li>We reply with a quotation and lead times</li>
          <li>Private label and custom branding can be discussed</li>
        </ul>
      </div>
      <WholesaleForm categories={categories} />
    </div>
  );
}
