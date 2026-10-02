"use client";

import {
  Check,
  Copy,
  Funnel,
  Globe,
  Pencil,
  Shield,
  Trash,
  User,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  formatTimeTyping,
  getStoredUserStats,
  type UserStatsSummary,
} from "@/lib/user-stats";

function AccountContent() {
  const searchParams = useSearchParams();
  const { user, isLoggedIn, signInWithGoogle, logout, updateProfile } = useAuth();
  const [stats, setStats] = useState<UserStatsSummary | null>(null);

  const tabParam = searchParams.get("tab") || "stats";
  const [activeTab, setActiveTab] = useState<"stats" | "friends" | "settings">(
    (tabParam as "stats" | "friends" | "settings") || "stats"
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all time");

  // Edit Profile State
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (tabParam && ["stats", "friends", "settings"].includes(tabParam)) {
      setActiveTab(tabParam as "stats" | "friends" | "settings");
    }
  }, [tabParam]);

  useEffect(() => {
    setStats(getStoredUserStats());
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.username);
      setEditBio(user.bio || "");
    }
  }, [user]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/account?user=${user?.username || "me"}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) return;
    updateProfile({ username: editName, bio: editBio });
    setIsEditing(false);
  };

  const pbTime = stats?.personalBests.time || {
    "15": { wpm: 0, accuracy: 0 },
    "30": { wpm: 0, accuracy: 0 },
    "60": { wpm: 0, accuracy: 0 },
    "120": { wpm: 0, accuracy: 0 },
  };

  const pbWords = stats?.personalBests.words || {
    "10": { wpm: 0, accuracy: 0 },
    "25": { wpm: 0, accuracy: 0 },
    "50": { wpm: 0, accuracy: 0 },
    "100": { wpm: 0, accuracy: 0 },
  };

  // If not logged in, prompt sign in cleanly
  if (!isLoggedIn || !user) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-lg">
          <UserCircle size={40} weight="duotone" />
        </div>
        <h1 className="text-2xl font-black font-mono tracking-tight text-foreground">
          Account & Stats Access
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in or create an account to view your WPM stats, personal bests, and customize your profile.
        </p>
        <button
          className="mt-6 rounded-2xl bg-primary px-6 py-2.5 font-mono text-xs font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-98"
          onClick={() => signInWithGoogle()}
          type="button"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8">
      {/* Top Banner Profile Card — Matching Monkeytype design in Image 1 */}
      <div className="relative flex w-full flex-col gap-6 rounded-3xl border border-border/80 bg-card/70 p-6 md:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Avatar + Username + Joined + Level Bar */}
          <div className="flex items-start gap-5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-foreground/[0.08] border border-foreground/15 text-foreground font-mono font-bold text-2xl shadow-inner">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
                  {user.username}
                </h1>
                <button
                  aria-label="Edit Profile"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors"
                  onClick={() => {
                    setActiveTab("settings");
                    setIsEditing(true);
                  }}
                  title="Edit Profile"
                  type="button"
                >
                  <Pencil size={16} />
                </button>
                <button
                  aria-label="Copy Profile Link"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors"
                  onClick={handleCopyLink}
                  title="Copy Profile Link"
                  type="button"
                >
                  {copiedLink ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>

              <span className="font-mono text-xs text-muted-foreground/60">
                Joined {user.joinedDate}
              </span>

              {/* Level / XP Progress bar */}
              <div className="mt-2 flex items-center gap-3">
                <span className="font-mono text-[11px] font-bold text-primary">
                  1
                </span>
                <div className="h-1.5 w-32 md:w-44 rounded-full bg-foreground/10 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.min(100, ((stats?.testsCompleted || 0) * 10) % 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/50">
                  {((stats?.testsCompleted || 0) * 10) % 100}/100
                </span>
              </div>
            </div>
          </div>

          {/* Right: Core Summary Metrics */}
          <div className="flex items-center justify-around md:justify-end gap-8 border-t md:border-t-0 border-border/50 pt-4 md:pt-0">
            <div className="flex flex-col text-center md:text-right">
              <span className="font-mono text-[11px] text-muted-foreground/60">
                tests started
              </span>
              <span className="font-mono text-3xl font-black text-foreground">
                {stats?.testsStarted || 0}
              </span>
            </div>

            <div className="flex flex-col text-center md:text-right">
              <span className="font-mono text-[11px] text-muted-foreground/60">
                tests completed
              </span>
              <span className="font-mono text-3xl font-black text-foreground">
                {stats?.testsCompleted || 0}
              </span>
            </div>

            <div className="flex flex-col text-center md:text-right">
              <span className="font-mono text-[11px] text-muted-foreground/60">
                time typing
              </span>
              <span className="font-mono text-2xl md:text-3xl font-black text-foreground">
                {formatTimeTyping(stats?.totalTimeTypingSeconds || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all ${
            activeTab === "stats"
              ? "bg-primary/20 text-primary border border-primary/30 shadow-2xs"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("stats")}
          type="button"
        >
          <span>User Stats & PBs</span>
        </button>

        <button
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all ${
            activeTab === "friends"
              ? "bg-primary/20 text-primary border border-primary/30 shadow-2xs"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("friends")}
          type="button"
        >
          <UsersThree size={16} />
          <span>Friends</span>
        </button>

        <button
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all ${
            activeTab === "settings"
              ? "bg-primary/20 text-primary border border-primary/30 shadow-2xs"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("settings")}
          type="button"
        >
          <Globe size={16} />
          <span>Account Settings & Public Profile</span>
        </button>
      </div>

      {/* TAB 1: USER STATS & PERSONAL BESTS */}
      {activeTab === "stats" && (
        <div className="flex flex-col gap-6">
          {/* Personal Bests Cards — Matching Image 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time PB Grid */}
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-md">
              <div className="grid grid-cols-4 gap-2 text-center">
                {(["15", "30", "60", "120"] as const).map((sec) => {
                  const pb = pbTime[sec];
                  return (
                    <div key={`time-${sec}`} className="flex flex-col items-center">
                      <span className="font-mono text-[11px] text-muted-foreground/60 mb-2">
                        {sec} seconds
                      </span>
                      <span className="font-mono text-xl font-extrabold text-foreground">
                        {pb?.wpm ? pb.wpm : "-"}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground/50 mt-1">
                        {pb?.wpm ? `${pb.accuracy}%` : "-"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Words PB Grid */}
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-md">
              <div className="grid grid-cols-4 gap-2 text-center">
                {(["10", "25", "50", "100"] as const).map((count) => {
                  const pb = pbWords[count];
                  return (
                    <div key={`words-${count}`} className="flex flex-col items-center">
                      <span className="font-mono text-[11px] text-muted-foreground/60 mb-2">
                        {count} words
                      </span>
                      <span className="font-mono text-xl font-extrabold text-foreground">
                        {pb?.wpm ? pb.wpm : "-"}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground/50 mt-1">
                        {pb?.wpm ? `${pb.accuracy}%` : "-"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filters Bar — Matching Image 1 */}
          <div className="flex flex-col gap-2 font-mono">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 py-1">
              <Funnel size={14} />
              <span>filters</span>
            </div>

            {/* Top row filter presets */}
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-xl border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                type="button"
              >
                all
              </button>
              <button
                className="rounded-xl border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                type="button"
              >
                current settings
              </button>
              <button
                className="rounded-xl border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                type="button"
              >
                advanced
              </button>
              <button
                className="rounded-xl border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                type="button"
              >
                save as preset
              </button>
            </div>

            {/* Time interval filter row */}
            <div className="flex flex-wrap gap-2 mt-1">
              {["last day", "last week", "last month", "last 3 months", "all time"].map(
                (filter) => (
                  <button
                    key={filter}
                    className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
                      timeFilter === filter
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "border border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setTimeFilter(filter)}
                    type="button"
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Test History List */}
          <div className="mt-2 rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-md">
            <h3 className="font-mono text-sm font-bold text-foreground mb-4">
              Test History ({stats?.history.length || 0})
            </h3>
            {!stats?.history || stats.history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <span className="font-mono text-xs">No tests recorded yet. Start typing to build your history!</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground/60 text-[11px]">
                      <th className="pb-2 font-semibold">Mode</th>
                      <th className="pb-2 font-semibold">WPM</th>
                      <th className="pb-2 font-semibold">Raw WPM</th>
                      <th className="pb-2 font-semibold">Accuracy</th>
                      <th className="pb-2 font-semibold">Consistency</th>
                      <th className="pb-2 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {stats.history.slice(0, 15).map((item) => (
                      <tr key={item.id} className="hover:bg-foreground/[0.02]">
                        <td className="py-2.5 text-foreground font-semibold">
                          {item.mode} {item.modeDetail}
                        </td>
                        <td className="py-2.5 text-primary font-bold">{item.wpm}</td>
                        <td className="py-2.5 text-muted-foreground">{item.rawWpm}</td>
                        <td className="py-2.5 text-foreground">{item.accuracy}%</td>
                        <td className="py-2.5 text-muted-foreground">{item.consistency}%</td>
                        <td className="py-2.5 text-muted-foreground/60">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FRIENDS */}
      {activeTab === "friends" && (
        <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold text-foreground">Friends & Rivals</h3>
            <button
              className="rounded-xl bg-primary/20 border border-primary/30 px-3 py-1.5 font-mono text-xs font-bold text-primary hover:bg-primary/30"
              type="button"
            >
              + Add Friend
            </button>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Connect with friends to compare typing speeds, race in real-time, and compete on personal leaderboards.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60 border border-dashed border-border/60 rounded-2xl">
            <UsersThree size={32} className="mb-2 opacity-50" />
            <span className="font-mono text-xs">No friends added yet. Share your profile link to invite friends!</span>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNT SETTINGS & PUBLIC PROFILE */}
      {activeTab === "settings" && (
        <div className="flex flex-col gap-6">
          {/* Public Profile Settings Box */}
          <div className="rounded-3xl border border-primary/30 bg-primary/[0.03] p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <Globe size={22} className="text-primary" weight="bold" />
              <h3 className="font-mono text-base font-bold text-foreground">
                Public Profile Settings
              </h3>
            </div>
            <p className="font-mono text-xs text-muted-foreground mb-4">
              Control your public profile visibility, custom URL, and leaderboard appearance.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <div>
                  <h4 className="font-mono text-xs font-bold text-foreground">
                    Public Profile Status
                  </h4>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Allow anyone with your profile link to view your typing stats and personal bests.
                  </p>
                </div>
                <button
                  className={`rounded-full px-4 py-1.5 font-mono text-xs font-bold transition-all ${
                    user.isPublic
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => updateProfile({ isPublic: !user.isPublic })}
                  type="button"
                >
                  {user.isPublic ? "Public (Active)" : "Private"}
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <div>
                  <h4 className="font-mono text-xs font-bold text-foreground">
                    Public Profile Link
                  </h4>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    arcitype.app/account?user={user.username}
                  </p>
                </div>
                <button
                  className="rounded-xl border border-foreground/15 bg-foreground/5 px-3 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-foreground/10"
                  onClick={handleCopyLink}
                  type="button"
                >
                  {copiedLink ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details Edit Form */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-md">
            <h3 className="font-mono text-sm font-bold text-foreground mb-4">
              Account Details
            </h3>

            <form className="space-y-4" onSubmit={handleSaveProfile}>
              <div>
                <label className="block font-mono text-xs font-semibold text-muted-foreground mb-1">
                  Username
                </label>
                <input
                  className="w-full max-w-md rounded-xl border border-border bg-background px-3.5 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  onChange={(e) => setEditName(e.target.value)}
                  type="text"
                  value={editName}
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-muted-foreground mb-1">
                  Email
                </label>
                <input
                  className="w-full max-w-md rounded-xl border border-border bg-background/50 px-3.5 py-2 font-mono text-xs text-muted-foreground cursor-not-allowed"
                  disabled
                  type="email"
                  value={user.email}
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-muted-foreground mb-1">
                  Bio / Status
                </label>
                <textarea
                  className="w-full max-w-md rounded-xl border border-border bg-background px-3.5 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  value={editBio}
                />
              </div>

              <div className="pt-2">
                <button
                  className="rounded-xl bg-primary px-5 py-2 font-mono text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
                  type="submit"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="rounded-3xl border border-destructive/30 bg-destructive/[0.03] p-6 backdrop-blur-md">
            <h3 className="font-mono text-sm font-bold text-destructive mb-2">
              Sign Out & Account Danger Zone
            </h3>
            <p className="font-mono text-xs text-muted-foreground mb-4">
              Sign out from this session or reset stored local typing data.
            </p>

            <button
              className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 font-mono text-xs font-bold text-destructive hover:bg-destructive/20"
              onClick={logout}
              type="button"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs">Loading Account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
