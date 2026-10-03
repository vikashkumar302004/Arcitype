import { NextResponse } from "next/server";

// Global in-memory server store for active multiplayer rooms
const globalRooms = new Map<string, any>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Room code required" }, { status: 400 });
  }

  const room = globalRooms.get(code);
  if (!room) {
    return NextResponse.json({ error: `Room ${code} not found` }, { status: 404 });
  }

  return NextResponse.json(room);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, room, roomId, player, uid, playerName, stats } = body;

    if (action === "create") {
      globalRooms.set(room.roomId, room);
      return NextResponse.json({ success: true, room });
    }

    if (action === "get" || !action) {
      const targetId = roomId || room?.roomId;
      const existing = globalRooms.get(targetId);
      if (!existing) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }
      return NextResponse.json(existing);
    }

    if (action === "join") {
      const targetId = roomId || room?.roomId;
      const existing = globalRooms.get(targetId);
      if (!existing || existing.status === "disbanded") {
        return NextResponse.json({ error: `Room ${targetId} not found or closed` }, { status: 404 });
      }

      // Check if player exists
      const idx = existing.players.findIndex(
        (p: any) => p.uid === player.uid || (player.name && p.name === player.name)
      );

      const isHostPlayer =
        (idx >= 0 && existing.players[idx].isHost) ||
        player.uid === existing.hostUid ||
        player.name === existing.hostName;

      if (idx >= 0) {
        existing.players[idx] = {
          ...existing.players[idx],
          ...player,
          isHost: isHostPlayer,
          isReady: isHostPlayer ? true : (existing.players[idx].isReady || player.isReady),
        };
      } else {
        if (existing.players.length >= existing.maxPlayers) {
          return NextResponse.json(
            { error: `Room ${targetId} is full!` },
            { status: 400 }
          );
        }
        existing.players.push({
          ...player,
          isHost: isHostPlayer,
          isReady: isHostPlayer ? true : (player.isReady || false),
        });
      }

      globalRooms.set(targetId, existing);
      return NextResponse.json(existing);
    }

    if (action === "leave") {
      const targetId = roomId || room?.roomId;
      const existing = globalRooms.get(targetId);
      if (!existing) {
        return NextResponse.json({ success: true });
      }

      const isHost =
        existing.hostUid === uid ||
        existing.hostName === playerName ||
        existing.players.find((p: any) => (p.uid === uid || p.name === playerName) && p.isHost);

      if (isHost) {
        // Disband room for all players
        existing.status = "disbanded";
        existing.players = [];
        globalRooms.set(targetId, existing);
        setTimeout(() => globalRooms.delete(targetId), 5000);
        return NextResponse.json({ success: true, room: existing });
      } else {
        // Remove individual player
        existing.players = existing.players.filter(
          (p: any) => p.uid !== uid && p.name !== playerName
        );
        globalRooms.set(targetId, existing);
        return NextResponse.json({ success: true, room: existing });
      }
    }

    if (action === "update") {
      const targetId = roomId || room?.roomId;
      const existing = globalRooms.get(targetId);
      if (existing) {
        const updated = { ...existing, ...room };
        globalRooms.set(targetId, updated);
        return NextResponse.json(updated);
      }
    }

    if (action === "toggleReady") {
      const existing = globalRooms.get(roomId);
      if (existing) {
        existing.players = existing.players.map((p: any) =>
          p.uid === uid || p.name === uid ? { ...p, isReady: !p.isReady } : p
        );
        globalRooms.set(roomId, existing);
        return NextResponse.json(existing);
      }
    }

    if (action === "startRace") {
      const existing = globalRooms.get(roomId);
      if (existing) {
        existing.status = "countdown";
        existing.countdownStart = Date.now();
        globalRooms.set(roomId, existing);
        return NextResponse.json(existing);
      }
    }

    if (action === "setRacing") {
      const existing = globalRooms.get(roomId);
      if (existing) {
        existing.status = "racing";
        globalRooms.set(roomId, existing);
        return NextResponse.json(existing);
      }
    }

    if (action === "finishPlayer") {
      const existing = globalRooms.get(roomId);
      if (existing) {
        existing.players = existing.players.map((p: any) =>
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
        const allFinished = existing.players.every((p: any) => p.finished);
        if (allFinished) existing.status = "finished";
        globalRooms.set(roomId, existing);
        return NextResponse.json(existing);
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
