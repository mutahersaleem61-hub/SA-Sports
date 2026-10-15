/**
 * Original, locally drawn product illustrations (no image downloads, no licensing issues).
 * They are placeholders: upload real photos from the admin dashboard and they replace these automatically.
 */
const art: Record<string, JSX.Element> = {
  jackets: (
    <>
      <path d="M140 108 L98 128 L66 252 L102 262 L122 192 V322 H278 V192 L298 262 L334 252 L302 128 L260 108 L232 138 L200 116 L168 138 Z" />
      <path d="M200 116 V322 M168 138 L182 190 M232 138 L218 190 M122 262 H278" />
    </>
  ),
  hides: (
    <>
      <path d="M86 152 C118 108 168 132 198 104 C240 92 284 120 312 152 C334 190 300 216 316 252 C326 292 280 302 256 286 C230 318 190 300 160 302 C120 312 92 272 100 236 C68 212 66 176 86 152 Z" />
      <path d="M92 210 C150 200 240 205 306 224" strokeDasharray="3 6" />
    </>
  ),
  belts: (
    <>
      <rect x="110" y="178" width="236" height="44" rx="4" />
      <rect x="50" y="160" width="62" height="80" rx="6" />
      <path d="M62 200 H100 M81 172 V228" />
      {[170, 210, 250, 290].map((x) => (<circle key={x} cx={x} cy="200" r="5" />))}
    </>
  ),
  footwear: (
    <>
      <path d="M148 84 H236 V206 C236 232 296 232 328 268 V306 H122 V268 Z" />
      <path d="M122 306 V324 H328 V306 M148 120 H236 M148 150 H236 M148 180 H236" />
    </>
  ),
  bags: (
    <>
      <path d="M148 150 C148 76 252 76 252 150" />
      <path d="M108 150 H292 L312 326 H88 Z" />
      <path d="M100 214 H300" />
      <rect x="184" y="198" width="32" height="34" rx="4" />
    </>
  ),
  "boxing-gloves": (
    <>
      <path d="M138 156 C136 92 262 88 272 160 C294 200 284 262 252 282 V334 H160 V282 C128 262 118 206 138 156 Z" />
      <path d="M272 172 C314 160 322 214 286 230 M160 304 H252 M178 130 C200 114 232 114 250 136" />
    </>
  ),
  "boxing-equipment": (
    <>
      <path d="M200 52 V104 M168 52 L186 108 M232 52 L214 108" />
      <rect x="148" y="108" width="104" height="226" rx="34" />
      <path d="M148 164 H252 M148 278 H252" />
    </>
  ),
  "boxes-accessories": (
    <>
      <rect x="96" y="204" width="208" height="112" rx="6" />
      <rect x="88" y="160" width="224" height="48" rx="6" />
      <rect x="184" y="196" width="32" height="24" rx="3" />
    </>
  ),
  custom: (
    <>
      <rect x="112" y="86" width="176" height="236" rx="26" />
      <circle cx="200" cy="124" r="13" />
      <path d="M150 190 H250 M150 220 H250 M150 250 H214" />
      <rect x="126" y="100" width="148" height="208" rx="18" strokeDasharray="3 6" />
    </>
  ),
};

export function ProductArt({ category, className = "" }: { category: string; className?: string }) {
  const glyph = art[category] ?? art.custom;
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Product illustration" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="pa-bg" cx="50%" cy="38%" r="75%">
          <stop offset="0" stopColor="#3a2c1d" />
          <stop offset=".55" stopColor="#1a140e" />
          <stop offset="1" stopColor="#0a0908" />
        </radialGradient>
        <linearGradient id="pa-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e3b5" />
          <stop offset="1" stopColor="#9a7a45" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#pa-bg)" />
      <rect x="14" y="14" width="372" height="372" fill="none" stroke="#b8975a" strokeOpacity=".4" strokeDasharray="4 6" />
      <g fill="none" stroke="url(#pa-gold)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">{glyph}</g>
    </svg>
  );
}
