"use client";

import { Brain, Lightning, Sparkle, Target, Trophy } from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { ResultStats } from "@/lib/types";

interface AIDiagnosticsProps {
  onPracticeWeakKeys?: (weakKeys: string[]) => void;
  stats: ResultStats;
}

export function AIDiagnostics({ stats, onPracticeWeakKeys }: AIDiagnosticsProps) {
  const { wpm, accuracy, consistency, keyErrors = {}, keyHits = {}, raw } = stats;

  // Grade calculation
  const getGrade = () => {
    if (wpm >= 100 && accuracy >= 98) return { letter: "S+", title: "Grandmaster", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" };
    if (wpm >= 80 && accuracy >= 96) return { letter: "S", title: "Pro Typist", color: "text-purple-400 border-purple-400/30 bg-purple-400/10" };
    if (wpm >= 60 && accuracy >= 94) return { letter: "A", title: "Advanced", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" };
    if (wpm >= 40 && accuracy >= 90) return { letter: "B", title: "Intermediate", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" };
    return { letter: "C", title: "Developing", color: "text-rose-400 border-rose-400/30 bg-rose-400/10" };
  };

  const grade = getGrade();

  // Calculate top weak keys
  const weakKeysList = Object.entries(keyErrors)
    .map(([char, count]) => {
      const hits = keyHits[char] || count;
      const rate = Math.round((count / Math.max(hits, 1)) * 100);
      return { char, count, rate };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Generate Smart AI Insights
  const getInsight = () => {
    if (accuracy < 92) {
      return "Focus on rhythm over speed. Slow down by 10% to eliminate corrections—this will naturally boost your net WPM!";
    }
    if (raw - wpm > 15) {
      return `Your raw speed is high (${raw} WPM), but mistyped keys are holding back your net speed. Try light-touch keypresses.`;
    }
    if (consistency < 70) {
      return "Your typing speed fluctuates. Aim for a steady metronome pace across long sentences to improve flow.";
    }
    if (weakKeysList.length > 0) {
      const keysStr = weakKeysList.map((k) => `'${k.char}'`).join(", ");
      return `Key bottleneck detected on ${keysStr}. Practice targeted drills to master these reach zones.`;
    }
    return "Exceptional performance! High speed paired with tight accuracy. Challenge yourself with harder vocabulary or timed tests!";
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/60 p-5 backdrop-blur-md md:p-6"
      initial={{ opacity: 0, y: 16 }}
      transition={{ delay: 0.65, duration: 0.5 }}
    >
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        {/* Left section: Header & Grade */}
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border font-bold font-mono text-2xl ${grade.color}`}>
            {grade.letter}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Brain className="text-primary" size={18} weight="duotone" />
              <h3 className="font-semibold text-base text-foreground tracking-tight">AI Performance Diagnostics</h3>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                Pro Insight
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{grade.title} Typist · {getInsight()}</p>
          </div>
        </div>

        {/* Right section: Weak Keys & Action */}
        <div className="flex flex-wrap items-center gap-3">
          {weakKeysList.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground font-medium">Weak Keys:</span>
              <div className="flex items-center gap-1">
                {weakKeysList.map((k) => (
                  <span
                    className="flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-rose-400"
                    key={k.char}
                  >
                    {k.char === " " ? "Space" : k.char}
                    <span className="text-[9px] text-rose-300/70">x{k.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {onPracticeWeakKeys && weakKeysList.length > 0 && (
            <motion.button
              className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 font-medium text-xs text-primary-foreground shadow-sm transition-all hover:opacity-90"
              onClick={() => onPracticeWeakKeys(weakKeysList.map((k) => k.char))}
              type="button"
              whileTap={{ scale: 0.95 }}
            >
              <Target size={14} weight="bold" />
              Practice Weak Keys
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
