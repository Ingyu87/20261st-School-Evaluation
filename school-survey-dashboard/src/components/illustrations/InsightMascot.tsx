import { BRAND_COLORS } from "../../utils/colors";

interface InsightMascotProps {
  index: number;
}

export function InsightMascot({ index }: InsightMascotProps) {
  const color = BRAND_COLORS[index % BRAND_COLORS.length];
  const isDark = index % BRAND_COLORS.length === 0 || index % BRAND_COLORS.length === 1;

  return (
    <svg viewBox="0 0 64 64" width="48" height="48" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill={color} />
      <circle cx="24" cy="28" r="4" fill={isDark ? "#fff" : "#0a0a0a"} />
      <circle cx="40" cy="28" r="4" fill={isDark ? "#fff" : "#0a0a0a"} />
      <path
        d="M22 40 Q32 48 42 40"
        stroke={isDark ? "#fff" : "#0a0a0a"}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
