"use client";

import { GoogleLogo, UserCircle, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex w-full max-w-sm flex-col rounded-2xl border border-border bg-card p-6 shadow-2xl"
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
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary mb-3 shadow-xs">
              <UserCircle size={32} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold font-mono text-foreground">
              Sign In to Arcitype
            </h2>
            <p className="mt-1.5 text-xs font-mono text-muted-foreground">
              Save your WPM test history, sync custom sound profiles & climb leaderboards.
            </p>
          </div>

          {/* Single Primary Action: Firebase Google Login */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-primary/30 bg-primary/10 py-3 text-xs font-mono font-bold text-foreground transition-all hover:bg-primary/20 hover:border-primary/50 shadow-xs active:scale-[0.98]"
              disabled={loading}
              onClick={handleGoogleSignIn}
              type="button"
            >
              <GoogleLogo size={18} weight="bold" className="text-primary" />
              <span>{loading ? "Connecting Firebase..." : "Continue with Google"}</span>
            </button>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] text-muted-foreground/50">
            Powered by Firebase Authentication & Next.js
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
