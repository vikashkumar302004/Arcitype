"use client";

import { Flame, Lightning, Sparkle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

interface ComboStreakProps {
  streak: number;
}

export function ComboStreak({ streak }: ComboStreakProps) {
  if (streak < 10) return null;

  const isSuper = streak >= 50;
  const isHigh = streak >= 25;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="pointer-events-none mb-2 flex items-center justify-center"
        exit={{ scale: 0.8, opacity: 0 }}
        initial={{ scale: 0.7, opacity: 0, y: 10 }}
        key={Math.floor(streak / 5)}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-md border backdrop-blur-md ${
            isSuper
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/10"
              : isHigh
              ? "bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-purple-500/10"
              : "bg-primary/20 text-primary border-primary/30"
          }`}
        >
          {isSuper ? (
            <Lightning className="animate-pulse text-amber-400" size={14} weight="fill" />
          ) : isHigh ? (
            <Flame className="animate-bounce text-purple-400" size={14} weight="fill" />
          ) : (
            <Sparkle className="text-primary" size={14} weight="fill" />
          )}

          <span className="font-mono text-sm tracking-tight">{streak}x STREAK</span>
          {isSuper && <span className="text-[10px] uppercase tracking-widest text-amber-300 font-extrabold">FLAWLESS!</span>}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
