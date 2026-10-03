"use client";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateWords } from "@/lib/words";
import { getQuote } from "@/lib/quotes";

export interface RacePlayer {
  uid: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  isReady: boolean;
  finished: boolean;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  finishTime?: number;
}

export interface RaceRoom {
  roomId: string;
  hostUid: string;
  hostName: string;
  status: "lobby" | "countdown" | "racing" | "finished" | "disbanded";
  mode: "time" | "words" | "quote" | "code";
  modeDetail: string; // "15", "30", "60" | "10", "25", "50", "100"
  maxPlayers: number;
  players: RacePlayer[];
  raceWords: string[];
  quoteAuthor?: string;
  createdAt: number;
  countdownStart?: number;
  invitedFriends?: string[];
}

// Generate pure 6-digit numeric room code (NO hyphens, NO letters)
export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function normalizeRoomCode(input: string): string {
  if (!input) return "";
  let raw = input.trim();

  // Extract code if user pasted a full URL
  if (raw.includes("room=") || raw.includes("ROOM=")) {
    const parts = raw.split(/room=/i);
    if (parts[1]) {
      raw = parts[1].split("&")[0];
    }
  }

  // Strip all non-digit and non-alphanumeric characters
  raw = raw.replace(/[^0-9A-Z]/gi, "").toUpperCase();
  return raw;
}

// Local storage + BroadcastChannel helper for 0ms cross-tab real-time sync
function saveLocalRoom(room: RaceRoom) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`arc-room-${room.roomId}`, JSON.stringify(room));

      // Save in active rooms index map
      const indexStr = localStorage.getItem("arc-rooms-index");
      const index = indexStr ? JSON.parse(indexStr) : {};
      index[room.roomId] = room;
      localStorage.setItem("arc-rooms-index", JSON.stringify(index));

      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("arc_room_sync");
        bc.postMessage(room);
        bc.close();
      }
    } catch (e) {
      /* ignore */
    }
  }
}

function getLocalRoom(roomId: string): RaceRoom | null {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(`arc-room-${roomId}`);
      if (data) return JSON.parse(data);

      const indexStr = localStorage.getItem("arc-rooms-index");
      if (indexStr) {
        const index = JSON.parse(indexStr);
        if (index[roomId]) return index[roomId];
      }
    } catch (e) {
      /* ignore */
    }
  }
  return null;
}

// Global P2P Mesh responder across browser tabs
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    const bcMesh = new BroadcastChannel("arc_p2p_mesh");
    bcMesh.onmessage = (event) => {
      if (event.data && event.data.type === "REQUEST_ROOM" && event.data.roomId) {
        const room = getLocalRoom(event.data.roomId);
        if (room) {
          bcMesh.postMessage({ type: "PROVIDE_ROOM", room });
        }
      }
    };
  } catch (e) {
    /* ignore */
  }
}

function queryRoomOverBroadcast(roomId: string): Promise<RaceRoom | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      resolve(null);
      return;
    }

    try {
      const bc = new BroadcastChannel("arc_p2p_mesh");
      let resolved = false;

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          bc.close();
          resolve(null);
        }
      }, 300);

      bc.onmessage = (event) => {
        if (
          event.data &&
          event.data.type === "PROVIDE_ROOM" &&
          event.data.room &&
          event.data.room.roomId === roomId
        ) {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            bc.close();
            saveLocalRoom(event.data.room);
            resolve(event.data.room);
          }
        }
      };

      bc.postMessage({ type: "REQUEST_ROOM", roomId });
    } catch {
      resolve(null);
    }
  });
}

