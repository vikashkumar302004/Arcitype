"use client";

export interface TestResultRecord {
  id: string;
  timestamp: number;
  mode: string; // "time" | "words" | "quote" | "code"
  modeDetail: string; // "15", "30", "60", "120" | "10", "25", "50", "100" | "short", etc.
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  elapsedSeconds: number;
  language: string;
}

export interface UserStatsSummary {
  testsStarted: number;
  testsCompleted: number;
  totalTimeTypingSeconds: number;
  personalBests: {
    time: Record<string, { wpm: number; accuracy: number }>;
    words: Record<string, { wpm: number; accuracy: number }>;
  };
  history: TestResultRecord[];
}

const STATS_STORAGE_KEY = "kz-user-stats-history";
const TESTS_STARTED_KEY = "kz-tests-started-count";

export function getStoredUserStats(): UserStatsSummary {
  if (typeof window === "undefined") {
    return {
      testsStarted: 0,
      testsCompleted: 0,
      totalTimeTypingSeconds: 0,
      personalBests: { time: {}, words: {} },
      history: [],
    };
  }

  const rawStarted = localStorage.getItem(TESTS_STARTED_KEY);
  const testsStarted = rawStarted ? parseInt(rawStarted, 10) || 0 : 0;

  const rawHistory = localStorage.getItem(STATS_STORAGE_KEY);
  let history: TestResultRecord[] = [];
  if (rawHistory) {
    try {
      history = JSON.parse(rawHistory);
    } catch {
      history = [];
    }
  }

  const testsCompleted = history.length;
  const totalTimeTypingSeconds = history.reduce(
    (acc, item) => acc + (item.elapsedSeconds || 0),
    0
  );

  // Compute Personal Bests from history + individual keys
  const personalBests: UserStatsSummary["personalBests"] = {
    time: {
      "15": getPBForMode("time", "15", history),
      "30": getPBForMode("time", "30", history),
      "60": getPBForMode("time", "60", history),
      "120": getPBForMode("time", "120", history),
    },
    words: {
      "10": getPBForMode("words", "10", history),
      "25": getPBForMode("words", "25", history),
      "50": getPBForMode("words", "50", history),
      "100": getPBForMode("words", "100", history),
    },
  };

  return {
    testsStarted: Math.max(testsStarted, testsCompleted),
    testsCompleted,
    totalTimeTypingSeconds,
    personalBests,
    history,
  };
}

function getPBForMode(
  mode: string,
  detail: string,
  history: TestResultRecord[]
): { wpm: number; accuracy: number } {
  // Check direct localstorage key first
  const directKey = `kz-pb-${mode}-${detail}`;
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(directKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.wpm === "number") {
          return { wpm: parsed.wpm, accuracy: parsed.accuracy || 100 };
        }
      } catch {
        /* ignore */
      }
    }
  }

  // Fallback to highest WPM in history
  const filtered = history.filter(
    (h) => h.mode === mode && String(h.modeDetail) === String(detail)
  );
  if (filtered.length === 0) {
    return { wpm: 0, accuracy: 0 };
  }
  const best = filtered.reduce(
    (max, item) => (item.wpm > max.wpm ? item : max),
    filtered[0]
  );
  return { wpm: best.wpm, accuracy: best.accuracy };
}

export function incrementTestsStarted(): void {
  if (typeof window === "undefined") return;
  const current = parseInt(localStorage.getItem(TESTS_STARTED_KEY) || "0", 10);
  localStorage.setItem(TESTS_STARTED_KEY, String(current + 1));
}

export function recordCompletedTest(result: {
  mode: string;
  modeDetail: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  elapsedSeconds: number;
  language: string;
}): void {
  if (typeof window === "undefined") return;

  const currentStats = getStoredUserStats();
  const record: TestResultRecord = {
    id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    ...result,
  };

  const newHistory = [record, ...currentStats.history];
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newHistory));

  // Update PB if better WPM
  const directKey = `kz-pb-${result.mode}-${result.modeDetail}`;
  const existingPB = currentStats.personalBests[result.mode as "time" | "words"]?.[result.modeDetail];
  if (!existingPB || result.wpm > existingPB.wpm) {
    localStorage.setItem(
      directKey,
      JSON.stringify({
        wpm: result.wpm,
        accuracy: result.accuracy,
        date: new Date().toISOString(),
      })
    );
  }
}

export function formatTimeTyping(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}
