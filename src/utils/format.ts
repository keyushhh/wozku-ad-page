export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${trimTrailingZero(value / 1_000_000_000)}B`;
  }
  if (abs >= 1_000_000) {
    return `${trimTrailingZero(value / 1_000_000)}M`;
  }
  if (abs >= 10_000) {
    return `${trimTrailingZero(value / 1_000)}K`;
  }
  return Math.round(value).toLocaleString("en-US");
}

function trimTrailingZero(num: number): string {
  const fixed = num.toFixed(1);
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    return `$${formatCompact(value)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
