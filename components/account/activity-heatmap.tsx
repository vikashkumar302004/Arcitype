"use client";

import { Flame, Trophy, CalendarCheck, Sparkle } from "@phosphor-icons/react";
import { useMemo } from "react";
import type { TestResultRecord } from "@/lib/user-stats";

interface ActivityHeatmapProps {
  history: TestResultRecord[];
  currentStreak: number;
  maxStreak: number;
}

export function ActivityHeatmap({
  history,
  currentStreak,
  maxStreak,
}: ActivityHeatmapProps) {
  // Compute daily counts map and 52-week activity grid
  const { weeks, totalActiveDays, totalTestsThisYear } = useMemo(() => {
    const countsMap = new Map<string, number>();
    for (const item of history || []) {
      const d = new Date(item.timestamp);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      countsMap.set(dateStr, (countsMap.get(dateStr) || 0) + 1);
    }

    const today = new Date();
    // Build 52 weeks ending today (364 days ago to today)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 52 * 7 + 1);

    const generatedWeeks: Array<
      Array<{ dateStr: string; count: number; dayName: string; isToday: boolean }>
    > = [];

    let currentWeek: Array<{
      dateStr: string;
      count: number;
      dayName: string;
      isToday: boolean;
    }> = [];

    let activeDaysCount = 0;
    let testsCount = 0;

    const curr = new Date(startDate);
    while (curr <= today) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, "0");
      const dd = String(curr.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const count = countsMap.get(dateStr) || 0;

      if (count > 0) {
        activeDaysCount++;
        testsCount += count;
      }

      const dayName = curr.toLocaleDateString("en-US", { weekday: "short" });
      const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      currentWeek.push({ dateStr, count, dayName, isToday });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    return {
      weeks: generatedWeeks,
      totalActiveDays: activeDaysCount,
      totalTestsThisYear: testsCount,
    };
  }, [history]);

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="w-full rounded-3xl border border-border/80 bg-card/60 p-5 backdrop-blur-md shadow-sm font-mono">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkle size={18} className="text-emerald-400" />
            <span>LeetCode Style Activity & Streak Heatmap</span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {totalTestsThisYear} tests completed across {totalActiveDays} active days in the past year
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 font-bold text-orange-400">
            <Flame size={16} weight="fill" />
            <span>{currentStreak} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-bold text-amber-400">
            <Trophy size={16} weight="fill" />
            <span>Max {maxStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Overflow Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px] flex flex-col gap-1.5">
          {/* Heatmap Grid Matrix */}
          <div className="flex items-start gap-1">
            {weeks.map((week, wIdx) => (
              <div key={`w-${wIdx}`} className="flex flex-col gap-1">
                {week.map((day) => {
                  let bgClass = "bg-foreground/[0.04] border-foreground/[0.06]";
                  if (day.count >= 6) {
                    bgClass = "bg-emerald-400 border-emerald-300 shadow-xs shadow-emerald-500/50";
                  } else if (day.count >= 3) {
                    bgClass = "bg-emerald-500/70 border-emerald-500/80";
                  } else if (day.count >= 1) {
                    bgClass = "bg-emerald-500/35 border-emerald-500/40";
                  }

                  return (
                    <div
                      key={day.dateStr}
                      className={`h-3 w-3 rounded-[3px] border transition-transform hover:scale-125 cursor-pointer ${bgClass} ${
                        day.isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
                      }`}
                      title={`${day.count} tests on ${day.dateStr}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend Footer */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2">
            <span>Learn & practice daily to maintain your streak</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="h-2.5 w-2.5 rounded-[2px] bg-foreground/[0.04] border border-border" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-emerald-500/35 border border-emerald-500/40" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-emerald-500/70 border border-emerald-500/80" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-emerald-400 border border-emerald-300" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
