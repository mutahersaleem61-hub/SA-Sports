import type { Metadata } from "next";
import { getCatalog } from "@/lib/data";
import { ContactForm } from "@/components/InquiryForms";

export const revalidate = 60;
export const metadata: Metadata = { title: "Custom leather work" };

export default async function Custom() {
  const { categories } = await getCatalog();
  const def = categories.find((c) => c.slug === "custom")?.name;
  return (
    <div className="container-x grid gap-14 py-12 sm:py-20 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <h1 className="text-5xl sm:text-6xl">Made to your brief</h1>
        <p className="mt-6 max-w-md text-lg text-ivory-dim">Jackets in your team colours, gloves with your club logo, a bag cut to a size you cannot find in a shop. Describe what you need and we will come back with options, a timeline and a price before any work begins.</p>
        <p className="mt-6 max-w-md text-ivory-dim">Useful to include: product type, quantity, leather type and colour, sizes, logo or embossing, and the date you need it by.</p>
      </div>
      <ContactForm categories={categories} defaultCategory={def} messageLabel="Your project" placeholder="What would you like us to make?" />
    </div>
  );
}
