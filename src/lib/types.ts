export type Category = { slug: string; name: string; description: string; sort_order: number };
export type Product = {
  id?: string;
  slug: string;
  name: string;
  category_slug: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  featured: boolean;
  active?: boolean;
};
export type CartLine = { slug: string; name: string; price: number; image_url: string; category_slug: string; quantity: number };
