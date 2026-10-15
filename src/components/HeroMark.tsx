import { Monogram } from "./Logo";

/** The ring around the monogram is "stitched" on as the page loads. CSS only. */
export function HeroMark() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(184,151,90,.22), transparent 72%)" }} />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <defs>
          <mask id="stitch-reveal">
            <circle cx="200" cy="200" r="188" stroke="#fff" strokeWidth="16" pathLength="1" className="mask-draw" transform="rotate(-90 200 200)" />
          </mask>
        </defs>
        <g mask="url(#stitch-reveal)">
          <circle cx="200" cy="200" r="188" stroke="#d9bf86" strokeWidth="2.4" strokeDasharray="9 8" />
          <circle cx="200" cy="200" r="172" stroke="#b8975a" strokeOpacity=".5" strokeWidth="1" />
        </g>
      </svg>
      <div className="absolute inset-[13%]">
        <Monogram className="h-full w-full" animate title="SA SPORTS" />
      </div>
    </div>
  );
}
