export const BRAND_COLORS = [
  "var(--color-brand-pink)",
  "var(--color-brand-teal)",
  "var(--color-brand-lavender)",
  "var(--color-brand-peach)",
  "var(--color-brand-ochre)",
  "var(--color-surface-card)",
] as const;

export const LIKERT_COLORS: Record<string, string> = {
  "매우 그렇다": "var(--color-brand-teal)",
  "그렇다": "var(--color-brand-mint)",
  "보통이다": "var(--color-brand-ochre)",
  "그렇지 않다": "var(--color-brand-coral)",
  "전혀 그렇지 않다": "var(--color-brand-pink)",
};

export function getLikertColor(label: string, index = 0): string {
  return LIKERT_COLORS[label] ?? BRAND_COLORS[index % BRAND_COLORS.length];
}
