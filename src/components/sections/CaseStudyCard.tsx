import type { CaseStudy } from "../../data/caseStudies";

interface CaseStudyCardProps {
  study: CaseStudy;
}

export function CaseStudyCard({ study }: CaseStudyCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-hairline bg-white p-6 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-emerald/25 hover:shadow-[0_18px_40px_-24px_rgba(16,185,129,0.35)] sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-sm font-semibold text-ink">
          {study.company}
        </span>
        <span className="rounded-full bg-canvas px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          {study.industry}
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-bold leading-tight tracking-[-0.03em] text-ink sm:text-2xl">
        {study.headline}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-secondary">
        {study.summary}
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-hairline pt-5">
        {study.metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              {metric.label}
            </dt>
            <dd className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-ink">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-5 flex flex-wrap gap-2">
        {study.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-tint px-2.5 py-1 text-[11px] font-medium text-emerald-dark"
          >
            {tag}
          </li>
        ))}
      </ul>
    </article>
  );
}
