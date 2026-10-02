"use client";

/** Premium Arcitype Logo — Sleek glowing mechanical switch keycap icon with 'A' monogram */
export function ArcitypeLogo({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
    >
      <defs>
        <linearGradient id="arc-key-grad" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.75" />
        </linearGradient>
        <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="var(--primary)" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer base plate */}
      <rect
        height="28"
        rx="6"
        style={{ fill: "var(--background)", stroke: "var(--border)", strokeWidth: 1.5 }}
        width="28"
        x="2"
        y="2"
      />

      {/* Mechanical switch keycap body */}
      <rect
        filter="url(#arc-glow)"
        height="22"
        rx="4.5"
        style={{ fill: "url(#arc-key-grad)" }}
        width="22"
        x="5"
        y="5"
      />

      {/* Top bevel highlight */}
      <rect
        fill="white"
        fillOpacity="0.25"
        height="4"
        rx="2"
        width="18"
        x="7"
        y="6.5"
      />

      {/* Center 'A' Monogram */}
      <path
        d="M16 10L11 21M16 10L21 21M12.5 17H19.5"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export const KeynoteLogo = ArcitypeLogo;
export const KeythmLogo = ArcitypeLogo;
