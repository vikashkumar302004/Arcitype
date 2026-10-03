"use client";

import {
  ChartLineUp,
  GearSix,
  Globe,
  SignOut,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export function UserDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar & Name Button */}
      <motion.button
        aria-label="User Account Menu"
        className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary/60 hover:bg-primary/20 shadow-2xs"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
        whileTap={{ scale: 0.96 }}
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[11px]">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span className="font-mono text-xs font-bold text-foreground max-w-[120px] truncate">
          {user.username}
        </span>
      </motion.button>

      {/* Account Hover/Click Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl"
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {/* User Info Header */}
            <div className="px-3 py-2 border-b border-border/50 mb-1">
              <p className="font-mono text-xs font-bold text-foreground truncate">
                {user.username}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user.email}
              </p>
            </div>

            {/* Menu Links */}
            <div className="space-y-0.5 font-mono text-xs">
              <button
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-foreground/90 transition-colors hover:bg-foreground/[0.08] hover:text-foreground text-left"
                onClick={() => navigateTo("/account?tab=stats")}
                type="button"
              >
                <ChartLineUp size={16} className="text-primary" weight="bold" />
                <span>User stats</span>
              </button>

              <button
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-foreground/90 transition-colors hover:bg-foreground/[0.08] hover:text-foreground text-left"
                onClick={() => navigateTo("/account?tab=friends")}
                type="button"
              >
                <UsersThree size={16} className="text-muted-foreground" weight="bold" />
                <span>Friends</span>
              </button>

              <button
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-foreground/90 transition-colors hover:bg-foreground/[0.08] hover:text-foreground text-left"
                onClick={() => navigateTo("/account?tab=public")}
                type="button"
              >
                <Globe size={16} className="text-muted-foreground" weight="bold" />
                <span>Public profile</span>
              </button>

              <button
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-foreground/90 transition-colors hover:bg-foreground/[0.08] hover:text-foreground text-left"
                onClick={() => navigateTo("/account?tab=settings")}
                type="button"
              >
                <GearSix size={16} className="text-muted-foreground" weight="bold" />
                <span>Account settings</span>
              </button>
            </div>

            <div className="my-1 border-t border-border/50" />

            {/* Sign Out Button */}
            <button
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-mono text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 text-left"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              type="button"
            >
              <SignOut size={16} weight="bold" />
              <span>Sign out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
