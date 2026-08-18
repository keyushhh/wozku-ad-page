import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  DEFAULT_ROI_INPUTS,
  calculateROI,
  type ROIInputs,
} from "../../utils/roiCalculator";
import { formatCompact, formatCurrency, formatPercent } from "../../utils/format";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { RangeField } from "../ui/RangeField";
import { SectionHeading } from "../ui/SectionHeading";

function ROIResultsPanel({ results }: { results: ReturnType<typeof calculateROI> }) {
  const prefersReducedMotion = useReducedMotion();

  const cards = [
    {
      label: "Estimated reach",
      value: results.estimatedReach,
      format: (v: number) => formatCompact(v),
    },
    {
      label: "Engagements",
      value: results.engagements,
      format: (v: number) => formatCompact(v),
    },
    {
      label: "Opportunities",
      value: results.opportunities,
      format: (v: number) => formatCompact(v),
    },
    {
      label: "Influenced revenue",
      value: results.influencedRevenue,
      format: (v: number) => formatCurrency(v, true),
      highlight: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <motion.div
            key={card.label}
            layout={!prefersReducedMotion}
            className={`rounded-2xl border p-4 sm:p-5 ${
              card.highlight
                ? "border-emerald/25 bg-tint"
                : "border-hairline bg-canvas"
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              {card.label}
            </p>
            <p
              className={`mt-2 font-display text-2xl font-bold tracking-[-0.04em] sm:text-3xl ${
                card.highlight ? "text-emerald-dark" : "text-ink"
              }`}
            >
              <AnimatedNumber value={card.value} format={card.format} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-ink bg-ink p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/60">
              Modeled ROI
            </p>
            <p className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
              <AnimatedNumber
                value={results.roi}
                format={(v) => formatPercent(v)}
              />
            </p>
          </div>
          <div className="sm:text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/60">
              Net return
            </p>
            <p className="mt-2 font-display text-2xl font-bold tracking-[-0.04em]">
              <AnimatedNumber
                value={results.netReturn}
                format={(v) => formatCurrency(v, true)}
              />
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-white/65">
          Demo model only. Adjust inputs to explore conservative and aggressive
          scenarios before replacing assumptions with your program data.
        </p>
      </div>
    </div>
  );
}

export function ROICalculator() {
  const [inputs, setInputs] = useState<ROIInputs>(DEFAULT_ROI_INPUTS);

  const results = useMemo(() => calculateROI(inputs), [inputs]);

  const update = <K extends keyof ROIInputs>(key: K, value: ROIInputs[K]) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  return (
    <section id="roi" className="border-y border-hairline bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="ROI calculator"
          title="See the business case before you launch"
          description="Model how advocate reach, engagement, and conversion translate into influenced pipeline and return on program investment."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          <div className="rounded-3xl border border-hairline bg-canvas p-5 sm:p-7">
            <h3 className="font-display text-lg font-bold tracking-[-0.03em] text-ink">
              Program inputs
            </h3>
            <p className="mt-2 text-sm text-secondary">
              Drag the sliders to match your advocate network and funnel
              assumptions.
            </p>

            <div className="mt-7 space-y-6">
              <RangeField
                label="Advocates activated"
                value={inputs.advocates}
                min={25}
                max={2000}
                step={25}
                onChange={(value) => update("advocates", value)}
              />
              <RangeField
                label="Shares per advocate"
                value={inputs.sharesPerAdvocate}
                min={1}
                max={12}
                onChange={(value) => update("sharesPerAdvocate", value)}
              />
              <RangeField
                label="Reach per share"
                value={inputs.reachPerShare}
                min={250}
                max={5000}
                step={50}
                onChange={(value) => update("reachPerShare", value)}
              />
              <RangeField
                label="Engagement rate"
                value={inputs.engagementRate}
                min={1}
                max={12}
                step={0.1}
                formatValue={(value) => formatPercent(value, 1)}
                onChange={(value) => update("engagementRate", value)}
              />
              <RangeField
                label="Conversion rate"
                value={inputs.conversionRate}
                min={0.5}
                max={8}
                step={0.1}
                formatValue={(value) => formatPercent(value, 1)}
                onChange={(value) => update("conversionRate", value)}
              />
              <RangeField
                label="Average deal value"
                value={inputs.averageDealValue}
                min={2500}
                max={100000}
                step={500}
                formatValue={(value) => formatCurrency(value)}
                onChange={(value) => update("averageDealValue", value)}
              />
              <RangeField
                label="Program investment"
                value={inputs.programInvestment}
                min={5000}
                max={250000}
                step={1000}
                formatValue={(value) => formatCurrency(value)}
                onChange={(value) => update("programInvestment", value)}
              />
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-bold tracking-[-0.03em] text-ink">
                Projected outcomes
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                {results.totalShares.toLocaleString("en-US")} total shares
              </p>
            </div>
            <ROIResultsPanel results={results} />
          </div>
        </div>
      </div>
    </section>
  );
}
