import { sponsors } from "../../data/sponsors";

export function Sponsors() {
  const marqueeItems = [...sponsors, ...sponsors];

  return (
    <section
      aria-label="Trusted by demo organizations"
      className="border-y border-hairline bg-white py-10 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
          Demo organizations using advocate-led distribution
        </p>

        <div className="relative mt-6 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24"
          />

          <ul className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 px-4 motion-reduce:animate-none sm:gap-14">
            {marqueeItems.map((sponsor, index) => (
              <li
                key={`${sponsor.id}-${index}`}
                className="flex shrink-0 items-center gap-2 text-secondary"
              >
                <span
                  aria-hidden
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-canvas font-display text-xs font-bold text-ink"
                >
                  {sponsor.name.slice(0, 1)}
                </span>
                <span className="whitespace-nowrap font-display text-sm font-semibold tracking-[-0.02em] text-secondary/90">
                  {sponsor.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
