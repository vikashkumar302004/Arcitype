"use client";

import { Check, MagnifyingGlass, SpeakerHigh, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useSettings } from "@/components/settings/settings-provider";
import { SOUND_PROFILES, type SwitchProfile, playSwitchSound } from "@/lib/synth-sound";

interface SoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SoundModal({ isOpen, onClose }: SoundModalProps) {
  const { soundProfile: currentProfile, setSoundProfile, soundVolume } = useSettings();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<"all" | "mechanical" | "synth">("all");

  if (!isOpen) return null;

  const filteredProfiles = SOUND_PROFILES.filter((sp) => {
    const matchesSearch =
      sp.id.toLowerCase().includes(search.toLowerCase()) ||
      sp.label.toLowerCase().includes(search.toLowerCase());

    const isMech = ["thock", "clicky", "creamy", "typewriter", "cyberpunk"].includes(sp.id);
    const isSynth = ["beep", "pop", "square", "triangle", "hitmarker"].includes(sp.id);

    let matchesTag = true;
    if (tagFilter === "mechanical") matchesTag = isMech;
    if (tagFilter === "synth") matchesTag = isSynth;

    return matchesSearch && matchesTag;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card p-6 shadow-2xl"
          exit={{ opacity: 0, scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
        >
          {/* Close button */}
          <button
            className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 font-bold text-lg text-foreground">
            <SpeakerHigh className="text-primary" size={22} weight="duotone" />
            <span>Select Sound Profile</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Plays a short sound when you press a key during typing tests.
          </p>

          {/* Search & Tag Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MagnifyingGlass
                className="absolute left-3.5 top-3 text-muted-foreground/60"
                size={16}
              />
              <input
                autoFocus
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sound profile..."
                value={search}
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              {(["all", "mechanical", "synth"] as const).map((tag) => (
                <button
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all ${
                    tagFilter === tag
                      ? "bg-primary/20 text-primary font-bold shadow-xs"
                      : "text-muted-foreground/60 hover:text-foreground"
                  }`}
                  key={tag}
                  onClick={() => setTagFilter(tag)}
                  type="button"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Profiles Grid */}
          <div className="mt-4 flex-1 overflow-y-auto pr-1">
            {filteredProfiles.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No sound profiles found matching "{search}"
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {filteredProfiles.map((sp) => {
                  const isSelected = currentProfile === sp.id;
                  return (
                    <button
                      className={`group flex items-center justify-between rounded-xl p-3 text-left transition-all ${
                        isSelected
                          ? "border border-primary/40 bg-primary/15 text-primary font-bold shadow-xs"
                          : "border border-foreground/[0.08] bg-foreground/[0.02] text-foreground hover:border-foreground/20 hover:bg-foreground/[0.06]"
                      }`}
                      key={sp.id}
                      onClick={() => {
                        playSwitchSound(sp.id as SwitchProfile, "space", soundVolume);
                        setSoundProfile(sp.id as SwitchProfile);
                      }}
                      type="button"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SpeakerHigh
                          className={isSelected ? "text-primary shrink-0" : "text-muted-foreground/50 shrink-0"}
                          size={16}
                          weight="duotone"
                        />
                        <div className="flex flex-col truncate">
                          <span className="font-mono text-sm font-semibold capitalize truncate">
                            {sp.id}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 font-sans truncate">
                            {sp.label}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="shrink-0 text-primary" size={16} weight="bold" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
