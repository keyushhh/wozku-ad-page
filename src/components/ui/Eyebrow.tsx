interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <p
      className={`inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-emerald-dark ${className}`}
    >
      <span aria-hidden className="inline-block h-px w-3.5 bg-emerald" />
      {children}
    </p>
  );
}
