"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

// Generate random room code
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

interface Player {
  id: string;
  name: string;
  is_host: boolean;
  room_id: string;
}

export default function MultiplayerLobby() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch players for current room
  const fetchPlayers = async (currentRoomId: string) => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", currentRoomId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching players:", error);
      return;
    }

    setPlayers(data || []);
  };

  // Subscribe to player changes and room start
  useEffect(() => {
    if (!roomId) return;

    // Initial fetch
    fetchPlayers(roomId);

    // Subscribe to player changes
    const playersChannel = supabase
      .channel(`room-players-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          console.log("Player joined room");
          fetchPlayers(roomId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          console.log("Player updated in room");
          fetchPlayers(roomId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "players",
        },
        (payload) => {
          console.log("Player deleted from room", payload);
          // Note: payload.old only contains the ID for DELETE events in Supabase
          // So we just refresh the player list - fetchPlayers() already filters by roomId
          fetchPlayers(roomId);
        }
      )
      .subscribe();

    // Subscribe to room updates (for game start)
    const roomChannel = supabase
      .channel(`room-status-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          // Check if game started
          if (payload.new.started) {
            // Navigate non-host players to race page
            router.push(`/multiplayer/race?roomId=${roomId}&playerId=${playerId}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, playerId, router]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name first!");
      return;
    }

    setLoading(true);
    try {
      const newRoomCode = generateRoomCode();

      // Create room
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert({ code: newRoomCode })
        .select()
        .single();

      if (roomError) throw roomError;

      // Create player
      const { data: player, error: playerError } = await supabase
        .from("players")
        .insert({
          room_id: room.id,
          name: playerName,
          is_host: true,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      setRoomCode(newRoomCode);
      setRoomId(room.id);
      setPlayerId(player.id);
      setIsHost(true);
      setInRoom(true);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name first!");
      return;
    }
    if (!joinCode.trim()) {
      toast.error("Please enter a room code!");
      return;
    }

    setLoading(true);
    try {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", joinCode.toUpperCase())
        .single();

      if (roomError || !room) {
        toast.error("Room not found! Please check the code.");
        setLoading(false);
        return;
      }

      // Check if room already started
      if (room.started) {
        toast.error("This room has already started!");
        setLoading(false);
        return;
      }

      // Join room
      const { data: player, error: playerError } = await supabase
        .from("players")
        .insert({
          room_id: room.id,
          name: playerName,
          is_host: false,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      setRoomCode(joinCode.toUpperCase());
      setRoomId(room.id);
      setPlayerId(player.id);
      setIsHost(false);
      setInRoom(true);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success("Room code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = async () => {
    try {
      // Delete player
      await supabase.from("players").delete().eq("id", playerId);

      // If host, delete the entire room (cascade deletes all players)
      if (isHost) {
        await supabase.from("rooms").delete().eq("id", roomId);
      }

      setInRoom(false);
      setRoomCode("");
      setRoomId("");
      setJoinCode("");
      setPlayers([]);
      setIsHost(false);
      setPlayerId("");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const handleStartGame = async () => {
    try {
      // Mark room as started
      await supabase.from("rooms").update({ started: true }).eq("id", roomId);

      // Navigate to race page with room info
      router.push(`/multiplayer/race?roomId=${roomId}&playerId=${playerId}`);
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("Failed to start game. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[#323437] px-4 py-8 text-[#e8e6df]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#f5c542] opacity-5 blur-[120px]"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#f5c542] to-[#e2b714] text-xl shadow-lg shadow-[#f5c542]/20">
              ⌨️
            </div>
            <span className="text-lg font-semibold text-[#e8e6df]">
              TypeSprint
            </span>
          </Link>
          <span className="rounded-lg bg-[#2c2e31] px-4 py-2 text-sm font-semibold text-[#f5c542]">
            Multiplayer Lobby
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex w-full max-w-3xl flex-col items-center justify-center gap-8">
        {!inRoom ? (
          // Lobby Selection Screen
          <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="bg-linear-to-br from-[#e8e6df] via-[#f5c542] to-[#e8e6df] bg-clip-text text-5xl font-bold tracking-tight text-transparent">
                Multiplayer Lobby
              </h1>
              <p className="text-lg text-[#9b9d9f]">
                Create a room or join with a code
              </p>
            </div>

            {/* Player Name Input */}
            <div className="w-full rounded-2xl border-2 border-[#3a3d40] bg-linear-to-br from-[#2c2e31]/80 to-[#252729]/80 p-8 shadow-2xl backdrop-blur-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#f5c542]">
                <span>👤</span> Your Name
              </h2>
              <p className="mb-4 text-sm text-[#9b9d9f]">
                Enter your display name for the game
              </p>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full rounded-xl border-2 border-[#3a3d40] bg-[#1f2123] px-6 py-3 text-lg text-[#e8e6df] placeholder-[#7a7c7f] outline-none transition-all focus:border-[#f5c542]"
                maxLength={20}
              />
            </div>

            {/* Create Room */}
            <div className="w-full rounded-2xl border-2 border-[#3a3d40] bg-linear-to-br from-[#2c2e31]/80 to-[#252729]/80 p-8 shadow-2xl backdrop-blur-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#f5c542]">
                <span>🎮</span> Create New Room
              </h2>
              <p className="mb-4 text-sm text-[#9b9d9f]">
                Start a new room and invite friends to join
              </p>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl border-2 border-[#f5c542]/40 bg-linear-to-br from-[#3a3d40] to-[#2c2e31] px-8 py-4 text-lg font-semibold text-[#e8e6df] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:border-[#f5c542] hover:shadow-2xl hover:shadow-[#f5c542]/20 disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-linear-to-br from-[#f5c542] to-[#e2b714] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#1a1b1d]">
                  {loading ? "Creating..." : "Create Room"}
                </span>
              </button>
            </div>

            {/* Join Room */}
            <div className="w-full rounded-2xl border-2 border-[#3a3d40] bg-linear-to-br from-[#2c2e31]/80 to-[#252729]/80 p-8 shadow-2xl backdrop-blur-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#f5c542]">
                <span>🔗</span> Join Existing Room
              </h2>
              <p className="mb-4 text-sm text-[#9b9d9f]">
                Enter a room code to join a friend's game
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  className="flex-1 rounded-xl border-2 border-[#3a3d40] bg-[#1f2123] px-6 py-3 text-center text-lg uppercase tracking-wider text-[#e8e6df] placeholder-[#7a7c7f] outline-none transition-all focus:border-[#f5c542]"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={loading}
                  className="group relative overflow-hidden rounded-xl border-2 border-[#f5c542]/40 bg-linear-to-br from-[#3a3d40] to-[#2c2e31] px-8 py-3 text-lg font-semibold text-[#e8e6df] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:border-[#f5c542] hover:shadow-2xl hover:shadow-[#f5c542]/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-[#f5c542] to-[#e2b714] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-[#1a1b1d]">
                    {loading ? "Joining..." : "Join"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Room Screen
          <div className="flex w-full flex-col gap-8">
            {/* Room Code Display */}
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="bg-linear-to-br from-[#e8e6df] via-[#f5c542] to-[#e8e6df] bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Room Code
              </h1>
              <div className="flex items-center gap-4">
                <div className="rounded-2xl border-2 border-[#f5c542] bg-[#2c2e31] px-8 py-4">
                  <span className="text-4xl font-bold tracking-wider text-[#f5c542]">
                    {roomCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="group relative overflow-hidden rounded-xl border-2 border-[#f5c542]/40 bg-linear-to-br from-[#3a3d40] to-[#2c2e31] px-6 py-4 text-lg font-semibold text-[#e8e6df] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:border-[#f5c542]"
                  title="Copy room code"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-[#f5c542] to-[#e2b714] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-[#1a1b1d]">
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </span>
                </button>
              </div>
              <p className="text-sm text-[#9b9d9f]">
                Share this code with friends to invite them
              </p>
            </div>

            {/* Players List */}
            <div className="w-full rounded-2xl border-2 border-[#3a3d40] bg-linear-to-br from-[#2c2e31]/80 to-[#252729]/80 p-8 shadow-2xl backdrop-blur-sm">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-[#f5c542]">
                <span>👥</span> Players ({players.length})
              </h2>
              <div className="space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-xl bg-[#323437]/50 p-4 transition-colors hover:bg-[#323437]/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5c542]/20 text-lg">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-lg font-semibold text-[#e8e6df]">
                        {player.name}
                      </span>
                    </div>
                    {player.is_host && (
                      <span className="rounded-lg bg-[#f5c542]/20 px-3 py-1 text-sm font-semibold text-[#f5c542]">
                        Host
                      </span>
                    )}
                  </div>
                ))}
                {players.length < 4 && (
                  <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-[#9b9d9f]/30 p-4 text-[#9b9d9f]">
                    Waiting for players...
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleLeaveRoom}
                className="flex-1 rounded-xl border-2 border-[#ff6b6b] bg-[#2c2e31] px-8 py-4 text-lg font-semibold text-[#ff6b6b] transition-all duration-300 hover:bg-[#ff6b6b] hover:text-[#1a1b1d]"
              >
                Leave Room
              </button>
              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={players.length < 2}
                  className="group relative flex-1 overflow-hidden rounded-xl border-2 border-[#f5c542]/40 bg-linear-to-br from-[#3a3d40] to-[#2c2e31] px-8 py-4 text-lg font-semibold text-[#e8e6df] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:border-[#f5c542] hover:shadow-2xl hover:shadow-[#f5c542]/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-[#f5c542] to-[#e2b714] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-[#1a1b1d]">
                    Start Game
                  </span>
                </button>
              )}
            </div>

            {isHost && players.length < 2 && (
              <p className="text-center text-sm text-[#9b9d9f]">
                ⚠️ Need at least 2 players to start the game
              </p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl text-center">
        <div className="flex flex-col items-center gap-3 text-sm text-[#9b9d9f]">
          <p className="text-xs">Built with Next.js, TypeScript, Supabase, PostgreSQL, WebSockets & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
