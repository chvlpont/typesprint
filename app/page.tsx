import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[#323437] px-4 py-8 text-[#e8e6df]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#f5c542] opacity-5 blur-[120px]"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#f5c542] to-[#e2b714] text-xl shadow-lg shadow-[#f5c542]/20">
              ⌨️
            </div>
            <span className="text-lg font-semibold text-[#e8e6df]">
              TypeSprint
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center gap-16">
        {/* Logo & Tagline */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <h1 className="bg-linear-to-br from-[#e8e6df] via-[#f5c542] to-[#e8e6df] bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl">
              TypeSprint
            </h1>
            <div className="absolute -bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-linear-to-r from-transparent via-[#f5c542] to-transparent opacity-50"></div>
          </div>
          <p className="text-2xl font-light tracking-wide text-[#9b9d9f] sm:text-3xl">
            Race your keys. Beat your best.
          </p>
        </div>

        {/* Mode Selection Buttons */}
        <div className="flex w-full max-w-4xl flex-col gap-6 sm:flex-row">
          <Link
            href="/solo"
            className="group relative flex flex-1 flex-col items-center gap-4 overflow-hidden rounded-2xl border-2 border-[#f5c542]/40 bg-linear-to-br from-[#3a3d40] to-[#2c2e31] p-8 shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:border-[#f5c542] hover:shadow-2xl hover:shadow-[#f5c542]/30"
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#f5c542] to-[#e2b714] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5c542]/10 text-4xl transition-all duration-300 group-hover:bg-[#1a1b1d]/30">
              🎯
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <span className="text-2xl font-bold text-[#e8e6df] transition-colors duration-300 group-hover:text-[#1a1b1d]">
                Solo Mode
              </span>
              <span className="text-sm text-[#9b9d9f] transition-colors duration-300 group-hover:text-[#1a1b1d]/70">
                Practice alone and improve
              </span>
            </div>
          </Link>
          <Link
            href="/multiplayer"
            className="group relative flex flex-1 flex-col items-center gap-4 overflow-hidden rounded-2xl border-2 border-[#f5c542]/40 bg-linear-to-br from-[#3a3d40] to-[#2c2e31] p-8 shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:border-[#f5c542] hover:shadow-2xl hover:shadow-[#f5c542]/30"
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#f5c542] to-[#e2b714] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5c542]/10 text-4xl transition-all duration-300 group-hover:bg-[#1a1b1d]/30">
              🏁
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <span className="text-2xl font-bold text-[#e8e6df] transition-colors duration-300 group-hover:text-[#1a1b1d]">
                Multiplayer Mode
              </span>
              <span className="text-sm text-[#9b9d9f] transition-colors duration-300 group-hover:text-[#1a1b1d]/70">
                Race against others live
              </span>
            </div>
          </Link>
        </div>

        {/* How it works */}
        <div className="mb-16 w-full max-w-4xl border-[#3a3d40]">
          <h2 className="mb-8 flex items-center justify-center gap-3 text-3xl font-bold text-[#f5c542]">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5c542]/10 text-2xl">
              💡
            </span>
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-xl border border-[#f5c542]/20 bg-[#323437]/30 p-6 transition-all duration-300 hover:border-[#f5c542]/40 hover:bg-[#323437]/50">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f5c542]/20 text-lg font-bold text-[#f5c542]">
                  1
                </span>
                <h3 className="text-xl font-bold text-[#f5c542]">Solo Mode</h3>
              </div>
              <p className="text-[#b8b6b0] leading-relaxed">
                Test your typing speed and accuracy with random practice texts.
                Beat your personal best and track your improvement over time.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-[#f5c542]/20 bg-[#323437]/30 p-6 transition-all duration-300 hover:border-[#f5c542]/40 hover:bg-[#323437]/50">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f5c542]/20 text-lg font-bold text-[#f5c542]">
                  2
                </span>
                <h3 className="text-xl font-bold text-[#f5c542]">
                  Multiplayer Mode
                </h3>
              </div>
              <p className="text-[#b8b6b0] leading-relaxed">
                Create or join a room and race against others in real-time.
                Compete for the highest score based on speed and accuracy.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-[#f5c542]/20 bg-[#323437]/30 p-6 transition-all duration-300 hover:border-[#f5c542]/40 hover:bg-[#323437]/50">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f5c542]/20 text-lg font-bold text-[#f5c542]">
                  3
                </span>
                <h3 className="text-xl font-bold text-[#f5c542]">
                  Track Stats
                </h3>
              </div>
              <p className="text-[#b8b6b0] leading-relaxed">
                Monitor your WPM, accuracy, and progress in real-time. Watch
                your typing skills improve with detailed performance metrics.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-[#f5c542]/20 bg-[#323437]/30 p-6 transition-all duration-300 hover:border-[#f5c542]/40 hover:bg-[#323437]/50">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f5c542]/20 text-xl">
                  ⚡
                </span>
                <h3 className="text-xl font-bold text-[#f5c542]">Pro Tip</h3>
              </div>
              <p className="text-[#b8b6b0] leading-relaxed">
                Stay focused and type accurately rather than rushing. Consistent
                practice builds muscle memory and speed naturally.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl text-center">
        <div className="flex flex-col items-center gap-3 text-sm text-[#9b9d9f]">
          <p>
            Built with Next.js, TypeScript, Supabase, PostgreSQL, WebSockets &
            Tailwind CSS
          </p>
          <p className="text-xs">Made by Pontus Hogler</p>
        </div>
      </footer>
    </div>
  );
}