// 1. Create a new Multiplayer Room
export async function createMultiplayerRoom(
  hostUser: { uid?: string; name: string; avatarUrl?: string },
  settings: {
    mode: "time" | "words" | "quote" | "code";
    modeDetail: string;
    maxPlayers: number;
  }
): Promise<string> {
  const roomId = generateRoomCode();
  const uid = hostUser.uid || `anon_${Date.now()}`;

  // Generate exact paragraph / words for all competitors in this room
  let raceWords: string[] = [];
  let quoteAuthor: string | undefined = undefined;

  if (settings.mode === "quote") {
    const q = getQuote(settings.modeDetail as any);
    raceWords = q.words;
    quoteAuthor = q.author;
  } else {
    const wordCount =
      settings.mode === "words"
        ? parseInt(settings.modeDetail, 10) || 25
        : settings.modeDetail === "15"
          ? 40
          : settings.modeDetail === "30"
            ? 70
            : 120;
    raceWords = generateWords(wordCount);
  }

  const hostPlayer: RacePlayer = {
    uid,
    name: hostUser.name,
    avatarUrl: hostUser.avatarUrl,
    isHost: true,
    isReady: true,
    finished: false,
    wpm: 0,
    rawWpm: 0,
    accuracy: 0,
    consistency: 0,
  };

  const roomData: RaceRoom = {
    roomId,
    hostUid: uid,
    hostName: hostUser.name,
    status: "lobby",
    mode: settings.mode,
    modeDetail: settings.modeDetail,
    maxPlayers: settings.maxPlayers || 5,
    players: [hostPlayer],
    raceWords,
    quoteAuthor,
    createdAt: Date.now(),
    invitedFriends: [],
  };

  saveLocalRoom(roomData);

  // Sync with Server API
  try {
    await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", room: roomData }),
    });
  } catch (err) {
    console.warn("API room creation notice:", err);
  }

  // Sync with Firestore
  try {
    const roomRef = doc(db, "rooms", roomId);
    await setDoc(roomRef, roomData);
  } catch (err) {
    console.warn("Firestore offline fallback for room creation:", err);
  }

  return roomId;
}

// 2. Join an existing room
export async function joinMultiplayerRoom(
  roomIdInput: string,
  user: { uid?: string; name: string; avatarUrl?: string }
): Promise<RaceRoom | null> {
  const cleanId = normalizeRoomCode(roomIdInput);
  if (!cleanId) return null;
  const uid = user.uid || `anon_${Date.now()}`;

  let room: RaceRoom | null = null;

  // Fetch local or broadcast first to check host status
  const existingLocal = getLocalRoom(cleanId);
  const isHostPlayer =
    (existingLocal && (existingLocal.hostUid === uid || existingLocal.hostName === user.name)) ||
    false;

  const newPlayer: RacePlayer = {
    uid,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isHost: isHostPlayer,
    isReady: isHostPlayer ? true : false,
    finished: false,
    wpm: 0,
    rawWpm: 0,
    accuracy: 0,
    consistency: 0,
  };

  // Step 1: Try Server API
  try {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "join",
        roomId: cleanId,
        player: newPlayer,
      }),
    });
    if (res.ok) {
      room = await res.json();
    }
  } catch (e) {
    console.warn("API join notice:", e);
  }

  // Step 2: Try Firestore
  if (!room) {
    try {
      const roomRef = doc(db, "rooms", cleanId);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        room = snap.data() as RaceRoom;
        
        const isHost =
          room.hostUid === uid ||
          room.hostName === user.name ||
          (room.players && room.players[0] && (room.players[0].uid === uid || room.players[0].name === user.name && room.players[0].isHost));

        const idx = room.players.findIndex((p) => p.uid === uid || p.name === user.name);
        if (idx >= 0) {
          room.players[idx] = {
            ...room.players[idx],
            ...newPlayer,
            isHost: isHost || room.players[idx].isHost,
            isReady: isHost ? true : room.players[idx].isReady,
          };
        } else {
          if (room.players.length >= room.maxPlayers) {
            throw new Error(`Room ${cleanId} is full! Maximum limit of ${room.maxPlayers} players reached.`);
          }
          room.players.push({
            ...newPlayer,
            isHost: !!isHost,
            isReady: isHost ? true : false,
          });
        }

        try {
          await updateDoc(roomRef, { players: room.players });
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      console.warn("Firestore getDoc notice:", err);
    }
  }

  // Step 3: Local Storage index & keys fallback
  if (!room) {
    const local = getLocalRoom(cleanId);
    if (local) {
      room = local;
      const isHost =
        room.hostUid === uid ||
        room.hostName === user.name ||
        (room.players && room.players[0] && (room.players[0].uid === uid || room.players[0].name === user.name && room.players[0].isHost));

      const idx = room.players.findIndex((p) => p.uid === uid || p.name === user.name);
      if (idx >= 0) {
        room.players[idx] = {
          ...room.players[idx],
          ...newPlayer,
          isHost: isHost || room.players[idx].isHost,
          isReady: isHost ? true : room.players[idx].isReady,
        };
      } else {
        if (room.players.length >= room.maxPlayers) {
          throw new Error(`Room ${cleanId} is full! Maximum limit of ${room.maxPlayers} players reached.`);
        }
        room.players.push({
          ...newPlayer,
          isHost: !!isHost,
          isReady: isHost ? true : false,
        });
      }
    }
  }

  // Step 4: P2P Broadcast Mesh Ping/Pong
  if (!room && typeof window !== "undefined") {
    const meshRoom = await queryRoomOverBroadcast(cleanId);
    if (meshRoom) {
      room = meshRoom;
      const isHost =
        room.hostUid === uid ||
        room.hostName === user.name ||
        (room.players && room.players[0] && (room.players[0].uid === uid || room.players[0].name === user.name && room.players[0].isHost));

      const idx = room.players.findIndex((p) => p.uid === uid || p.name === user.name);
      if (idx >= 0) {
        room.players[idx] = {
          ...room.players[idx],
          ...newPlayer,
          isHost: isHost || room.players[idx].isHost,
          isReady: isHost ? true : room.players[idx].isReady,
        };
      } else {
        if (room.players.length >= room.maxPlayers) {
          throw new Error(`Room ${cleanId} is full! Maximum limit of ${room.maxPlayers} players reached.`);
        }
        room.players.push({
          ...newPlayer,
          isHost: !!isHost,
          isReady: isHost ? true : false,
        });
      }
    }
  }

  if (!room) {
    return null;
  }

  saveLocalRoom(room);
  return room;
}

