"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { KeyboardThemeName } from "@/components/ui/keyboard";
import { syncKeythmFavicon } from "@/lib/favicon-client";
import { FONT_OPTIONS, type TypingFont } from "@/lib/font-options";
import { THEME_OPTIONS } from "@/lib/theme-options";

import { playSwitchSound, SOUND_PROFILES, type SwitchProfile } from "@/lib/synth-sound";

export {
  FONT_OPTIONS,
  type FontOption,
  type TypingFont,
} from "@/lib/font-options";
export { THEME_OPTIONS } from "@/lib/theme-options";
export { SOUND_PROFILES, type SwitchProfile } from "@/lib/synth-sound";

export type CaretStyle = "line" | "block" | "underline" | "outline" | "off";
export type ConfidenceMode = "off" | "on" | "max";
export type StopOnError = "off" | "letter" | "word";
export type PaceCaret = "off" | "60" | "80" | "100" | "120";

interface SettingsContextType {
  accent: KeyboardThemeName;
  blindMode: boolean;
  caretStyle: CaretStyle;
  confidenceMode: ConfidenceMode;
  faahMode: boolean;
  font: TypingFont;
  fontCssFamily: string;
  fontZoom: number;
  ghostMode: boolean;
  liveStats: boolean;
  paceCaret: PaceCaret;
  setAccent: (c: KeyboardThemeName) => void;
  setBlindMode: (v: boolean) => void;
  setCaretStyle: (s: CaretStyle) => void;
  setConfidenceMode: (cm: ConfidenceMode) => void;
  setFaahMode: (v: boolean) => void;
  setFont: (f: TypingFont) => void;
  setFontZoom: (z: number) => void;
  setGhostMode: (v: boolean) => void;
  setLiveStats: (v: boolean) => void;
  setPaceCaret: (pc: PaceCaret) => void;
  setShowKeyboard: (v: boolean) => void;
  setSmoothCaret: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setSoundProfile: (p: SwitchProfile) => void;
  setSoundVolume: (v: number) => void;
  setStopOnError: (soe: StopOnError) => void;
  showKeyboard: boolean;
  smoothCaret: boolean;
  soundEnabled: boolean;
  soundProfile: SwitchProfile;
  soundVolume: number;
  stopOnError: StopOnError;
  zoomIn: () => void;
  zoomOut: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

function loadGoogleFont(family: string) {
  const id = `gf-${family}`;
  if (document.getElementById(id)) {
    return;
  }
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  document.head.appendChild(link);
}

function applyAccentToDom(accent: KeyboardThemeName) {
  document.documentElement.setAttribute("data-accent", accent);
  queueMicrotask(() => syncKeythmFavicon());
}

function applyFontToDom(fontId: TypingFont) {
  const option = FONT_OPTIONS.find((f) => f.id === fontId);
  if (!option) {
    return;
  }
  if (option.googleFamily) {
    loadGoogleFont(option.googleFamily);
  }
  document.documentElement.style.setProperty("--typing-font", option.cssFamily);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<KeyboardThemeName>("royal");
  const [font, setFontState] = useState<TypingFont>("geist-mono");
  const [showKeyboard, setShowKeyboardState] = useState(true);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [soundProfile, setSoundProfileState] = useState<SwitchProfile>("thock");
  const [soundVolume, setSoundVolumeState] = useState(0.8);
  const [liveStats, setLiveStatsState] = useState(true);
  const [faahMode, setFaahModeState] = useState(false);
  const [ghostMode, setGhostModeState] = useState(false);
  const [fontZoom, setFontZoomState] = useState(1.0);

  const [caretStyle, setCaretStyleState] = useState<CaretStyle>("line");
  const [smoothCaret, setSmoothCaretState] = useState(true);
  const [confidenceMode, setConfidenceModeState] = useState<ConfidenceMode>("off");
  const [stopOnError, setStopOnErrorState] = useState<StopOnError>("off");
  const [paceCaret, setPaceCaretState] = useState<PaceCaret>("off");
  const [blindMode, setBlindModeState] = useState(false);

  // One-time hydration from localStorage on mount
  useEffect(() => {
    const validThemes = new Set<string>(THEME_OPTIONS.map((t) => t.id));
    const rawAccent = localStorage.getItem("tc-accent");
    const savedFont = localStorage.getItem("tc-font") as TypingFont | null;
    const savedShowKeyboard = localStorage.getItem("tc-show-keyboard");
    const savedSoundEnabled = localStorage.getItem("tc-sound-enabled");
    const savedSoundProfile = localStorage.getItem("tc-sound-profile") as SwitchProfile | null;
    const savedSoundVolume = localStorage.getItem("tc-sound-volume");
    const savedRealtimeWpm = localStorage.getItem("tc-realtime-wpm");
    const savedFaahMode = localStorage.getItem("tc-faah-mode");
    const savedGhostMode = localStorage.getItem("tc-ghost-mode");
    const savedFontZoom = localStorage.getItem("tc-font-zoom");
    const savedCaretStyle = localStorage.getItem("tc-caret-style") as CaretStyle | null;
    const savedSmoothCaret = localStorage.getItem("tc-smooth-caret");
    const savedConfidenceMode = localStorage.getItem("tc-confidence-mode") as ConfidenceMode | null;
    const savedStopOnError = localStorage.getItem("tc-stop-on-error") as StopOnError | null;
    const savedPaceCaret = localStorage.getItem("tc-pace-caret") as PaceCaret | null;
    const savedBlindMode = localStorage.getItem("tc-blind-mode");

    const initialAccent =
      rawAccent && validThemes.has(rawAccent)
        ? (rawAccent as KeyboardThemeName)
        : "royal";
    setAccentState(initialAccent);
    applyAccentToDom(initialAccent);

    if (savedFont) {
      setFontState(savedFont);
      applyFontToDom(savedFont);
    }
    if (savedShowKeyboard !== null) {
      setShowKeyboardState(savedShowKeyboard !== "false");
    }
    if (savedSoundEnabled !== null) {
      setSoundEnabledState(savedSoundEnabled !== "false");
    }
    if (savedSoundProfile) {
      setSoundProfileState(savedSoundProfile);
    }
    if (savedSoundVolume !== null) {
      const v = Number(savedSoundVolume);
      if (Number.isFinite(v) && v >= 0 && v <= 1) {
        setSoundVolumeState(v);
      }
    }
    if (savedRealtimeWpm !== null) {
      setLiveStatsState(savedRealtimeWpm === "true");
    }
    if (savedFaahMode !== null) {
      setFaahModeState(savedFaahMode === "true");
    }
    if (savedGhostMode !== null) {
      setGhostModeState(savedGhostMode === "true");
    }
    if (savedFontZoom !== null) {
      const z = Number(savedFontZoom);
      if (Number.isFinite(z) && z >= 0.7 && z <= 2.2) {
        setFontZoomState(z);
      }
    }
    if (savedCaretStyle && ["line", "block", "underline", "outline", "off"].includes(savedCaretStyle)) {
      setCaretStyleState(savedCaretStyle);
    }
    if (savedSmoothCaret !== null) {
      setSmoothCaretState(savedSmoothCaret === "true");
    }
    if (savedConfidenceMode && ["off", "on", "max"].includes(savedConfidenceMode)) {
      setConfidenceModeState(savedConfidenceMode);
    }
    if (savedStopOnError && ["off", "letter", "word"].includes(savedStopOnError)) {
      setStopOnErrorState(savedStopOnError);
    }
    if (savedPaceCaret && ["off", "60", "80", "100", "120"].includes(savedPaceCaret)) {
      setPaceCaretState(savedPaceCaret);
    }
    if (savedBlindMode !== null) {
      setBlindModeState(savedBlindMode === "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFontZoom = (z: number) => {
    const clamped = Math.min(2.2, Math.max(0.7, Math.round(z * 100) / 100));
    setFontZoomState(clamped);
    localStorage.setItem("tc-font-zoom", String(clamped));
  };

  const zoomIn = () => setFontZoom(fontZoom + 0.15);
  const zoomOut = () => setFontZoom(fontZoom - 0.15);

  const setAccent = (c: KeyboardThemeName) => {
    setAccentState(c);
    applyAccentToDom(c);
    localStorage.setItem("tc-accent", c);
  };

  const setFont = (f: TypingFont) => {
    setFontState(f);
    applyFontToDom(f);
    localStorage.setItem("tc-font", f);
  };

  const setCaretStyle = (s: CaretStyle) => {
    setCaretStyleState(s);
    localStorage.setItem("tc-caret-style", s);
  };

  const setSmoothCaret = (v: boolean) => {
    setSmoothCaretState(v);
    localStorage.setItem("tc-smooth-caret", String(v));
  };

  const setConfidenceMode = (cm: ConfidenceMode) => {
    setConfidenceModeState(cm);
    localStorage.setItem("tc-confidence-mode", cm);
  };

  const setStopOnError = (soe: StopOnError) => {
    setStopOnErrorState(soe);
    localStorage.setItem("tc-stop-on-error", soe);
  };

  const setPaceCaret = (pc: PaceCaret) => {
    setPaceCaretState(pc);
    localStorage.setItem("tc-pace-caret", pc);
  };

  const setBlindMode = (v: boolean) => {
    setBlindModeState(v);
    localStorage.setItem("tc-blind-mode", String(v));
  };

  const setShowKeyboard = (v: boolean) => {
    setShowKeyboardState(v);
    localStorage.setItem("tc-show-keyboard", String(v));
  };

  const setSoundEnabled = (v: boolean) => {
    setSoundEnabledState(v);
    localStorage.setItem("tc-sound-enabled", String(v));
  };

  const setSoundProfile = (p: SwitchProfile) => {
    setSoundProfileState(p);
    localStorage.setItem("tc-sound-profile", p);
    if (p !== "off") {
      playSwitchSound(p, "a", soundVolume);
    }
  };

  const setSoundVolume = (v: number) => {
    setSoundVolumeState(v);
    localStorage.setItem("tc-sound-volume", String(v));
  };

  const setLiveStats = (v: boolean) => {
    setLiveStatsState(v);
    localStorage.setItem("tc-realtime-wpm", String(v));
  };

  const setFaahMode = (v: boolean) => {
    setFaahModeState(v);
    localStorage.setItem("tc-faah-mode", String(v));
  };

  const setGhostMode = (v: boolean) => {
    setGhostModeState(v);
    localStorage.setItem("tc-ghost-mode", String(v));
  };

  const fontCssFamily =
    FONT_OPTIONS.find((f) => f.id === font)?.cssFamily ?? "var(--font-mono)";

  return (
    <SettingsContext.Provider
      value={{
        accent,
        setAccent,
        blindMode,
        setBlindMode,
        caretStyle,
        setCaretStyle,
        smoothCaret,
        setSmoothCaret,
        confidenceMode,
        setConfidenceMode,
        stopOnError,
        setStopOnError,
        paceCaret,
        setPaceCaret,
        font,
        setFont,
        fontCssFamily,
        fontZoom,
        setFontZoom,
        zoomIn,
        zoomOut,
        showKeyboard,
        setShowKeyboard,
        soundEnabled,
        setSoundEnabled,
        soundProfile,
        setSoundProfile,
        soundVolume,
        setSoundVolume,
        liveStats,
        setLiveStats,
        faahMode,
        setFaahMode,
        ghostMode,
        setGhostMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
