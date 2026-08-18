interface AmbientBackgroundProps {
  className?: string;
}

export function AmbientBackground({ className = "" }: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-grid opacity-70" />
      <div className="animate-orb-top-left absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-emerald/[0.085] blur-3xl" />
      <div className="animate-orb-top-right absolute -right-16 top-24 h-[360px] w-[360px] rounded-full bg-emerald-light/[0.045] blur-3xl" />
      <div className="animate-orb-center absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald/[0.04] blur-3xl" />
    </div>
  );
}
