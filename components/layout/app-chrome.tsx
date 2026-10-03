"use client";

import {
  Command,
  GearSix,
  GithubLogo,
  SpeakerHigh,
  SpeakerSlash,
  Sword,
  UserCircle,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LoginModal } from "@/components/auth/login-modal";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { ArcitypeLogo } from "@/components/layout/keythm-logo";
import { RaceArenaModal } from "@/components/multiplayer/race-arena-modal";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { useSettings } from "@/components/settings/settings-provider";
import { DynamicFavicon } from "@/components/theme/dynamic-favicon";
import { VisitCount } from "@/components/visit-count";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

import type { RaceRoom } from "@/lib/multiplayer-service";

interface AppChromeContextValue {
  homeLogoHandlerRef: React.MutableRefObject<(() => void) | null>;
  setSettingsOpen: (open: boolean) => void;
  setTypingActive: (active: boolean) => void;
  settingsOpen: boolean;
  typingActive: boolean;
  multiplayerRoom: RaceRoom | null;
  setMultiplayerRoom: (room: RaceRoom | null) => void;
  isRaceModalOpen: boolean;
  setIsRaceModalOpen: (open: boolean) => void;
}

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

export function useAppChrome() {
  const ctx = useContext(AppChromeContext);
  if (!ctx) {
    throw new Error("useAppChrome must be used within AppChrome");
  }
  return ctx;
}

export function AppChrome({ children }: { children: ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [typingActive, setTypingActive] = useState(false);
  const [multiplayerRoom, setMultiplayerRoom] = useState<RaceRoom | null>(null);
  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);
  const homeLogoHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore */
      });
    }
  }, []);

  // ⌘K to toggle settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSettingsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      settingsOpen,
      setSettingsOpen,
      typingActive,
      setTypingActive,
      homeLogoHandlerRef,
      multiplayerRoom,
      setMultiplayerRoom,
      isRaceModalOpen,
      setIsRaceModalOpen,
    }),
    [settingsOpen, typingActive, multiplayerRoom, isRaceModalOpen]
  );

  return (
    <AppChromeContext.Provider value={value}>
      <DynamicFavicon />
      <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-background">
        {/* Ambient Glow Atmosphere Background */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-primary/15 blur-[140px]" />
        </div>

        <div className="relative z-10 flex min-h-dvh w-full flex-col">
          <SiteHeader />
          {children}
        </div>
      </div>
      <SettingsPanel onOpenChange={setSettingsOpen} open={settingsOpen} />
    </AppChromeContext.Provider>
  );
}

function SiteHeader() {
  const router = useRouter();
  const { setSettingsOpen, typingActive, homeLogoHandlerRef, isRaceModalOpen, setIsRaceModalOpen } = useAppChrome();
  const { soundEnabled, setSoundEnabled } = useSettings();
  const { isLoggedIn } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const dimHeader = typingActive;

  const [mouseHeaderVisible, setMouseHeaderVisible] = useState(false);
  const headerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headerVisible = !typingActive || mouseHeaderVisible;

  useEffect(
    () => () => {
      if (headerTimerRef.current) {
        clearTimeout(headerTimerRef.current);
      }
    },
    []
  );

  const handleHeaderMouseMove = useCallback(() => {
    if (!typingActive) {
      return;
    }
    setMouseHeaderVisible(true);
    if (headerTimerRef.current) {
      clearTimeout(headerTimerRef.current);
    }
    headerTimerRef.current = setTimeout(
      () => setMouseHeaderVisible(false),
      2500
    );
  }, [typingActive]);

  function handleLogoClick() {
    if (homeLogoHandlerRef.current) {
      homeLogoHandlerRef.current();
      return;
    }
    router.push("/");
  }

  const headerOpacity = dimHeader ? (headerVisible ? 1 : 0.1) : 1;

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <RaceArenaModal isOpen={isRaceModalOpen} onClose={() => setIsRaceModalOpen(false)} />
      <motion.header
        animate={{ opacity: headerOpacity }}
        className="flex shrink-0 justify-center px-6 py-3 md:px-12 md:pt-5 md:pb-2"
        onMouseMove={handleHeaderMouseMove}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="relative flex w-full max-w-5xl items-center justify-between gap-4">
          {/* Left Group — Logo + Audio + Settings + Race Arena */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Logo */}
            <button
              className="flex cursor-pointer items-center gap-2 font-black text-primary text-2xl md:text-3xl tracking-tight transition-transform hover:scale-[1.02]"
              onClick={handleLogoClick}
              type="button"
            >
              <ArcitypeLogo size={30} />
              <span className="font-mono text-2xl font-black tracking-tighter text-foreground sm:text-3xl">Arcitype</span>
              <span className="rounded-lg bg-primary/15 px-2 py-0.5 font-sans font-extrabold text-[10px] text-primary uppercase tracking-widest border border-primary/20 hidden xs:inline-block">
                PRO
              </span>
            </button>

            {/* Shifted Audio, Settings & Race Arena */}
            <div className="flex items-center gap-2">
              {/* Race Arena Button */}
              <motion.button
                aria-label="Race Arena"
                className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3.5 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/25 shadow-2xs"
                onClick={() => setIsRaceModalOpen(true)}
                type="button"
                whileTap={{ scale: 0.96 }}
              >
                <Sword size={16} weight="duotone" />
                <span>Race Arena</span>
              </motion.button>

              {/* Audio toggle */}
              <motion.button
                aria-label={soundEnabled ? "Mute audio" : "Unmute audio"}
                className={cn(
                  "flex items-center gap-1.5 rounded-full bg-foreground/[0.05] px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                  soundEnabled
                    ? "text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground"
                    : "text-muted-foreground/35 hover:bg-foreground/[0.06] hover:text-muted-foreground"
                )}
                onClick={() => setSoundEnabled(!soundEnabled)}
                type="button"
                whileTap={{ scale: 0.97 }}
              >
                <motion.span
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex"
                  initial={{ scale: 0.6, opacity: 0 }}
                  key={String(soundEnabled)}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {soundEnabled ? (
                    <SpeakerHigh size={15} weight="duotone" />
                  ) : (
                    <SpeakerSlash size={15} weight="duotone" />
                  )}
                </motion.span>
                <span className="hidden md:inline">Audio</span>
              </motion.button>

              {/* Settings */}
              <motion.button
                aria-label="Settings"
                className="flex items-center gap-1.5 rounded-full bg-foreground/[0.06] border border-foreground/10 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-foreground/10"
                onClick={() => setSettingsOpen(true)}
                type="button"
                whileTap={{ scale: 0.97 }}
              >
                <GearSix size={15} weight="duotone" />
                <span>Settings</span>
                <kbd className="hidden items-center gap-px rounded border border-foreground/15 bg-foreground/10 px-1 py-0.5 text-[9px] text-muted-foreground leading-none lg:inline-flex font-mono">
                  <Command size={9} weight="duotone" />
                  <span>K</span>
                </kbd>
              </motion.button>
            </div>
          </div>

          {/* Far Right — Login Button or User Dropdown */}
          {isLoggedIn ? (
            <UserDropdown />
          ) : (
            <motion.button
              aria-label="Login"
              className="flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/25 shadow-2xs"
              onClick={() => setIsLoginModalOpen(true)}
              type="button"
              whileTap={{ scale: 0.96 }}
            >
              <UserCircle size={18} weight="duotone" />
              <span>login</span>
            </motion.button>
          )}
        </div>
      </motion.header>
    </>
  );
}
