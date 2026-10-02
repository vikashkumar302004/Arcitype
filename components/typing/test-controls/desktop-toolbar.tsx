"use client";

import { At, Globe, Hash, TextAa } from "@phosphor-icons/react";
import { LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";
import {
  groupClass,
  MODES,
  Selector,
  Sep,
  SubOptionStack,
  Toggle,
} from "./primitives";
import type { TestControlsProps } from "./test-controls";

/** Desktop inline three-group toolbar. */
export function DesktopToolbar({
  mode,
  timeOption,
  wordOption,
  quoteLength,
  punctuation,
  numbers,
  difficulty,
  language,
  onModeChange,
  onTimeOptionChange,
  onWordOptionChange,
  onQuoteLengthChange,
  onPunctuationToggle,
  onNumbersToggle,
  onDifficultyToggle,
  onOpenLanguageModal,
  onOpenFontModal,
}: TestControlsProps) {
  return (
    <LayoutGroup id="toolbar">
      <div className="flex w-full max-w-5xl items-center justify-between gap-3 rounded-2xl border border-foreground/[0.08] bg-card/60 p-2 px-3 md:px-4 backdrop-blur-md shadow-sm">
        {/* Group 1: Toggles */}
        <div className="flex items-center gap-1">
          <Toggle active={false} onClick={onOpenLanguageModal}>
            <Globe size={13} weight="duotone" />
            <span className="capitalize">{language}</span>
          </Toggle>
          <Sep />
          <Toggle active={punctuation} onClick={onPunctuationToggle}>
            <At size={13} weight="duotone" />
            punctuation
          </Toggle>
          <Toggle active={numbers} onClick={onNumbersToggle}>
            <Hash size={13} weight="duotone" />
            numbers
          </Toggle>
          <Sep />
          <Toggle
            active={difficulty === "easy"}
            onClick={() => onDifficultyToggle("easy")}
          >
            easy
          </Toggle>
          <Toggle
            active={difficulty === "hard"}
            onClick={() => onDifficultyToggle("hard")}
          >
            hard
          </Toggle>
        </div>

        {/* Group 2: Mode selector */}
        <div className="flex items-center gap-1">
          {MODES.map(({ value, icon: Icon, label }) => (
            <Selector
              active={mode === value}
              key={value}
              layoutId="mode"
              onClick={() => onModeChange(value)}
            >
              <Icon size={13} />
              {label}
            </Selector>
          ))}
        </div>

        {/* Group 3: Sub-options */}
        <div
          className={cn(
            "relative grid min-w-[130px] justify-end transition-opacity duration-200 [&>*]:col-start-1 [&>*]:row-start-1",
            mode === "zen" && "pointer-events-none opacity-0"
          )}
        >
          <SubOptionStack
            mode={mode}
            onQuoteLengthChange={onQuoteLengthChange}
            onTimeOptionChange={onTimeOptionChange}
            onWordOptionChange={onWordOptionChange}
            quoteLength={quoteLength}
            timeOption={timeOption}
            wordOption={wordOption}
          />
        </div>
      </div>
    </LayoutGroup>
  );
}