// 3. Real-time subscription (Server API Polling + BroadcastChannel + Firestore)
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: RaceRoom) => void
): () => void {
  const cleanId = normalizeRoomCode(roomId);
  const roomRef = doc(db, "rooms", cleanId);

  // Initial local sync check
  const initialLocal = getLocalRoom(cleanId);
  if (initialLocal) {
    onUpdate(initialLocal);
  }

  // Polling Server API every 800ms for active real-time updates across tabs/browsers
  const intervalId = setInterval(async () => {
    try {
      const res = await fetch(`/api/rooms?code=${cleanId}`);
      if (res.ok) {
        const serverRoom = await res.json();
        saveLocalRoom(serverRoom);
        onUpdate(serverRoom);
      }
    } catch {
      /* ignore */
    }
  }, 800);

  // Cross-tab BroadcastChannel subscription
  let bc: BroadcastChannel | null = null;
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      bc = new BroadcastChannel("arc_room_sync");
      bc.onmessage = (event) => {
        if (event.data && event.data.roomId === cleanId) {
          onUpdate(event.data as RaceRoom);
        }
      };
    } catch {
      /* ignore */
    }
  }

  // Firestore subscription
  const unsubscribeFirestore = onSnapshot(
    roomRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const roomData = docSnap.data() as RaceRoom;
        saveLocalRoom(roomData);
        onUpdate(roomData);
      }
    },
    (err) => {
      console.warn("Firestore room subscription notice:", err);
    }
  );

  return () => {
    clearInterval(intervalId);
    unsubscribeFirestore();
    if (bc) bc.close();
  };
}

// 4. Toggle Ready state
export async function togglePlayerReadyState(
  roomId: string,
  uid: string
): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);
  
  // API update
  try {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleReady", roomId: cleanId, uid }),
    });
    if (res.ok) {
      const updated = await res.json();
      saveLocalRoom(updated);
    }
  } catch {
    /* ignore */
  }

  // Local & Firestore backup
  const room = getLocalRoom(cleanId);
  if (room) {
    const updatedPlayers = room.players.map((p) =>
      p.uid === uid || p.name === uid ? { ...p, isReady: !p.isReady } : p
    );
    const updatedRoom: RaceRoom = { ...room, players: updatedPlayers };
    saveLocalRoom(updatedRoom);

    try {
      const roomRef = doc(db, "rooms", cleanId);
      await updateDoc(roomRef, { players: updatedPlayers });
    } catch {
      /* ignore */
    }
  }
}

// 5. Start Race (Host triggers 3-2-1 countdown)
export async function startMultiplayerRace(roomId: string): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);

  // API update
  try {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "startRace", roomId: cleanId }),
    });
    if (res.ok) {
      const updated = await res.json();
      saveLocalRoom(updated);
    }
  } catch {
    /* ignore */
  }

  const room = getLocalRoom(cleanId);
  if (room) {
    const updatedRoom: RaceRoom = {
      ...room,
      status: "countdown",
      countdownStart: Date.now(),
    };
    saveLocalRoom(updatedRoom);

    try {
      const roomRef = doc(db, "rooms", cleanId);
      await updateDoc(roomRef, {
        status: "countdown",
        countdownStart: Date.now(),
      });
    } catch {
      /* ignore */
    }
  }
}

