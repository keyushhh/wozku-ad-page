export function Footer() {
  return (
    <footer className="border-t border-hairline bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
              W
            </span>
            <span className="font-display text-lg font-bold tracking-[-0.04em] text-ink">
              Wozku
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-secondary">
            Advocacy → Activation → Engagement → Pipeline → Revenue → ROI. Built
            for teams who need every share attributed and every outcome
            measurable.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <a
            href="#roi"
            className="text-sm font-medium text-secondary transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald"
          >
            ROI calculator
          </a>
          <a
            href="#case-studies"
            className="text-sm font-medium text-secondary transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald"
          >
            Case studies
          </a>
          <a
            href="#testimonials"
            className="text-sm font-medium text-secondary transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald"
          >
            Testimonials
          </a>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="border-t border-hairline pt-6 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          © {new Date().getFullYear()} Wozku. Demo content for preview purposes.
        </p>
      </div>
    </footer>
  );
}
