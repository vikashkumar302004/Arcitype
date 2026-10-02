"use client";

export type SwitchProfile =
  | "off"
  | "thock"
  | "clicky"
  | "creamy"
  | "typewriter"
  | "cyberpunk"
  | "beep"
  | "pop"
  | "square"
  | "triangle";

export interface SoundProfileOption {
  id: SwitchProfile;
  label: string;
}

export const SOUND_PROFILES: SoundProfileOption[] = [
  { id: "off", label: "off" },
  { id: "thock", label: "thock (default)" },
  { id: "clicky", label: "clicky (cherry blue)" },
  { id: "creamy", label: "creamy (nk creams)" },
  { id: "typewriter", label: "typewriter" },
  { id: "cyberpunk", label: "cyberpunk" },
  { id: "beep", label: "beep" },
  { id: "pop", label: "pop" },
  { id: "square", label: "square" },
  { id: "triangle", label: "triangle" },
];

let synthAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!synthAudioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      synthAudioContext = new AudioCtx();
    }
  }
  if (synthAudioContext && synthAudioContext.state === "suspended") {
    void synthAudioContext.resume();
  }
  return synthAudioContext;
}

export function playSwitchSound(
  profile: SwitchProfile = "thock",
  key = "a",
  volume = 0.5
) {
  if (profile === "off") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume * 0.8, now);
  masterGain.connect(ctx.destination);

  const isSpace = key === "Space" || key === " ";
  const isEnter = key === "Enter";

  switch (profile) {
    case "clicky": {
      // High pitch click + snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.03);
      break;
    }
    case "creamy": {
      // Deep resonant warm thock
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(isSpace ? 140 : 220, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
      break;
    }
    case "typewriter": {
      if (isEnter) {
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = "sine";
        bell.frequency.setValueAtTime(1400, now);
        bellGain.gain.setValueAtTime(0.4, now);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        bell.connect(bellGain);
        bellGain.connect(masterGain);
        bell.start(now);
        bell.stop(now + 0.4);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(3200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.025);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.025);
      }
      break;
    }
    case "cyberpunk": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1600, now + 0.04);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }
    case "beep": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }
    case "pop": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.03);
      break;
    }
    case "square": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.03);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.03);
      break;
    }
    case "triangle": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }
    case "thock":
    default: {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(isSpace ? 120 : 180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }
  }
}