// 6. Update status to racing
export async function setRoomStatusRacing(roomId: string): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);

  try {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setRacing", roomId: cleanId }),
    });
    if (res.ok) {
      const updated = await res.json();
      saveLocalRoom(updated);
    }
  } catch {
    /* ignore */
  }

  const room = getLocalRoom(cleanId);
  if (room) {
    const updatedRoom: RaceRoom = { ...room, status: "racing" };
    saveLocalRoom(updatedRoom);

    try {
      const roomRef = doc(db, "rooms", cleanId);
      await updateDoc(roomRef, { status: "racing" });
    } catch {
      /* ignore */
    }
  }
}

// 7. Finish Race for a player
export async function finishPlayerRace(
  roomId: string,
  uid: string,
  stats: { wpm: number; rawWpm: number; accuracy: number; consistency: number }
): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);

  try {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "finishPlayer", roomId: cleanId, uid, stats }),
    });
    if (res.ok) {
      const updated = await res.json();
      saveLocalRoom(updated);
    }
  } catch {
    /* ignore */
  }

  const room = getLocalRoom(cleanId);
  if (room) {
    const updatedPlayers = room.players.map((p) =>
      p.uid === uid || p.name === uid
        ? {
            ...p,
            finished: true,
            wpm: stats.wpm,
            rawWpm: stats.rawWpm,
            accuracy: stats.accuracy,
            consistency: stats.consistency,
            finishTime: Date.now(),
          }
        : p
    );

    const allFinished = updatedPlayers.every((p) => p.finished);
    const newStatus = allFinished ? "finished" : room.status;

    const updatedRoom: RaceRoom = {
      ...room,
      players: updatedPlayers,
      status: newStatus,
    };

    saveLocalRoom(updatedRoom);

    try {
      const roomRef = doc(db, "rooms", cleanId);
      await updateDoc(roomRef, {
        players: updatedPlayers,
        status: newStatus,
      });
    } catch {
      /* ignore */
    }
  }
}

// 8. Invite friend to room
export async function inviteFriendToRoom(
  roomId: string,
  friendName: string
): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);
  try {
    const roomRef = doc(db, "rooms", cleanId);
    await updateDoc(roomRef, {
      invitedFriends: arrayUnion(friendName),
    });
  } catch {
    /* ignore */
  }
}

// 9. Leave or Disband Room
export async function leaveMultiplayerRoom(
  roomId: string,
  user: { uid?: string; name: string }
): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);
  const uid = user.uid || `anon`;

  // Server API update
  try {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave", roomId: cleanId, uid, playerName: user.name }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.room) {
        saveLocalRoom(data.room);
      }
    }
  } catch {
    /* ignore */
  }

  // Firestore update
  try {
    const roomRef = doc(db, "rooms", cleanId);
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      const room = snap.data() as RaceRoom;
      const isHost =
        room.hostUid === uid ||
        room.hostName === user.name ||
        room.players.some((p) => (p.uid === uid || p.name === user.name) && p.isHost);

      if (isHost) {
        await updateDoc(roomRef, { status: "disbanded", players: [] });
      } else {
        const updatedPlayers = room.players.filter(
          (p) => p.uid !== uid && p.name !== user.name
        );
        await updateDoc(roomRef, { players: updatedPlayers });
      }
    }
  } catch {
    /* ignore */
  }

  // Local storage cleanup
  const room = getLocalRoom(cleanId);
  if (room) {
    const isHost =
      room.hostUid === uid ||
      room.hostName === user.name ||
      room.players.some((p) => (p.uid === uid || p.name === user.name) && p.isHost);

    if (isHost) {
      saveLocalRoom({ ...room, status: "disbanded", players: [] });
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(`arc-room-${cleanId}`);
        } catch {
          /* ignore */
        }
      }
    } else {
      const updatedPlayers = room.players.filter(
        (p) => p.uid !== uid && p.name !== user.name
      );
      saveLocalRoom({ ...room, players: updatedPlayers });
    }
  }
}
