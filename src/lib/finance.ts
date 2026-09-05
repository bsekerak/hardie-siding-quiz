export const FINANCE_APR = 0.0999;
export const FINANCE_TERM_MONTHS = 120;

/** Standard amortizing payment. Returns 0 for a non-positive principal. */
export function monthlyPayment(
  principal: number,
  apr: number = FINANCE_APR,
  months: number = FINANCE_TERM_MONTHS,
): number {
  if (principal <= 0 || months <= 0) return 0;
  const rate = apr / 12;
  if (rate === 0) return principal / months;
  return (principal * rate) / (1 - (1 + rate) ** -months);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRange(low: number, high: number): string {
  return `${formatCurrency(low)} – ${formatCurrency(high)}`;
}

/** Rounds to a readable increment so estimates never imply false precision. */
export function roundTo(value: number, increment: number): number {
  if (increment <= 0) return Math.round(value);
  return Math.round(value / increment) * increment;
}
