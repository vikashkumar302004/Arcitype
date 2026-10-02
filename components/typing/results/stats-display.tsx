"use client";

import { AnimatedNumber } from "@/components/ui/animated-number";

export function KeyStat({
  label,
  value,
  suffix,
  animated,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  animated?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-bold font-mono text-2xl text-foreground">
        {animated && typeof value === "number" ? (
          <AnimatedNumber suffix={suffix} value={value} />
        ) : (
          value
        )}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

export function DetailStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <span
        className={`font-medium font-mono text-xs ${accent ? "text-primary" : "text-muted-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

import type { ResultStats } from "@/lib/types";

export function MonkeytypeAnalysisBar({ stats }: { stats: ResultStats }) {
  const {
    raw,
    consistency,
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    elapsedSeconds,
    accuracy,
    mode,
    modeDetail,
    language = "english",
  } = stats;

  const padZero = (n: number) => String(n).padStart(2, "0");
  const hours = padZero(Math.floor(elapsedSeconds / 3600));
  const mins = padZero(Math.floor((elapsedSeconds % 3600) / 60));
  const secs = padZero(elapsedSeconds % 60);
  const formattedSessionTime = `${hours}:${mins}:${secs} session`;

  const isInvalidAccuracy = accuracy < 25;
  const otherValue = isInvalidAccuracy ? "invalid (accuracy)" : "none";

  return (
    <div className="w-full rounded-2xl border border-foreground/[0.08] bg-card/40 p-4 md:p-6 backdrop-blur-md shadow-sm">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 font-mono text-left">
        {/* 1. test type */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground/60">test type</span>
          <span className="text-sm font-semibold text-primary truncate capitalize">
            {mode} {modeDetail}
          </span>
          <span className="text-[11px] text-muted-foreground/50 capitalize">
            {language}
          </span>
        </div>

        {/* 2. other */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground/60">other</span>
          <span
            className={`text-sm font-semibold ${isInvalidAccuracy ? "text-amber-500" : "text-muted-foreground/80"}`}
          >
            {otherValue}
          </span>
        </div>

        {/* 3. raw */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground/60">raw</span>
          <span className="text-xl sm:text-2xl font-bold text-primary">
            {raw}
          </span>
        </div>

        {/* 4. characters */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground/60">characters</span>
          <span className="text-sm sm:text-base font-bold text-primary tracking-tight">
            {correctChars}/{incorrectChars}/{extraChars}/{missedChars}
          </span>
        </div>

        {/* 5. consistency */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground/60">consistency</span>
          <span className="text-xl sm:text-2xl font-bold text-primary">
            {consistency}%
          </span>
        </div>

        {/* 6. time */}
        <div className="flex flex-col gap-1 border-l-0 md:border-l md:border-foreground/10 md:pl-4">
          <span className="text-[11px] text-muted-foreground/60">time</span>
          <span className="text-xl sm:text-2xl font-bold text-primary">
            {elapsedSeconds}s
          </span>
          <span className="text-[10px] text-muted-foreground/40 font-mono">
            {formattedSessionTime}
          </span>
        </div>
      </div>
    </div>
  );
}
