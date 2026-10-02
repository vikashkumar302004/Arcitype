"use client";

import { Check, Globe, MagnifyingGlass, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { LANGUAGES, type LanguageId } from "@/lib/languages";

interface LanguageModalProps {
  currentLanguage: LanguageId;
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (lang: LanguageId) => void;
}

export function LanguageModal({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}: LanguageModalProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-border bg-card p-6 shadow-2xl"
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
            <Globe className="text-primary" size={22} weight="duotone" />
            <span>Select Test Language</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose a language pool for practice text generation.
          </p>

          {/* Search box */}
          <div className="relative mt-4">
            <MagnifyingGlass
              className="absolute left-3.5 top-3 text-muted-foreground/60"
              size={16}
            />
            <input
              autoFocus
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              value={search}
            />
          </div>

          {/* Languages list */}
          <div className="mt-4 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {filteredLanguages.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No languages found matching "{search}"
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLanguage === lang.id;
                return (
                  <button
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                      isSelected
                        ? "border border-primary/30 bg-primary/15 text-primary font-bold shadow-xs"
                        : "border border-transparent bg-foreground/[0.02] text-foreground hover:bg-foreground/[0.06]"
                    }`}
                    key={lang.id}
                    onClick={() => {
                      onSelectLanguage(lang.id);
                      onClose();
                    }}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <Globe
                        className={isSelected ? "text-primary" : "text-muted-foreground/50"}
                        size={16}
                        weight="duotone"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm capitalize">
                          {lang.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground/70">
                          {lang.nativeName}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="text-primary" size={16} weight="bold" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
