"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SAMPLE_TEXTS, getRandomText } from "@/lib/constants";

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
    setText(getRandomText());
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

    // Check if finished (when progress reaches 100%)
    if (value.length === text.length) {
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
    if (index >= input.length) return "text-[#9b9d9f]"; // Not typed yet - lighter gray
    if (input[index] === text[index]) return "text-[#e8e6df]"; // Correct - brighter white
    return "text-[#ff6b6b]"; // Incorrect - brighter red
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[#323437] px-4 py-4 text-[#e8e6df] md:py-8">
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
          <span className="rounded-lg bg-[#2c2e31] px-4 py-2 text-sm font-semibold text-[#f5c542]">
            Solo Mode
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center gap-4 md:gap-8">
        {/* Stats Bar */}
        <div className="flex w-full gap-4">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-[#2c2e31] p-4">
            <span className="text-sm text-[#9b9d9f]">WPM</span>
            <span className="text-3xl font-bold text-[#f5c542]">{wpm}</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-[#2c2e31] p-4">
            <span className="text-sm text-[#9b9d9f]">Accuracy</span>
            <span className="text-3xl font-bold text-[#f5c542]">
              {accuracy}%
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-[#2c2e31] p-4">
            <span className="text-sm text-[#9b9d9f]">Time</span>
            <span className="text-3xl font-bold text-[#f5c542]">
              {elapsedTime}s
            </span>
          </div>
        </div>

        {/* Text Display */}
        <div className="w-full rounded-2xl border-2 border-[#3a3d40] bg-linear-to-br from-[#2c2e31]/80 to-[#252729]/80 p-4 shadow-2xl backdrop-blur-sm md:p-10">
          <p className="text-center text-lg leading-relaxed tracking-wide md:text-2xl">
            {text.split("").map((char, index) => (
              <span key={index} className={getCharacterColor(index)}>
                {char}
              </span>
            ))}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="mb-2 flex justify-between text-sm text-[#9b9d9f]">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#2c2e31]">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#f5c542] to-[#e2b714] transition-all duration-300"
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
            className="w-full rounded-xl border-2 border-[#3a3d40] bg-[#1f2123] px-4 py-3 text-base text-[#e8e6df] placeholder-[#7a7c7f] outline-none transition-all focus:border-[#f5c542] disabled:opacity-50 md:px-6 md:py-4 md:text-xl"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        {/* Restart Button */}
        <button
          onClick={resetGame}
          className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-[#2c2e31] to-[#252729] px-12 py-4 text-lg font-semibold text-[#e8e6df] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#f5c542]/20"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#f5c542] to-[#e2b714] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <span className="relative z-10 transition-colors duration-300 group-hover:text-[#1a1b1d]">
            {isFinished ? "Try Again" : "Restart"}
          </span>
        </button>

        {/* Completion Message */}
        {isFinished && (
          <div className="w-full animate-fadeIn rounded-2xl border-2 border-[#f5c542]/60 bg-linear-to-br from-[#f5c542]/15 to-[#e2b714]/15 p-6 text-center">
            <h3 className="mb-2 text-2xl font-bold text-[#f5c542]">
              🎉 Completed!
            </h3>
            <p className="text-[#e8e6df]">
              Great job! You finished with {wpm} WPM and {accuracy}% accuracy.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl text-center">
        <div className="flex flex-col items-center gap-3 text-sm text-[#9b9d9f]">
          <p className="text-xs">Press Tab + Enter to restart anytime</p>
        </div>
      </footer>
    </div>
  );
}
