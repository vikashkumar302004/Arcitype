"use client";

import { Flag, Gauge, Ghost, Rocket } from "@phosphor-icons/react";
import { motion } from "motion/react";

interface GhostRacerProps {
  currentProgress: number; // 0 to 1
  currentWpm: number;
  ghostProgress?: number; // 0 to 1
  ghostTargetWpm?: number;
  ghostTitle?: string;
  isVisible: boolean;
}

export function GhostRacer({
  currentProgress,
  currentWpm,
  ghostProgress = 0,
  ghostTargetWpm = 80,
  ghostTitle = "Ghost (80 WPM)",
  isVisible,
}: GhostRacerProps) {
  if (!isVisible) return null;

  const userPct = Math.min(100, Math.max(0, currentProgress * 100));
  const ghostPct = Math.min(100, Math.max(0, ghostProgress * 100));

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex w-full flex-col gap-2 rounded-xl border border-border/40 bg-foreground/[0.02] p-3 text-xs backdrop-blur-sm"
      initial={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <Rocket className="text-primary" size={14} weight="duotone" />
          <span>You: <strong className="text-primary font-mono">{currentWpm} WPM</strong></span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <Ghost className="text-purple-400" size={14} weight="duotone" />
          <span>{ghostTitle}</span>
        </div>
      </div>

      {/* Race Track */}
      <div className="relative h-4 w-full rounded-full bg-foreground/10 px-1 py-0.5">
        {/* User bar */}
        <motion.div
          animate={{ width: `${userPct}%` }}
          className="absolute bottom-1 top-1 left-1 rounded-full bg-gradient-to-r from-primary/80 to-primary"
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
        {/* User icon */}
        <motion.div
          animate={{ left: `calc(${userPct}% - 10px)` }}
          className="absolute top-1/2 -translate-y-1/2 text-primary font-bold"
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Rocket size={12} weight="fill" />
        </motion.div>

        {/* Ghost icon marker */}
        <motion.div
          animate={{ left: `calc(${ghostPct}% - 10px)` }}
          className="absolute top-1/2 -translate-y-1/2 text-purple-400"
          transition={{ duration: 0.3, ease: "linear" }}
        >
          <Ghost size={12} weight="fill" />
        </motion.div>
      </div>
    </motion.div>
  );
}
