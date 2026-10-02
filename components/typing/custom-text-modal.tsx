"use client";

import { Article, Check, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomText: (words: string[]) => void;
}

export function CustomTextModal({ isOpen, onClose, onApplyCustomText }: CustomTextModalProps) {
  const [text, setText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const words = text
      .trim()
      .replace(/\n+/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    if (words.length > 0) {
      onApplyCustomText(words);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
          exit={{ opacity: 0, scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
        >
          <button
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 font-bold text-lg text-foreground">
            <Article className="text-primary" size={22} weight="duotone" />
            <span>Custom Text Importer</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste any article, quote, or passage below to create a custom practice test.
          </p>

          <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
            <textarea
              className="h-40 w-full resize-none rounded-xl border border-border bg-background p-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              value={text}
            />

            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                {text.trim() ? text.trim().split(/\s+/).length : 0} words
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-foreground/5"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 font-semibold text-xs text-primary-foreground hover:opacity-90"
                  type="submit"
                >
                  <Check size={14} weight="bold" />
                  Start Custom Test
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
