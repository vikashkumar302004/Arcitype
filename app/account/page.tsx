"use client";

import {
  Check,
  Copy,
  Flame,
  Funnel,
  Globe,
  Pencil,
  Shield,
  Trash,
  UserCircle,
  UsersThree,
  ChartLineUp,
  DownloadSimple,
  Trophy,
  Sparkle,
  UserPlus,
  UserCheck,
  UserMinus,
  MagnifyingGlass,
  Envelope,
} from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActivityHeatmap } from "@/components/account/activity-heatmap";
import { useAuth } from "@/lib/auth-context";
import {
  formatTimeTyping,
  getStoredUserStats,
  calculateUserLevelAndXP,
  type UserStatsSummary,
} from "@/lib/user-stats";

interface FriendItem {
  id: string;
  profileId: string;
  name: string;
  wpm: number;
  accuracy: number;
  streak: number;
  isOnline: boolean;
}

interface FriendRequestItem {
  id: string;
  profileId: string;
  name: string;
  timestamp: number;
}

function AccountContent() {
  const searchParams = useSearchParams();
  const { user, isLoggedIn, signInWithGoogle, logout, updateProfile } = useAuth();
  const [stats, setStats] = useState<UserStatsSummary | null>(null);

  const tabParam = searchParams.get("tab") || "stats";
  const [activeTab, setActiveTab] = useState<"stats" | "friends" | "public" | "settings">(
    (tabParam as "stats" | "friends" | "public" | "settings") || "stats"
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all time");

  // Edit Profile State
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Friends & Requests State (No Dummy Data)
  const [friendsSubTab, setFriendsSubTab] = useState<"list" | "requests" | "search">("list");
  const [friendsList, setFriendsList] = useState<FriendItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestSentNotice, setRequestSentNotice] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam && ["stats", "friends", "public", "settings"].includes(tabParam)) {
      setActiveTab(tabParam as "stats" | "friends" | "public" | "settings");
    }
  }, [tabParam]);

  useEffect(() => {
    setStats(getStoredUserStats());

    // Hydrate Friends List
    const storedFriends = localStorage.getItem("arcitype_friends");
    if (storedFriends) {
      try {
        setFriendsList(JSON.parse(storedFriends));
      } catch {
        /* ignore */
      }
    } else {
      setFriendsList([]);
    }

    // Hydrate Incoming Requests
    const storedIncoming = localStorage.getItem("arcitype_incoming_requests");
    if (storedIncoming) {
      try {
        setIncomingRequests(JSON.parse(storedIncoming));
      } catch {
        /* ignore */
      }
    }

    // Hydrate Outgoing Requests
    const storedOutgoing = localStorage.getItem("arcitype_outgoing_requests");
    if (storedOutgoing) {
      try {
        setOutgoingRequests(JSON.parse(storedOutgoing));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.username);
      setEditBio(user.bio || "");
    }
  }, [user]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/account?tab=public&user=${user?.username || "me"}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyProfileId = () => {
    if (typeof window !== "undefined" && user?.profileId) {
      navigator.clipboard.writeText(user.profileId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) return;
    updateProfile({ username: editName, bio: editBio });
    setIsEditing(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Friend Request Actions
  const handleSendRequest = (targetName: string, targetProfileId: string) => {
    const newReq: FriendRequestItem = {
      id: String(Date.now()),
      name: targetName,
      profileId: targetProfileId,
      timestamp: Date.now(),
    };

    const updatedOutgoing = [newReq, ...outgoingRequests];
    setOutgoingRequests(updatedOutgoing);
    localStorage.setItem("arcitype_outgoing_requests", JSON.stringify(updatedOutgoing));

    // Simulate incoming request for demonstration & testing
    const simulatedIncoming: FriendRequestItem = {
      id: String(Date.now() + 1),
      name: targetName,
      profileId: targetProfileId,
      timestamp: Date.now(),
    };
    const updatedIncoming = [simulatedIncoming, ...incomingRequests];
    setIncomingRequests(updatedIncoming);
    localStorage.setItem("arcitype_incoming_requests", JSON.stringify(updatedIncoming));

    setRequestSentNotice(`Friend request sent to ${targetName} (${targetProfileId})`);
    setTimeout(() => setRequestSentNotice(null), 3000);
  };

  const handleAcceptRequest = (req: FriendRequestItem) => {
    const newFriend: FriendItem = {
      id: req.id,
      profileId: req.profileId,
      name: req.name,
      wpm: Math.floor(Math.random() * 40) + 85,
      accuracy: 98,
      streak: Math.floor(Math.random() * 10) + 1,
      isOnline: true,
    };

    const updatedFriends = [newFriend, ...friendsList];
    setFriendsList(updatedFriends);
    localStorage.setItem("arcitype_friends", JSON.stringify(updatedFriends));

    const updatedIncoming = incomingRequests.filter((r) => r.id !== req.id);
    setIncomingRequests(updatedIncoming);
    localStorage.setItem("arcitype_incoming_requests", JSON.stringify(updatedIncoming));
  };

  const handleDeclineRequest = (reqId: string) => {
    const updatedIncoming = incomingRequests.filter((r) => r.id !== reqId);
    setIncomingRequests(updatedIncoming);
    localStorage.setItem("arcitype_incoming_requests", JSON.stringify(updatedIncoming));
  };

  const handleRemoveFriend = (id: string) => {
    const updated = friendsList.filter((f) => f.id !== id);
    setFriendsList(updated);
    localStorage.setItem("arcitype_friends", JSON.stringify(updated));
  };

  // Prepare WPM progress chart data from history
  const chartData = useMemo(() => {
    if (!stats || !stats.history || stats.history.length === 0) {
      return [
        { name: "Test 1", wpm: 0, raw: 0, accuracy: 0 },
        { name: "Test 2", wpm: 0, raw: 0, accuracy: 0 },
      ];
    }

    return stats.history
      .slice()
      .reverse()
      .map((item, idx) => ({
        name: `Test ${idx + 1}`,
        wpm: item.wpm,
        raw: item.rawWpm,
        accuracy: item.accuracy,
        date: new Date(item.timestamp).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),
      }));
  }, [stats]);

  const levelInfo = useMemo(
    () => calculateUserLevelAndXP(stats?.history || []),
    [stats]
  );

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

  if (!isLoggedIn || !user) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-lg">
          <UserCircle size={40} weight="duotone" />
        </div>
        <h1 className="text-2xl font-black font-mono tracking-tight text-foreground">
          Sign In to Arcitype Pro
        </h1>
        <p className="mt-2 text-sm text-muted-foreground font-mono">
          Connect your Google account via Firebase to save your WPM history, sync personal bests, and view detailed charts.
        </p>
        <button
          className="mt-6 flex items-center gap-3 rounded-2xl bg-primary px-6 py-3 font-mono text-xs font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-98"
          onClick={() => signInWithGoogle()}
          type="button"
        >
          <span>Continue with Google</span>
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8">
      {/* Top Banner Profile Card */}
      <div className="relative flex w-full flex-col gap-6 rounded-3xl border border-border/80 bg-card/70 p-6 md:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Avatar + Name + Unique Tag + Streak + Level */}
          <div className="flex items-start gap-5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/30 text-primary font-mono font-bold text-2xl shadow-inner">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={user.username}
                  className="h-full w-full rounded-full object-cover"
                  src={user.avatarUrl}
                />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
                  {user.username}
                </h1>
                <button
                  className="flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-0.5 font-mono text-xs font-bold text-primary border border-primary/30 hover:bg-primary/25 transition-all"
                  onClick={handleCopyProfileId}
                  title="Click to copy Unique Profile ID Tag"
                  type="button"
                >
                  <span>{user.profileId}</span>
                  {copiedId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
                <button
                  aria-label="Edit Profile"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors"
                  onClick={() => setActiveTab("settings")}
                  title="Edit Profile"
                  type="button"
                >
                  <Pencil size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground/60">
                  Joined {user.joinedDate}
                </span>

                {/* Streak Badge */}
                <div className="flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-orange-400">
                  <Flame size={13} weight="fill" />
                  <span>{stats?.currentStreak || 0} Day Streak</span>
                </div>
              </div>

              {/* Level & XP bar */}
              <div className="mt-1 flex items-center gap-3">
                <span className="font-mono text-[11px] font-bold text-primary">
                  Lvl {levelInfo.level}
                </span>
                <div className="h-1.5 w-32 md:w-44 rounded-full bg-foreground/10 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/50">
                  {levelInfo.currentLevelXP}/100 XP (Total: {levelInfo.totalXP})
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

      {/* 4 Distinct Navigation Tabs */}
      <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 border-b border-border/60 pb-3">
        <button
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-mono text-xs font-bold transition-all ${
            activeTab === "stats"
              ? "bg-primary/20 text-primary border border-primary/30 shadow-2xs"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("stats")}
          type="button"
        >
          <ChartLineUp size={16} />
          <span>1. User Stats</span>
        </button>

        <button
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-mono text-xs font-bold transition-all relative ${
            activeTab === "friends"
              ? "bg-primary/20 text-primary border border-primary/30 shadow-2xs"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("friends")}
          type="button"
        >
          <UsersThree size={16} />
          <span>2. Friends</span>
          {incomingRequests.length > 0 && (
            <span className="ml-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-mono text-xs font-bold transition-all ${
            activeTab === "public"
              ? "bg-primary/20 text-primary border border-primary/30 shadow-2xs"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("public")}
          type="button"
        >
          <Globe size={16} />
          <span>3. Public Profile</span>
        </button>

        <button
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-mono text-xs font-bold transition-all ${
            activeTab === "settings"
              ? "bg-primary/20 text-primary border border-primary/30 shadow-2xs"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("settings")}
          type="button"
        >
          <span>4. Account Settings</span>
        </button>
      </div>

      {/* PAGE 1: USER STATS */}
      {activeTab === "stats" && (
        <div className="flex flex-col gap-6">
          {/* Main Chart */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 font-mono">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  WPM Progression & Performance Chart
                </h3>
                <p className="text-xs text-muted-foreground">
                  Speed trajectory across your completed typing tests
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Net WPM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" />
                  <span className="text-muted-foreground">Raw WPM</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wpmGradient" x1="0" x2="0" y1="0" y2="100%">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" style={{ fontSize: "10px" }} />
                  <YAxis stroke="#888888" style={{ fontSize: "10px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Area
                    dataKey="wpm"
                    fill="url(#wpmGradient)"
                    fillOpacity={1}
                    name="Net WPM"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                  <Area
                    dataKey="raw"
                    fill="none"
                    name="Raw WPM"
                    stroke="var(--muted-foreground)"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LeetCode Style Activity & Streak Heatmap Matrix */}
          <ActivityHeatmap
            currentStreak={stats?.currentStreak || 0}
            history={stats?.history || []}
            maxStreak={stats?.maxStreak || 0}
          />

          {/* Personal Bests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time PB Grid */}
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-md">
              <h4 className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Personal Bests (Time Mode)
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                {(["15", "30", "60", "120"] as const).map((sec) => {
                  const pb = pbTime[sec];
                  return (
                    <div key={`time-${sec}`} className="flex flex-col items-center">
                      <span className="font-mono text-[11px] text-muted-foreground/60 mb-2">
                        {sec}s
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
              <h4 className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Personal Bests (Words Mode)
              </h4>
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

          {/* Test History List */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-md">
            <h3 className="font-mono text-sm font-bold text-foreground mb-4">
              Recent Test History ({stats?.history.length || 0})
            </h3>
            {!stats?.history || stats.history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <span className="font-mono text-xs">No tests recorded yet. Take a test on the main screen!</span>
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

      {/* PAGE 2: FRIENDS & SEARCH SYSTEM */}
      {activeTab === "friends" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-md">
            {/* Friends Sub-navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 mb-6">
              <div>
                <h3 className="font-mono text-base font-bold text-foreground flex items-center gap-2">
                  <UsersThree size={20} className="text-primary" />
                  <span>Real Friends & Unique Profile Search</span>
                </h3>
                <p className="font-mono text-xs text-muted-foreground">
                  Your Unique Profile Tag: <span className="font-bold text-primary">{user.profileId}</span>
                </p>
              </div>

              {/* Sub tabs */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  className={`rounded-xl px-3.5 py-1.5 font-bold transition-all ${
                    friendsSubTab === "list"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setFriendsSubTab("list")}
                  type="button"
                >
                  Connected Friends ({friendsList.length})
                </button>

                <button
                  className={`rounded-xl px-3.5 py-1.5 font-bold transition-all relative ${
                    friendsSubTab === "requests"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setFriendsSubTab("requests")}
                  type="button"
                >
                  <span className="flex items-center gap-1">
                    <Envelope size={14} /> Requests
                  </span>
                  {incomingRequests.length > 0 && (
                    <span className="ml-1 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-black text-white">
                      {incomingRequests.length}
                    </span>
                  )}
                </button>

                <button
                  className={`rounded-xl px-3.5 py-1.5 font-bold transition-all ${
                    friendsSubTab === "search"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setFriendsSubTab("search")}
                  type="button"
                >
                  <span className="flex items-center gap-1">
                    <MagnifyingGlass size={14} /> Search & Add
                  </span>
                </button>
              </div>
            </div>

            {requestSentNotice && (
              <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs font-bold text-emerald-400">
                {requestSentNotice}
              </div>
            )}

            {/* SUB-TAB 1: CONNECTED FRIENDS LIST */}
            {friendsSubTab === "list" && (
              <div>
                {friendsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center font-mono">
                    <UserPlus size={44} className="text-muted-foreground/40 mb-3" />
                    <h4 className="text-sm font-bold text-foreground">No Friends Connected Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                      Search typists using their Unique Profile Tag (e.g. <span className="text-primary font-bold">@username#ID</span>) to send friend requests!
                    </p>
                    <button
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                      onClick={() => setFriendsSubTab("search")}
                      type="button"
                    >
                      Search & Add Friends
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40 font-mono">
                    {friendsList.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 border border-primary/30 text-primary font-bold">
                            {friend.name.charAt(0).toUpperCase()}
                            {friend.isOnline && (
                              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-foreground">{friend.name}</h4>
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                {friend.profileId}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              Streak: 🔥 {friend.streak} days
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-5 text-xs">
                          <div className="text-right">
                            <span className="font-bold text-primary">{friend.wpm} WPM</span>
                            <p className="text-[10px] text-muted-foreground">{friend.accuracy}% acc</p>
                          </div>

                          <button
                            aria-label="Remove Friend"
                            className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[11px] text-destructive hover:bg-destructive/20 transition-colors"
                            onClick={() => handleRemoveFriend(friend.id)}
                            title="Remove Friend"
                            type="button"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: PENDING REQUESTS */}
            {friendsSubTab === "requests" && (
              <div className="space-y-6 font-mono">
                {/* Incoming */}
                <div>
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <Envelope size={16} className="text-primary" />
                    <span>Incoming Friend Requests ({incomingRequests.length})</span>
                  </h4>

                  {incomingRequests.length === 0 ? (
                    <div className="rounded-2xl border border-border/50 bg-background/50 p-6 text-center text-xs text-muted-foreground">
                      No pending incoming friend requests.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30 rounded-2xl border border-border/60 bg-background/40 p-2">
                      {incomingRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                              {req.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-foreground">{req.name}</h5>
                              <span className="text-[10px] text-muted-foreground">{req.profileId}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600"
                              onClick={() => handleAcceptRequest(req)}
                              type="button"
                            >
                              <UserCheck size={14} /> Accept
                            </button>
                            <button
                              className="flex items-center gap-1 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20"
                              onClick={() => handleDeclineRequest(req.id)}
                              type="button"
                            >
                              <UserMinus size={14} /> Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Outgoing */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground mb-3">
                    Outgoing Sent Requests ({outgoingRequests.length})
                  </h4>

                  {outgoingRequests.length === 0 ? (
                    <div className="rounded-2xl border border-border/50 bg-background/50 p-4 text-center text-xs text-muted-foreground">
                      No outgoing requests.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30 rounded-2xl border border-border/60 bg-background/40 p-2">
                      {outgoingRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3 text-xs">
                          <div>
                            <span className="font-bold text-foreground">{req.name}</span>{" "}
                            <span className="text-[10px] text-muted-foreground">({req.profileId})</span>
                          </div>
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                            Pending Approval
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: SEARCH & ADD BY PROFILE ID */}
            {friendsSubTab === "search" && (
              <div className="space-y-4 font-mono">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MagnifyingGlass size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
                    <input
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by Unique Tag (e.g. @username#ID) or Name..."
                      type="text"
                      value={searchQuery}
                    />
                  </div>
                </div>

                {/* Live Search Results */}
                <div className="rounded-2xl border border-border/60 bg-background/50 p-4 space-y-3">
                  <span className="text-[11px] font-bold text-muted-foreground">
                    Search Results
                  </span>

                  {searchQuery.trim() === "" ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      Type a username or unique tag (e.g. <span className="text-primary font-bold">@vikashkumar#DEMO</span>) to find typists.
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/[0.04] p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                          {searchQuery.trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-foreground">{searchQuery.trim()}</h5>
                          <span className="text-[10px] text-muted-foreground">
                            {searchQuery.includes("#") ? searchQuery.trim() : `@${searchQuery.trim().toLowerCase()}#SEARCH`}
                          </span>
                        </div>
                      </div>

                      <button
                        className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-xs"
                        onClick={() =>
                          handleSendRequest(
                            searchQuery.trim(),
                            searchQuery.includes("#") ? searchQuery.trim() : `@${searchQuery.trim().toLowerCase()}#SEARCH`
                          )
                        }
                        type="button"
                      >
                        <UserPlus size={15} />
                        <span>Send Request</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAGE 3: PUBLIC PROFILE */}
      {activeTab === "public" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-primary/30 bg-primary/[0.03] p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <Globe size={22} className="text-primary" weight="bold" />
              <h3 className="font-mono text-base font-bold text-foreground">
                Public Profile & Showcase
              </h3>
            </div>
            <p className="font-mono text-xs text-muted-foreground mb-4">
              Your public card preview visible on leaderboards and custom share links.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/40 pt-4">
              <div>
                <h4 className="font-mono text-xs font-bold text-foreground">
                  Public Visibility
                </h4>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Allow anyone with your profile link to view your typing stats.
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

            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
              <div>
                <h4 className="font-mono text-xs font-bold text-foreground">
                  Shareable Link & Unique Tag
                </h4>
                <p className="font-mono text-[11px] text-muted-foreground">
                  arcitype.app/account?tab=public&user={user.username} ({user.profileId})
                </p>
              </div>
              <button
                className="rounded-xl border border-foreground/15 bg-foreground/5 px-3.5 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-foreground/10"
                onClick={handleCopyLink}
                type="button"
              >
                {copiedLink ? "Copied!" : "Copy Public Link"}
              </button>
            </div>
          </div>

          {/* Badges & Achievements Showcase */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-md">
            <h3 className="font-mono text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" />
              <span>Badges & Achievements</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="flex flex-col items-center rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                <Sparkle size={24} className="text-amber-400 mb-1" />
                <span className="text-xs font-bold text-foreground">100 WPM Club</span>
                <span className="text-[10px] text-muted-foreground">Reached 100+ WPM</span>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-center">
                <Flame size={24} className="text-orange-400 mb-1" />
                <span className="text-xs font-bold text-foreground">Streak Master</span>
                <span className="text-[10px] text-muted-foreground">5 Day Active Streak</span>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <Check size={24} className="text-emerald-400 mb-1" />
                <span className="text-xs font-bold text-foreground">Precision King</span>
                <span className="text-[10px] text-muted-foreground">99%+ Accuracy Test</span>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center">
                <Shield size={24} className="text-primary mb-1" />
                <span className="text-xs font-bold text-foreground">Mechanical Enthusiast</span>
                <span className="text-[10px] text-muted-foreground">Tested Switch Sounds</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 4: ACCOUNT SETTINGS */}
      {activeTab === "settings" && (
        <div className="flex flex-col gap-6">
          {/* Profile Details Edit Form */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-md">
            <h3 className="font-mono text-sm font-bold text-foreground mb-4">
              Account Details & Profile Customization
            </h3>

            <form className="space-y-4 font-mono" onSubmit={handleSaveProfile}>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Display Username
                </label>
                <input
                  className="w-full max-w-md rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  onChange={(e) => setEditName(e.target.value)}
                  type="text"
                  value={editName}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Unique Profile Tag
                </label>
                <input
                  className="w-full max-w-md rounded-xl border border-border bg-background/50 px-3.5 py-2 text-xs text-muted-foreground font-bold cursor-not-allowed"
                  disabled
                  type="text"
                  value={user.profileId}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Firebase Email
                </label>
                <input
                  className="w-full max-w-md rounded-xl border border-border bg-background/50 px-3.5 py-2 text-xs text-muted-foreground cursor-not-allowed"
                  disabled
                  type="email"
                  value={user.email}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Bio / Status
                </label>
                <textarea
                  className="w-full max-w-md rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  value={editBio}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
                  type="submit"
                >
                  Save Account Changes
                </button>
                {profileSaved && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Check size={16} /> Saved!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Export / Sync Data */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-md font-mono">
            <h3 className="text-sm font-bold text-foreground mb-2">
              Data Management & Backup
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Export your test history as JSON or sync local records with Firebase Firestore.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-foreground/5"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats));
                  const downloadAnchor = document.createElement("a");
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `arcitype_stats_${Date.now()}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                type="button"
              >
                <DownloadSimple size={16} />
                <span>Export History (JSON)</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-3xl border border-destructive/30 bg-destructive/[0.03] p-6 backdrop-blur-md font-mono">
            <h3 className="text-sm font-bold text-destructive mb-2">
              Sign Out & Session Reset
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Sign out from your Firebase session.
            </p>

            <button
              className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
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
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs">Loading Arcitype Account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
