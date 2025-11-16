"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog near the riverbank.",
  "Programming is not about what you know it is about what you can figure out.",
  "Success is not final failure is not fatal it is the courage to continue that counts.",
  "The only way to do great work is to love what you do and keep learning.",
  "Practice makes perfect but perfect practice makes champions in any field.",
];

export default function SoloMode() {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with random text
  useEffect(() => {
    resetGame();
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [text]);

  const resetGame = () => {
    const randomText =
      SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    setText(randomText);
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Start timer on first character
    if (!startTime && value.length === 1) {
      setStartTime(Date.now());
    }

    setInput(value);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === text[i]) {
        correct++;
      }
    }
    const acc = value.length > 0 ? (correct / value.length) * 100 : 100;
    setAccuracy(Math.round(acc));

    // Check if finished
    if (value === text) {
      const end = Date.now();
      setEndTime(end);
      setIsFinished(true);

      // Calculate WPM
      if (startTime) {
        const timeInMinutes = (end - startTime) / 1000 / 60;
        const words = text.split(" ").length;
        const calculatedWpm = Math.round(words / timeInMinutes);
        setWpm(calculatedWpm);
      }
    }
  };

  // Calculate current WPM while typing
  useEffect(() => {
    if (startTime && !endTime) {
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const timeInMinutes = (currentTime - startTime) / 1000 / 60;
        const wordsTyped = input.split(" ").length;
        const currentWpm = Math.round(wordsTyped / timeInMinutes);
        setWpm(currentWpm > 0 ? currentWpm : 0);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [startTime, endTime, input]);

  const progress = text.length > 0 ? (input.length / text.length) * 100 : 0;
  const elapsedTime = startTime
    ? Math.round((endTime || Date.now() - startTime) / 1000)
    : 0;

  const getCharacterColor = (index: number) => {
    if (index >= input.length) return "text-[#646669]"; // Not typed yet
    if (input[index] === text[index]) return "text-[#d1d0c5]"; // Correct
    return "text-[#ca4754]"; // Incorrect
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[#323437] px-4 py-8 text-[#d1d0c5]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#e2b714] opacity-5 blur-[120px]"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#e2b714] to-[#d4a50f] text-xl shadow-lg shadow-[#e2b714]/20">
              ⌨️
            </div>
            <span className="text-lg font-semibold text-[#d1d0c5]">
              TypeSprint
            </span>
          </Link>
          <span className="rounded-lg bg-[#2c2e31] px-4 py-2 text-sm font-semibold text-[#e2b714]">
            Solo Mode
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center gap-8">
        {/* Stats Bar */}
        <div className="flex w-full gap-4">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-[#2c2e31] p-4">
            <span className="text-sm text-[#646669]">WPM</span>
            <span className="text-3xl font-bold text-[#e2b714]">{wpm}</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-[#2c2e31] p-4">
            <span className="text-sm text-[#646669]">Accuracy</span>
            <span className="text-3xl font-bold text-[#e2b714]">
              {accuracy}%
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-[#2c2e31] p-4">
            <span className="text-sm text-[#646669]">Time</span>
            <span className="text-3xl font-bold text-[#e2b714]">
              {elapsedTime}s
            </span>
          </div>
        </div>

        {/* Text Display */}
        <div className="w-full rounded-2xl border border-[#2c2e31] bg-linear-to-br from-[#2c2e31]/50 to-[#252729]/50 p-10 shadow-2xl backdrop-blur-sm">
          <p className="text-center text-2xl leading-relaxed tracking-wide">
            {text.split("").map((char, index) => (
              <span key={index} className={getCharacterColor(index)}>
                {char}
              </span>
            ))}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="mb-2 flex justify-between text-sm text-[#646669]">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#2c2e31]">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#e2b714] to-[#d4a50f] transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
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
            className="w-full rounded-xl border-2 border-[#2c2e31] bg-[#252729] px-6 py-4 text-xl text-[#d1d0c5] placeholder-[#646669] outline-none transition-all focus:border-[#e2b714] disabled:opacity-50"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        {/* Restart Button */}
        <button
          onClick={resetGame}
          className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-[#2c2e31] to-[#252729] px-12 py-4 text-lg font-semibold text-[#d1d0c5] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#e2b714]/20"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#e2b714] to-[#d4a50f] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <span className="relative z-10 transition-colors duration-300 group-hover:text-[#323437]">
            {isFinished ? "Try Again" : "Restart"}
          </span>
        </button>

        {/* Completion Message */}
        {isFinished && (
          <div className="w-full animate-fadeIn rounded-2xl border border-[#e2b714]/50 bg-linear-to-br from-[#e2b714]/10 to-[#d4a50f]/10 p-6 text-center">
            <h3 className="mb-2 text-2xl font-bold text-[#e2b714]">
              🎉 Completed!
            </h3>
            <p className="text-[#d1d0c5]">
              Great job! You finished with {wpm} WPM and {accuracy}% accuracy.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl text-center">
        <div className="flex flex-col items-center gap-3 text-sm text-[#646669]">
          <p className="text-xs">Press Tab + Enter to restart anytime</p>
        </div>
      </footer>
    </div>
  );
}
