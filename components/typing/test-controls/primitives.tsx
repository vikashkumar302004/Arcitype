"use client";

import { Clock, Code, Mountains, Quotes, TextAa } from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { QuoteLength } from "@/lib/quotes";
import type { TestMode, TimeOption, WordOption } from "@/lib/test-storage";
import { cn } from "@/lib/utils";

export const MODES = [
  { value: "time", icon: Clock, label: "time" },
  { value: "words", icon: TextAa, label: "words" },
  { value: "quote", icon: Quotes, label: "quote" },
  { value: "code", icon: Code, label: "code" },
  { value: "zen", icon: Mountains, label: "zen" },
] as const;

export const pillEase = { duration: 0.2, ease: [0.23, 1, 0.32, 1] } as const;

export const groupClass =
  "flex items-center rounded-2xl border border-foreground/[0.08] bg-card/60 p-1.5 backdrop-blur-md shadow-sm";

/* ─── Toggle: independent on/off ─────────────────────────── */

export function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      className={cn(
        "flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium text-xs transition-all duration-150",
        active
          ? "bg-primary/15 text-primary shadow-xs border border-primary/20 font-semibold"
          : "text-muted-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground"
      )}
      onClick={onClick}
      type="button"
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}

/* ─── Selector: single-select with sliding pill ──────────── */

export function Selector({
  active,
  onClick,
  layoutId,
  children,
}: {
  active: boolean;
  onClick: () => void;
  layoutId: string;
  children: ReactNode;
}) {
  return (
    <motion.button
      className={cn(
        "relative z-10 flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-medium text-xs transition-colors duration-150",
        active
          ? "text-primary font-bold"
          : "text-muted-foreground/60 hover:text-foreground"
      )}
      onClick={onClick}
      type="button"
      whileTap={{ scale: 0.96 }}
    >
      {children}
      {active && (
        <motion.span
          className="absolute inset-0 -z-10 rounded-xl bg-primary/20 border border-primary/30 shadow-xs backdrop-blur-xs"
          layoutId={layoutId}
          transition={pillEase}
        />
      )}
    </motion.button>
  );
}

/* ─── Separator ──────────────────────────────────────────── */

export function Sep() {
  return <div className="mx-0.5 h-4 w-px bg-black/10 dark:bg-white/[0.06]" />;
}

/* ─── Sub-options ────────────────────────────────────────── */

export function SubOptions({
  mode,
  timeOption,
  wordOption,
  quoteLength,
  onTimeOptionChange,
  onWordOptionChange,
  onQuoteLengthChange,
}: {
  mode: TestMode;
  timeOption: TimeOption;
  wordOption: WordOption;
  quoteLength: QuoteLength;
  onTimeOptionChange: (next: TimeOption) => void;
  onWordOptionChange: (next: WordOption) => void;
  onQuoteLengthChange: (next: QuoteLength) => void;
}) {
  if (mode === "time") {
    return (
      <>
        {([15, 30, 60, 120] as const).map((t) => (
          <Selector
            active={timeOption === t}
            key={t}
            layoutId="sub-time"
            onClick={() => onTimeOptionChange(t)}
          >
            {t}
          </Selector>
        ))}
      </>
    );
  }

  if (mode === "words") {
    return (
      <>
        {([10, 25, 50, 100] as const).map((w) => (
          <Selector
            active={wordOption === w}
            key={w}
            layoutId="sub-words"
            onClick={() => onWordOptionChange(w)}
          >
            {w}
          </Selector>
        ))}
      </>
    );
  }

  if (mode === "quote") {
    return (
      <>
        {(["short", "medium", "long"] as const).map((q) => (
          <Selector
            active={quoteLength === q}
            key={q}
            layoutId="sub-quote"
            onClick={() => onQuoteLengthChange(q)}
          >
            {q}
          </Selector>
        ))}
      </>
    );
  }

  return null;
}

/* ─── Shared sub-option stack ────────────────────────────── */

export function SubOptionStack({
  mode,
  timeOption,
  wordOption,
  quoteLength,
  onTimeOptionChange,
  onWordOptionChange,
  onQuoteLengthChange,
}: {
  mode: TestMode;
  timeOption: TimeOption;
  wordOption: WordOption;
  quoteLength: QuoteLength;
  onTimeOptionChange: (next: TimeOption) => void;
  onWordOptionChange: (next: WordOption) => void;
  onQuoteLengthChange: (next: QuoteLength) => void;
}) {
  return (
    <>
      {(["time", "words", "quote", "code", "zen"] as const).map((m) => {
        const isActive = mode === m;
        return (
          <div
            aria-hidden={!isActive}
            className={cn(
              "flex items-center gap-0.5 transition-[opacity,filter] duration-150",
              isActive
                ? "opacity-100"
                : "pointer-events-none opacity-0 hidden"
            )}
            key={m}
          >
            {m === "zen" ? (
              <span className="px-4 py-1.5 text-[10px] text-muted-foreground/20 italic tracking-widest">
                free flow
              </span>
            ) : m === "code" ? (
              <span className="px-4 py-1.5 text-[10px] text-primary/80 italic tracking-widest font-mono">
                dev syntax
              </span>
            ) : (
              <SubOptions
                mode={m}
                onQuoteLengthChange={onQuoteLengthChange}
                onTimeOptionChange={onTimeOptionChange}
                onWordOptionChange={onWordOptionChange}
                quoteLength={quoteLength}
                timeOption={timeOption}
                wordOption={wordOption}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
