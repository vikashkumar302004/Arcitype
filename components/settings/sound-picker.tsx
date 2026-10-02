"use client";

import { Check, SpeakerHigh } from "@phosphor-icons/react";
import { SOUND_PROFILES, type SwitchProfile } from "@/lib/synth-sound";
import { cn } from "@/lib/utils";

export function SoundProfileGrid({
  active,
  onSelect,
}: {
  active: SwitchProfile;
  onSelect: (id: SwitchProfile) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
      {SOUND_PROFILES.map((sp) => {
        const selected = active === sp.id;
        return (
          <button
            className={cn(
              "flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-150 border",
              selected
                ? "border-primary/40 bg-primary/15 text-primary font-bold shadow-xs"
                : "border-foreground/[0.08] bg-foreground/[0.02] text-foreground hover:bg-foreground/[0.06]"
            )}
            key={sp.id}
            onClick={() => onSelect(sp.id)}
            type="button"
          >
            <div className="flex items-center gap-2.5">
              <SpeakerHigh
                className={selected ? "text-primary" : "text-muted-foreground/50"}
                size={16}
                weight="duotone"
              />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold capitalize">
                  {sp.id}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {sp.label}
                </span>
              </div>
            </div>
            {selected && (
              <Check className="shrink-0 text-primary" size={16} weight="bold" />
            )}
          </button>
        );
      })}
    </div>
  );
}
