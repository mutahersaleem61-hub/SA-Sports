import { ProductArt } from "./ProductArt";

export function ProductImage({ src, category, alt, className = "" }: { src?: string; category: string; alt: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" decoding="async" className={`h-full w-full object-cover ${className}`} />;
  }
  return <ProductArt category={category} className={`h-full w-full ${className}`} />;
}
