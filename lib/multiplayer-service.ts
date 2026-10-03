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
  status: "lobby" | "countdown" | "racing" | "finished";
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

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ARC-${suffix}`;
}

export function normalizeRoomCode(input: string): string {
  let cleaned = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleaned.startsWith("ARC")) {
    cleaned = `ARC${cleaned}`;
  }
  if (cleaned.length > 3 && !cleaned.includes("-")) {
    cleaned = `ARC-${cleaned.substring(3, 7)}`;
  }
  return cleaned;
}

// 1. Create a new Multiplayer Room in Firestore
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

  try {
    const roomRef = doc(db, "rooms", roomId);
    await setDoc(roomRef, roomData);
  } catch (err) {
    console.warn("Firestore offline fallback for room creation:", err);
    if (typeof window !== "undefined") {
      localStorage.setItem(`kz-room-${roomId}`, JSON.stringify(roomData));
    }
  }

  return roomId;
}

// 2. Join an existing room
export async function joinMultiplayerRoom(
  roomIdInput: string,
  user: { uid?: string; name: string; avatarUrl?: string }
): Promise<RaceRoom | null> {
  const cleanId = normalizeRoomCode(roomIdInput);
  const uid = user.uid || `anon_${Date.now()}`;

  try {
    const roomRef = doc(db, "rooms", cleanId);
    let snap = await getDoc(roomRef);

    // Fallback if not found with exact normalized string
    if (!snap.exists()) {
      const rawRef = doc(db, "rooms", roomIdInput.trim().toUpperCase());
      snap = await getDoc(rawRef);
    }

    if (!snap.exists()) {
      // Check local storage fallback
      if (typeof window !== "undefined") {
        const local = localStorage.getItem(`kz-room-${cleanId}`);
        if (local) return JSON.parse(local);
      }
      return null;
    }

    const room = snap.data() as RaceRoom;

    // Check if player already in room
    const existingPlayerIndex = room.players.findIndex(
      (p) => p.uid === uid || p.name === user.name
    );

    let updatedPlayers = [...room.players];
    if (existingPlayerIndex >= 0) {
      // Refresh user information
      updatedPlayers[existingPlayerIndex] = {
        ...updatedPlayers[existingPlayerIndex],
        name: user.name,
        avatarUrl: user.avatarUrl || updatedPlayers[existingPlayerIndex].avatarUrl,
      };
    } else {
      if (room.players.length >= room.maxPlayers) {
        throw new Error(`Room ${cleanId} is full! Maximum limit of ${room.maxPlayers} players reached.`);
      }

      const newPlayer: RacePlayer = {
        uid,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isHost: false,
        isReady: false,
        finished: false,
        wpm: 0,
        rawWpm: 0,
        accuracy: 0,
        consistency: 0,
      };
      updatedPlayers.push(newPlayer);
    }

    await updateDoc(roomRef, { players: updatedPlayers });
    return { ...room, players: updatedPlayers };
  } catch (err: any) {
    console.error("Join room error:", err);
    throw err;
  }
}

// 3. Real-time Firestore subscription
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: RaceRoom) => void
): () => void {
  const cleanId = normalizeRoomCode(roomId);
  const roomRef = doc(db, "rooms", cleanId);

  const unsubscribe = onSnapshot(
    roomRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as RaceRoom);
      }
    },
    (err) => {
      console.warn("Firestore room subscription notice:", err);
    }
  );

  return unsubscribe;
}

// 4. Toggle Ready state
export async function togglePlayerReadyState(
  roomId: string,
  uid: string
): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);
  const roomRef = doc(db, "rooms", cleanId);
  const snap = await getDoc(roomRef);

  if (snap.exists()) {
    const room = snap.data() as RaceRoom;
    const updatedPlayers = room.players.map((p) =>
      p.uid === uid || p.name === uid ? { ...p, isReady: !p.isReady } : p
    );
    await updateDoc(roomRef, { players: updatedPlayers });
  }
}

// 5. Start Race (Host triggers 3-2-1 countdown)
export async function startMultiplayerRace(roomId: string): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);
  const roomRef = doc(db, "rooms", cleanId);
  await updateDoc(roomRef, {
    status: "countdown",
    countdownStart: Date.now(),
  });
}

// 6. Update status to racing
export async function setRoomStatusRacing(roomId: string): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);
  const roomRef = doc(db, "rooms", cleanId);
  await updateDoc(roomRef, { status: "racing" });
}

// 7. Finish Race for a player
export async function finishPlayerRace(
  roomId: string,
  uid: string,
  stats: { wpm: number; rawWpm: number; accuracy: number; consistency: number }
): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);
  const roomRef = doc(db, "rooms", cleanId);
  const snap = await getDoc(roomRef);

  if (snap.exists()) {
    const room = snap.data() as RaceRoom;
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

    await updateDoc(roomRef, {
      players: updatedPlayers,
      status: newStatus,
    });
  }
}

// 8. Invite friend to room
export async function inviteFriendToRoom(
  roomId: string,
  friendName: string
): Promise<void> {
  const cleanId = normalizeRoomCode(roomId);
  const roomRef = doc(db, "rooms", cleanId);
  await updateDoc(roomRef, {
    invitedFriends: arrayUnion(friendName),
  });
}
