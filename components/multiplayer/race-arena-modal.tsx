"use client";

import {
  Check,
  Copy,
  Crown,
  Flame,
  Globe,
  Play,
  ShareNetwork,
  Sword,
  Trophy,
  UserPlus,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import {
  createMultiplayerRoom,
  finishPlayerRace,
  joinMultiplayerRoom,
  type RacePlayer,
  type RaceRoom,
  setRoomStatusRacing,
  startMultiplayerRace,
  subscribeToRoom,
  togglePlayerReadyState,
} from "@/lib/multiplayer-service";

interface RaceArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRace?: (room: RaceRoom) => void;
}

export function RaceArenaModal({ isOpen, onClose }: RaceArenaModalProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"create" | "join">("create");

  // Create room options
  const [maxPlayers, setMaxPlayers] = useState<number>(5);
  const [mode, setMode] = useState<"time" | "words">("time");
  const [modeDetail, setModeDetail] = useState<string>("30");

  // Join room input
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  // Active room state
  const [currentRoom, setCurrentRoom] = useState<RaceRoom | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  // Auto-join if URL contains ?room=ARC-XXXX
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get("room");
      if (roomParam) {
        setJoinCode(roomParam);
        handleJoin(roomParam);
      }
    }
  }, []);

  // Subscribe to Firebase Firestore room changes
  useEffect(() => {
    if (!currentRoom) return;

    const unsubscribe = subscribeToRoom(currentRoom.roomId, (updatedRoom) => {
      setCurrentRoom(updatedRoom);

      // Handle 3-2-1 countdown trigger
      if (updatedRoom.status === "countdown" && updatedRoom.countdownStart) {
        const elapsed = Math.floor((Date.now() - updatedRoom.countdownStart) / 1000);
        const remaining = 3 - elapsed;
        if (remaining > 0) {
          setCountdownNum(remaining);
        } else {
          setCountdownNum(null);
          if (updatedRoom.players.find((p) => p.isHost)?.uid === (user?.uid || "host")) {
            setRoomStatusRacing(updatedRoom.roomId);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [currentRoom?.roomId, user?.uid]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    try {
      const roomId = await createMultiplayerRoom(
        {
          uid: user?.uid,
          name: user?.username || "SpeedTypist",
          avatarUrl: user?.avatarUrl,
        },
        { mode, modeDetail, maxPlayers }
      );

      const roomData = await joinMultiplayerRoom(roomId, {
        uid: user?.uid,
        name: user?.username || "SpeedTypist",
        avatarUrl: user?.avatarUrl,
      });

      setCurrentRoom(roomData);
    } catch (err: any) {
      console.error("Create room failed:", err);
    }
  };

  const handleJoin = async (codeToJoin?: string) => {
    const targetCode = codeToJoin || joinCode;
    if (!targetCode.trim()) return;
    setJoinError("");
    try {
      const roomData = await joinMultiplayerRoom(targetCode, {
        uid: user?.uid,
        name: user?.username || "SpeedTypist",
        avatarUrl: user?.avatarUrl,
      });
      if (!roomData) {
        setJoinError(`Room "${targetCode}" not found! Double check code & try again.`);
        return;
      }
      setCurrentRoom(roomData);
    } catch (err: any) {
      setJoinError(err.message || "Failed to join room.");
    }
  };

  const handleCopyCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom.roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!currentRoom) return;
    const shareableUrl = `${window.location.origin}/?room=${currentRoom.roomId}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleReady = async () => {
    if (!currentRoom || !user) return;
    await togglePlayerReadyState(currentRoom.roomId, user.uid || "anon");
  };

  const handleHostStart = async () => {
    if (!currentRoom) return;
    await startMultiplayerRace(currentRoom.roomId);
  };

  const myPlayer = currentRoom?.players.find(
    (p) => p.uid === user?.uid || p.name === user?.username
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex w-full max-w-2xl flex-col rounded-3xl border border-primary/30 bg-card p-6 shadow-2xl backdrop-blur-xl"
          exit={{ opacity: 0, scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
        >
          {/* Close button */}
          <button
            className="absolute right-5 top-5 rounded-full p-1.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary shadow-xs">
              <Sword size={28} weight="duotone" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-mono text-foreground flex items-center gap-2">
                <span>Arcitype Race Arena</span>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-sans font-extrabold text-[10px] text-primary uppercase tracking-widest border border-primary/20">
                  Up to {currentRoom?.maxPlayers || maxPlayers} Players
                </span>
              </h2>
              <p className="text-xs font-mono text-muted-foreground">
                Multiplayer Battle Lobby — Zero Distraction Race with Grand Podium Reveal!
              </p>
            </div>
          </div>

          {/* 3-2-1 Countdown Overlay */}
          {countdownNum !== null && (
            <div className="my-10 flex flex-col items-center justify-center text-center">
              <motion.span
                animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 1] }}
                className="font-mono text-7xl font-black text-primary drop-shadow-[0_0_20px_var(--primary)]"
                key={countdownNum}
              >
                {countdownNum}
              </motion.span>
              <p className="mt-2 font-mono text-sm font-bold text-foreground">
                Get Ready to Type!
              </p>
            </div>
          )}

          {/* VIEW A: LOBBY SETUP (No Active Room) */}
          {!currentRoom && countdownNum === null && (
            <div className="mt-6 flex flex-col gap-6">
              {/* Create vs Join Tabs */}
              <div className="flex rounded-2xl border border-border bg-background p-1 font-mono">
                <button
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    tab === "create"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setTab("create")}
                  type="button"
                >
                  Create Competition Room
                </button>
                <button
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    tab === "join"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setTab("join")}
                  type="button"
                >
                  Join via Code
                </button>
              </div>

              {/* TAB 1: CREATE ROOM OPTIONS */}
              {tab === "create" && (
                <div className="space-y-4 font-mono">
                  {/* Max Players selection */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2">
                      Max Players Limit
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 3, 5, 10].map((num) => (
                        <button
                          key={num}
                          className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                            maxPlayers === num
                              ? "border-primary bg-primary/20 text-primary shadow-2xs"
                              : "border-border bg-background text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => setMaxPlayers(num)}
                          type="button"
                        >
                          {num} Players
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Test Mode & Paragraph Length */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2">
                      Paragraph / Race Length
                    </label>
                    <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                      <button
                        className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                          mode === "time" && modeDetail === "15"
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                        onClick={() => {
                          setMode("time");
                          setModeDetail("15");
                        }}
                        type="button"
                      >
                        ⚡ 15s Sprint
                      </button>
                      <button
                        className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                          mode === "time" && modeDetail === "30"
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                        onClick={() => {
                          setMode("time");
                          setModeDetail("30");
                        }}
                        type="button"
                      >
                        📜 30s Standard
                      </button>
                      <button
                        className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                          mode === "words" && modeDetail === "25"
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                        onClick={() => {
                          setMode("words");
                          setModeDetail("25");
                        }}
                        type="button"
                      >
                        📝 25 Words
                      </button>
                      <button
                        className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                          mode === "words" && modeDetail === "50"
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                        onClick={() => {
                          setMode("words");
                          setModeDetail("50");
                        }}
                        type="button"
                      >
                        🏆 50 Words
                      </button>
                    </div>
                  </div>

                  <button
                    className="w-full rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98] hover:opacity-95 mt-2"
                    onClick={handleCreate}
                    type="button"
                  >
                    Create Battle Room
                  </button>
                </div>
              )}

              {/* TAB 2: JOIN ROOM */}
              {tab === "join" && (
                <div className="space-y-4 font-mono">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-muted-foreground">
                        Enter Room Code or Share Link
                      </label>
                      <button
                        className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            if (text) {
                              const cleaned = text.includes("room=")
                                ? text.split("room=")[1].substring(0, 8)
                                : text;
                              setJoinCode(cleaned);
                              handleJoin(cleaned);
                            }
                          } catch {
                            /* ignore */
                          }
                        }}
                        type="button"
                      >
                        📋 Paste Code
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        className="w-full rounded-2xl border border-border bg-background py-3.5 px-4 text-center font-mono text-lg font-bold text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none uppercase tracking-widest"
                        onChange={(e) => setJoinCode(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") {
                            handleJoin();
                          }
                        }}
                        onPaste={(e) => {
                          e.stopPropagation();
                          const text = e.clipboardData.getData("text");
                          if (text) {
                            const cleaned = text.includes("room=")
                              ? text.split("room=")[1].substring(0, 8)
                              : text;
                            setJoinCode(cleaned);
                          }
                        }}
                        placeholder="ARC-9482"
                        type="text"
                        value={joinCode}
                      />
                    </div>
                  </div>

                  {joinError && (
                    <p className="text-center text-xs font-semibold text-destructive">
                      {joinError}
                    </p>
                  )}

                  <button
                    className="w-full rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98] hover:opacity-95"
                    onClick={() => handleJoin()}
                    type="button"
                  >
                    Join Battle Lobby
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW B: INSIDE ACTIVE ROOM LOBBY */}
          {currentRoom && countdownNum === null && currentRoom.status === "lobby" && (
            <div className="mt-6 flex flex-col gap-6 font-mono">
              {/* Room Code & Share Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/[0.05] p-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                    Room Code & Invitation
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-black text-foreground tracking-widest">
                      {currentRoom.roomId}
                    </span>
                    <button
                      className="rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/25"
                      onClick={handleCopyCode}
                      type="button"
                    >
                      {copiedCode ? "Copied Code ✓" : "Copy Code"}
                    </button>
                    <button
                      className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20"
                      onClick={handleCopyLink}
                      type="button"
                    >
                      {copiedLink ? "Copied Link ✓" : "Copy Link"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">
                    Mode: {currentRoom.mode === "time" ? `${currentRoom.modeDetail}s Time` : `${currentRoom.modeDetail} Words`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({currentRoom.players.length} / {currentRoom.maxPlayers} Joined)
                  </span>
                </div>
              </div>

              {/* Players Grid (Slots 1 to 5+) */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                  Joined Competitors ({currentRoom.players.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentRoom.players.map((player) => (
                    <div
                      key={player.uid}
                      className="flex items-center justify-between rounded-2xl border border-border/80 bg-background p-3.5 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            {player.name}
                            {player.isHost && (
                              <Crown size={14} className="text-amber-400" weight="fill" />
                            )}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {player.isHost ? "Host" : "Competitor"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                          player.isReady
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {player.isReady ? "Ready ✓" : "Waiting..."}
                      </span>
                    </div>
                  ))}

                  {/* Empty Slots */}
                  {Array.from({
                    length: Math.max(0, currentRoom.maxPlayers - currentRoom.players.length),
                  }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/30 p-3.5 text-muted-foreground/40 text-xs"
                    >
                      <span>Open Slot {currentRoom.players.length + i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lobby Action Buttons */}
              <div className="flex items-center justify-between border-t border-border/50 pt-4">
                <button
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => setCurrentRoom(null)}
                  type="button"
                >
                  Leave Lobby
                </button>

                {myPlayer?.isHost ? (
                  <button
                    className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98] hover:opacity-95"
                    onClick={handleHostStart}
                    type="button"
                  >
                    <Play size={16} weight="fill" />
                    <span>Start Competition (3-2-1)</span>
                  </button>
                ) : (
                  <button
                    className={`rounded-2xl px-6 py-2.5 text-xs font-bold transition-all ${
                      myPlayer?.isReady
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-primary text-primary-foreground shadow-md"
                    }`}
                    onClick={handleToggleReady}
                    type="button"
                  >
                    {myPlayer?.isReady ? "You are Ready ✓" : "Mark I'm Ready"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW C: MATCH RESULTS & PODIUM STAND */}
          {currentRoom && currentRoom.status === "finished" && (
            <div className="mt-6 flex flex-col gap-6 font-mono">
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                  <Trophy size={32} weight="fill" />
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  Competition Finished!
                </h3>
                <p className="text-xs text-muted-foreground">
                  Official Match Leaderboard & Speed Progression
                </p>
              </div>

              {/* Leaderboard Table */}
              <div className="overflow-x-auto rounded-2xl border border-border/80 bg-background p-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground/60 text-[11px]">
                      <th className="pb-2 font-semibold">Rank</th>
                      <th className="pb-2 font-semibold">Player</th>
                      <th className="pb-2 font-semibold">Net WPM</th>
                      <th className="pb-2 font-semibold">Raw WPM</th>
                      <th className="pb-2 font-semibold">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {currentRoom.players
                      .slice()
                      .sort((a, b) => b.wpm - a.wpm)
                      .map((p, idx) => (
                        <tr key={p.uid} className="hover:bg-foreground/[0.02]">
                          <td className="py-2.5 font-bold">
                            {idx === 0 ? "🥇 1st" : idx === 1 ? "🥈 2nd" : idx === 2 ? "🥉 3rd" : `${idx + 1}th`}
                          </td>
                          <td className="py-2.5 font-bold text-foreground">{p.name}</td>
                          <td className="py-2.5 font-black text-primary">{p.wpm} WPM</td>
                          <td className="py-2.5 text-muted-foreground">{p.rawWpm}</td>
                          <td className="py-2.5 text-foreground">{p.accuracy}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-foreground/5"
                  onClick={() => setCurrentRoom(null)}
                  type="button"
                >
                  Back to Lobby
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
