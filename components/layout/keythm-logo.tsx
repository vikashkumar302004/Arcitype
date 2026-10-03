"use client";

/** Premium Arcitype Logo — Golden Sparkle App Icon */
export function ArcitypeLogo({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-md transition-transform hover:scale-105 ${className || ""}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Arcitype Logo"
        className="h-full w-full object-cover rounded-xl"
        src="/logo.png"
      />
    </div>
  );
}

export const KeynoteLogo = ArcitypeLogo;
export const KeythmLogo = ArcitypeLogo;
