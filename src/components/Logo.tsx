import { useId } from "react";

/** SA monogram: an S threaded through an A inside a double ring. Pure SVG, no image file. */
export function Monogram({ className = "", animate = false, title = "SA SPORTS monogram" }: { className?: string; animate?: boolean; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title} fill="none">
      <defs>
        <linearGradient id={`g${id}`} x1="10" y1="5" x2="90" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f3e3b5" />
          <stop offset=".45" stopColor="#c9a566" />
          <stop offset="1" stopColor="#8a6d3b" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="47" stroke={`url(#g${id})`} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="43" stroke="#b8975a" strokeOpacity=".55" strokeWidth=".7" strokeDasharray="1.8 2.2" className={animate ? "ring-spin" : ""} />
      {/* A */}
      <path d="M27 79 L50 20 L73 79 M36 60 H64" stroke="#f3ecdc" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" className={animate ? "draw-in" : ""} />
      {/* S: dark underlay first so it appears to weave through the A */}
      <path d="M63 33 C63 21 37 21 37 36 C37 50 63 50 63 65 C63 80 36 80 36 67" stroke="#0a0908" strokeWidth="9" strokeLinecap="round" />
      <path d="M63 33 C63 21 37 21 37 36 C37 50 63 50 63 65 C63 80 36 80 36 67" stroke={`url(#g${id})`} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display leading-none tracking-[0.32em] ${className}`} style={{ fontWeight: 600 }}>
      SA SPORTS
    </span>
  );
}
