import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "SA SPORTS | Premium leather goods and boxing equipment", template: "%s | SA SPORTS" },
  description: "Leather jackets, hides, belts, boots, bags, boxing gloves and custom leather products. Retail and wholesale, shipped internationally.",
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#0a0908" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
