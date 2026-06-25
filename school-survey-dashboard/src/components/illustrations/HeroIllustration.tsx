export function HeroIllustration() {
  return (
    <svg viewBox="0 0 400 280" width="100%" height="auto" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#faf5e8" />
          <stop offset="100%" stopColor="#fffaf0" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#sky)" rx="16" />
      {/* Mountains */}
      <path d="M0 200 L80 120 L160 180 L240 100 L320 160 L400 80 L400 280 L0 280 Z" fill="#e8b94a" opacity="0.5" />
      <path d="M0 220 L100 150 L200 200 L300 130 L400 170 L400 280 L0 280 Z" fill="#ffb084" opacity="0.6" />
      <path d="M0 240 L120 180 L220 220 L340 160 L400 200 L400 280 L0 280 Z" fill="#b8a4ed" opacity="0.5" />
      {/* School building - clay style */}
      <rect x="140" y="100" width="120" height="90" rx="12" fill="#1a3a3a" />
      <rect x="155" y="115" width="30" height="25" rx="6" fill="#a4d4c5" />
      <rect x="185" y="115" width="30" height="25" rx="6" fill="#a4d4c5" />
      <rect x="215" y="115" width="30" height="25" rx="6" fill="#a4d4c5" />
      <path d="M130 100 L200 60 L270 100 Z" fill="#ff4d8b" />
      {/* Children */}
      <circle cx="100" cy="200" r="18" fill="#ffb084" />
      <rect x="88" y="215" width="24" height="30" rx="8" fill="#ff4d8b" />
      <circle cx="300" cy="195" r="16" fill="#b8a4ed" />
      <rect x="290" y="208" width="20" height="28" rx="8" fill="#1a3a3a" />
      {/* Book */}
      <rect x="175" y="205" width="50" height="35" rx="6" fill="#e8b94a" />
      <line x1="200" y1="205" x2="200" y2="240" stroke="#1a3a3a" strokeWidth="2" />
    </svg>
  );
}
