import type { Metadata } from "next";
import { getCatalog } from "@/lib/data";
import { ContactForm } from "@/components/InquiryForms";
import { SITE } from "@/lib/site";

export const revalidate = 60;
export const metadata: Metadata = { title: "Contact" };

export default async function Contact() {
  const { categories } = await getCatalog();
  return (
    <div className="container-x grid gap-14 py-12 sm:py-20 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <h1 className="text-5xl sm:text-6xl">Talk to us</h1>
        <p className="mt-6 max-w-md text-lg text-ivory-dim">Questions about sizing, materials, shipping to your country or an existing order: write to us and we will reply by email.</p>
        <dl className="mt-10 space-y-5 text-ivory-dim">
          <div><dt className="text-sm text-gold">Email</dt><dd><a className="hover:text-gold-light" href={`mailto:${SITE.email}`}>{SITE.email}</a></dd></div>
          <div><dt className="text-sm text-gold">Phone</dt><dd>{SITE.phone}</dd></div>
          <div><dt className="text-sm text-gold">Location</dt><dd>{SITE.address}</dd></div>
          <div><dt className="text-sm text-gold">Hours</dt><dd>{SITE.hours}</dd></div>
        </dl>
      </div>
      <ContactForm categories={categories} />
    </div>
  );
}
