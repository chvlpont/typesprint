"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SAMPLE_TEXTS } from "@/lib/constants";

// Use the first sample text for multiplayer races
const RACE_TEXT = SAMPLE_TEXTS[0];

interface Player {
  id: string;
  name: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finish_time?: string;
  is_host: boolean;
  score?: number;
}

function MultiplayerRaceContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const playerId = searchParams.get("playerId");

  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch players from database
  const fetchPlayers = async () => {
    if (!roomId) return;

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching players:", error);
      return;
    }

    setPlayers(data || []);

    // Check if ALL players have finished
    const allFinished =
      data && data.length > 0 && data.every((p) => p.finished);

    // Set winner (highest score when all finished)
    if (allFinished && !winner && data) {
      const sortedByScore = [...data].sort(
        (a, b) => (b.score || 0) - (a.score || 0)
      );
      if (sortedByScore[0]) {
        setWinner(sortedByScore[0].name);
      }
    }

    // Only show results when ALL players have finished
    if (allFinished && !raceFinished) {
      setTimeout(() => setRaceFinished(true), 2000);
    }
  };

  // Subscribe to player updates
  useEffect(() => {
    if (!roomId) return;

    fetchPlayers();
    inputRef.current?.focus();

    const channel = supabase
      .channel(`race-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          console.log("Player joined");
          fetchPlayers();
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
          console.log("Player updated");
          fetchPlayers();
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
          console.log("Player deleted", payload);
          // Note: payload.old only contains the ID for DELETE events in Supabase
          // So we just refresh the player list - fetchPlayers() already filters by roomId
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Start timer on first character
    if (!startTime && value.length === 1) {
      setStartTime(Date.now());
    }

    setInput(value);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === RACE_TEXT[i]) {
        correct++;
      }
    }
    const accuracy = value.length > 0 ? (correct / value.length) * 100 : 100;

    // Calculate WPM
    let wpm = 0;
    if (startTime) {
      const timeInMinutes = (Date.now() - startTime) / 1000 / 60;
      const wordsTyped = value.split(" ").length;
      wpm = Math.round(wordsTyped / timeInMinutes);
    }

    // Update player progress in database (finish at 100% progress)
    const finished = value.length === RACE_TEXT.length;

    // Calculate score: WPM × (Accuracy / 100)
    const score = finished ? Math.round(wpm * (accuracy / 100)) : 0;

    await supabase
      .from("players")
      .update({
        progress: value.length,
        wpm: wpm > 0 ? wpm : 0,
        accuracy: Math.round(accuracy),
        finished: finished,
        finish_time: finished ? new Date().toISOString() : null,
        score: score,
      })
      .eq("id", playerId);

    if (finished) {
      setIsFinished(true);
    }
  };

  const getCharacterColor = (index: number) => {
    if (index >= input.length) return "text-[#9b9d9f]"; // Not typed yet - lighter gray
    if (input[index] === RACE_TEXT[index]) return "text-[#e8e6df]"; // Correct - brighter white
    return "text-[#ff6b6b]"; // Incorrect - brighter red
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  // Calculate final rankings (sorted by score: WPM × accuracy)
  const rankedPlayers = [...players]
    .filter((p) => p.finished)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

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
            <span className="text-xl font-extrabold tracking-tight text-[#e8e6df]">
              Type<span className="text-[#f5c542]">Sprint</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[#2c2e31] px-4 py-2 text-sm font-semibold text-[#f5c542]">
              🏁 Racing
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center gap-8">
        {!raceFinished ? (
          <>
            {/* Text Display */}
            <div className="w-full rounded-2xl border-2 border-[#3a3d40] bg-linear-to-br from-[#2c2e31]/80 to-[#252729]/80 p-10 shadow-2xl backdrop-blur-sm">
              <p className="text-center text-2xl leading-relaxed tracking-wide">
                {RACE_TEXT.split("").map((char, index) => (
                  <span key={index} className={getCharacterColor(index)}>
                    {char}
                  </span>
                ))}
              </p>
            </div>

            {/* Input Box */}
            <div className="w-full">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                disabled={isFinished}
                placeholder="Start typing..."
                className="w-full rounded-xl border-2 border-[#3a3d40] bg-[#1f2123] px-6 py-4 text-xl text-[#e8e6df] placeholder-[#7a7c7f] outline-none transition-all focus:border-[#f5c542] disabled:opacity-50"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>

            {/* Players Progress */}
            <div className="w-full space-y-4">
              <h2 className="text-xl font-semibold text-[#f5c542]">
                Live Race Progress
              </h2>
              {players.map((player, index) => {
                const progressPercent =
                  (player.progress / RACE_TEXT.length) * 100;
                const isCurrentPlayer = player.id === playerId;

                return (
                  <div
                    key={player.id}
                    className={`rounded-xl border-2 ${
                      isCurrentPlayer
                        ? "border-[#f5c542] bg-[#2c2e31]/80"
                        : "border-[#3a3d40] bg-[#2c2e31]/50"
                    } p-6 transition-all`}
                  >
                    {/* Player Info */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isCurrentPlayer
                              ? "bg-[#f5c542]/30"
                              : "bg-[#9b9d9f]/30"
                          } text-lg font-bold`}
                        >
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className={`font-semibold ${
                              isCurrentPlayer
                                ? "text-[#f5c542]"
                                : "text-[#e8e6df]"
                            }`}
                          >
                            {player.name}
                            {player.finished && " ✓"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-6 pr-6 text-sm">
                        <div className="text-center">
                          <p className="text-[#9b9d9f]">WPM</p>
                          <p className="text-lg font-bold text-[#f5c542]">
                            {player.wpm}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#9b9d9f]">Accuracy</p>
                          <p className="text-lg font-bold text-[#f5c542]">
                            {Math.round(player.accuracy)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="h-4 w-full overflow-hidden rounded-full bg-[#252729]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCurrentPlayer
                              ? "bg-linear-to-r from-[#f5c542] to-[#e2b714]"
                              : "bg-linear-to-r from-[#9b9d9f] to-[#7a7c7f]"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <span className="absolute -top-6 right-0 text-sm text-[#9b9d9f]">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // Results Screen
          <div className="flex w-full flex-col items-center gap-8">
            {/* Winner Announcement */}
            <div className="w-full rounded-2xl border-2 border-[#f5c542] bg-linear-to-br from-[#f5c542]/20 to-[#e2b714]/20 p-10 text-center shadow-2xl">
              <div className="mb-4 text-6xl">🏆</div>
              <h1 className="mb-2 text-4xl font-bold text-[#f5c542]">
                {winner} Won!
              </h1>
              <p className="text-lg text-[#e8e6df]">
                Congratulations on winning the race!
              </p>
            </div>

            {/* Final Rankings */}
            <div className="w-full rounded-2xl border-2 border-[#3a3d40] bg-linear-to-br from-[#2c2e31]/80 to-[#252729]/80 p-8 shadow-2xl backdrop-blur-sm">
              <h2 className="mb-6 text-2xl font-semibold text-[#f5c542]">
                Final Results
              </h2>
              <div className="space-y-4">
                {rankedPlayers.map((player, index) => {
                  const rank = index + 1;
                  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";

                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-xl bg-[#323437]/50 p-5"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{medal}</span>
                        <div>
                          <p className="text-lg font-semibold text-[#e8e6df]">
                            {rank}
                            {getRankSuffix(rank)} - {player.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-[#9b9d9f]">Score</p>
                          <p className="text-lg font-bold text-[#f5c542]">
                            {player.score || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#9b9d9f]">WPM</p>
                          <p className="text-lg font-bold text-[#f5c542]">
                            {player.wpm}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#9b9d9f]">Accuracy</p>
                          <p className="text-lg font-bold text-[#f5c542]">
                            {Math.round(player.accuracy)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                href="/multiplayer"
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-[#2c2e31] to-[#252729] px-12 py-4 text-lg font-semibold text-[#e8e6df] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#f5c542]/20"
              >
                <div className="absolute inset-0 bg-linear-to-br from-[#f5c542] to-[#e2b714] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#1a1b1d]">
                  Back to Lobby
                </span>
              </Link>
              <Link
                href="/"
                className="rounded-xl border-2 border-[#9b9d9f] px-12 py-4 text-lg font-semibold text-[#e8e6df] transition-all hover:border-[#f5c542] hover:bg-[#2c2e31]"
              >
                Home
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl text-center">
        <div className="flex flex-col items-center gap-3 text-sm text-[#9b9d9f]">
          {!raceFinished && (
            <p className="text-xs">Type the text as fast as you can!</p>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function MultiplayerRace() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#323437]">
          <div className="text-xl text-[#e8e6df]">Loading race...</div>
        </div>
      }
    >
      <MultiplayerRaceContent />
    </Suspense>
  );
}
