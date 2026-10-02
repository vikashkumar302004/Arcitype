"use client";

import { Envelope, GoogleLogo, GithubLogo, LockKey, UserCircle, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    login(email, username || email.split("@")[0]);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 400);
  };

  const handleOAuth = (provider: string) => {
    setSubmitted(true);
    const mockEmail = `${provider.toLowerCase()}user@gmail.com`;
    const mockName = `${provider}User`;
    login(mockEmail, mockName);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex w-full max-w-md flex-col rounded-2xl border border-border bg-card p-6 shadow-2xl"
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary mb-3 shadow-xs">
              <UserCircle size={28} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {tab === "login" ? "Welcome Back to Arcitype" : "Create Arcitype Account"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Save your WPM history, sync themes, and climb the leaderboards.
            </p>
          </div>

          {/* Login / Register Tab Switcher */}
          <div className="mt-5 flex rounded-xl border border-border bg-background p-1">
            <button
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                tab === "login"
                  ? "bg-primary/20 text-primary font-bold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab("login")}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                tab === "register"
                  ? "bg-primary/20 text-primary font-bold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab("register")}
              type="button"
            >
              Register
            </button>
          </div>

          {/* OAuth Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-foreground/[0.02] py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-foreground/[0.06]"
              onClick={() => handleOAuth("Google")}
              type="button"
            >
              <GoogleLogo size={16} weight="bold" />
              <span>Google</span>
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-foreground/[0.02] py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-foreground/[0.06]"
              onClick={() => handleOAuth("GitHub")}
              type="button"
            >
              <GithubLogo size={16} weight="bold" />
              <span>GitHub</span>
            </button>
          </div>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase font-semibold text-muted-foreground/40 tracking-wider">
              or continue with email
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email / Password Form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            {tab === "register" && (
              <div className="relative">
                <UserCircle className="absolute left-3.5 top-3 text-muted-foreground/60" size={16} />
                <input
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username (e.g. Vikash9811)"
                  required
                  type="text"
                  value={username}
                />
              </div>
            )}
            <div className="relative">
              <Envelope className="absolute left-3.5 top-3 text-muted-foreground/60" size={16} />
              <input
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="relative">
              <LockKey className="absolute left-3.5 top-3 text-muted-foreground/60" size={16} />
              <input
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                type="password"
                value={password}
              />
            </div>

            <button
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-transform active:scale-[0.98] hover:opacity-95"
              type="submit"
            >
              {submitted ? (
                <span>Signed In Successfully ✓</span>
              ) : tab === "login" ? (
                <span>Sign In</span>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[10px] text-muted-foreground/60">
            By signing in, you agree to our Terms of Service & Privacy Policy.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
