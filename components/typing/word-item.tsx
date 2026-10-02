"use client";

import { motion } from "motion/react";
import { memo } from "react";
import { cn } from "@/lib/utils";

import { useSettings, type CaretStyle } from "@/components/settings/settings-provider";

export interface WordItemProps {
  /** When true, the word fades nearly invisible (ghost mode for upcoming words). */
  dimmed?: boolean;
  /** Live `typed` for the active word; finalized input for past; "" for future. */
  displayInput: string;
  elemRef?: React.RefObject<HTMLDivElement | null>;
  /** True when a completed word was typed with any error → red underline. */
  hasError: boolean;
  isActive: boolean;
  isPast: boolean;
  word: string;
}

function getCaretClass(style: CaretStyle, position: "before" | "after") {
  const base = "typing-cursor absolute pointer-events-none transition-all";
  switch (style) {
    case "line":
      return cn(
        base,
        "top-0.5 h-[1.2em] w-0.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]",
        position === "before" ? "-left-px" : "-right-px"
      );
    case "block":
      return cn(
        base,
        "top-0.5 left-0 h-[1.2em] w-full rounded-xs bg-primary/30 border-b-2 border-primary shadow-[0_0_8px_var(--primary)]"
      );
    case "underline":
      return cn(
        base,
        "bottom-0 left-0 h-[2.5px] w-full rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"
      );
    case "outline":
      return cn(
        base,
        "top-0.5 left-0 h-[1.2em] w-full rounded-xs border-2 border-primary shadow-[0_0_8px_var(--primary)]"
      );
    case "off":
    default:
      return "";
  }
}

export const WordItem = memo(function WordItem({
  word,
  displayInput,
  isActive,
  isPast,
  hasError,
  elemRef,
  dimmed = false,
}: WordItemProps) {
  const { caretStyle, smoothCaret, blindMode } = useSettings();
  const cursorAtEnd = isActive && displayInput.length >= word.length;

  return (
    <div
      className={cn(
        "relative",
        isPast &&
          hasError &&
          !blindMode &&
          "after:absolute after:right-0 after:bottom-0 after:left-0 after:h-[2px] after:rounded-full after:bg-destructive/50"
      )}
      ref={isActive ? elemRef : undefined}
      style={dimmed ? { opacity: 0.05 } : undefined}
    >
      {word.split("").map((char, cIdx) => {
        let color = "text-muted-foreground/40";
        if ((isPast || isActive) && cIdx < displayInput.length) {
          if (blindMode) {
            color = "text-foreground";
          } else {
            color =
              displayInput[cIdx] === char
                ? "text-foreground"
                : "text-destructive";
          }
        }
        const isLastChar = cIdx === word.length - 1;

        return (
          <span className="relative inline-block" key={cIdx}>
            {isActive && caretStyle !== "off" && cIdx === displayInput.length && (
              <motion.span
                className={getCaretClass(caretStyle, "before")}
                layoutId={smoothCaret ? "cursor-active" : undefined}
                transition={
                  smoothCaret
                    ? { type: "spring", stiffness: 700, damping: 38, mass: 0.6 }
                    : { duration: 0 }
                }
              />
            )}
            {isActive && caretStyle !== "off" && isLastChar && cursorAtEnd && (
              <motion.span
                className={getCaretClass(caretStyle, "after")}
                layoutId={smoothCaret ? "cursor-active" : undefined}
                transition={
                  smoothCaret
                    ? { type: "spring", stiffness: 700, damping: 38, mass: 0.6 }
                    : { duration: 0 }
                }
              />
            )}
            <span className={cn("transition-colors duration-60", color)}>
              {char}
            </span>
          </span>
        );
      })}

      {(isActive || isPast) &&
        displayInput.length > word.length &&
        displayInput
          .slice(word.length)
          .split("")
          .map((char, eIdx) => (
            <span
              className={cn(
                blindMode ? "text-foreground/70" : "text-destructive/60"
              )}
              key={`extra-${eIdx}`}
            >
              {char}
            </span>
          ))}
    </div>
  );
});
