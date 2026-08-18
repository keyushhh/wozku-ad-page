import { motion, useReducedMotion } from "framer-motion";
import { narrativeSteps } from "../../data/navigation";
import { AmbientBackground } from "../ui/AmbientBackground";
import { Eyebrow } from "../ui/Eyebrow";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const rise = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.55,
            delay,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          },
        };

  return (
    <section
      id="top"
      className="relative overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36"
    >
      <AmbientBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div {...rise(0.04)}>
            <Eyebrow className="justify-center">Brand advocacy platform</Eyebrow>
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="mt-4 font-display text-[2.35rem] font-bold leading-[0.98] tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl"
          >
            Turn trusted voices into{" "}
            <span className="text-emerald-dark">measurable pipeline</span>
          </motion.h1>

          <motion.p
            {...rise(0.14)}
            className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-secondary sm:text-base"
          >
            Wozku helps employees, partners, and customers share approved stories
            with confidence-then attributes every share back to reach, engagement,
            and revenue impact.
          </motion.p>

          <motion.div
            {...rise(0.2)}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a
              href="#roi"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald"
            >
              Model your ROI
            </a>
            <a
              href="#case-studies"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-white px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-emerald/30 hover:bg-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald"
            >
              View demo case studies
            </a>
          </motion.div>
        </div>

        <motion.div
          {...rise(0.28)}
          className="mx-auto mt-12 max-w-4xl overflow-x-auto pb-1 scrollbar-none"
        >
          <div className="flex min-w-max items-center justify-center gap-2 px-1 sm:min-w-0 sm:flex-wrap">
            {narrativeSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-hairline bg-white px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-secondary">
                  {step}
                </span>
                {index < narrativeSteps.length - 1 ? (
                  <span aria-hidden className="text-muted">
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          {...rise(0.34)}
          className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3"
        >
          {[
            {
              value: "8×",
              label: "Higher trust than paid brand posts (demo benchmark)",
            },
            {
              value: "<15 min",
              label: "Typical campaign setup for advocate programs",
            },
            {
              value: "100%",
              label: "Share-level attribution in the Wozku dashboard",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-hairline bg-white/80 p-5 text-left backdrop-blur-sm"
            >
              <p className="font-display text-3xl font-bold tracking-[-0.04em] text-ink">
                {item.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-secondary">
                {item.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
