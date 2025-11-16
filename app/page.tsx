import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[#323437] px-4 py-8 text-[#d1d0c5]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#e2b714] opacity-5 blur-[120px]"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#e2b714] to-[#d4a50f] text-xl shadow-lg shadow-[#e2b714]/20">
              ⌨️
            </div>
            <span className="text-lg font-semibold text-[#d1d0c5]">
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
            <h1 className="bg-linear-to-br from-[#d1d0c5] via-[#e2b714] to-[#d1d0c5] bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl">
              TypeSprint
            </h1>
            <div className="absolute -bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-linear-to-r from-transparent via-[#e2b714] to-transparent opacity-50"></div>
          </div>
          <p className="text-2xl font-light tracking-wide text-[#646669] sm:text-3xl">
            Race your keys. Beat your best.
          </p>
        </div>

        {/* Mode Selection Buttons */}
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
          <Link
            href="/solo"
            className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-[#2c2e31] to-[#252729] px-16 py-8 text-xl font-semibold text-[#d1d0c5] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#e2b714]/20"
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#e2b714] to-[#d4a50f] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <span className="relative z-10 transition-colors duration-300 group-hover:text-[#323437]">
              Solo Mode
            </span>
          </Link>
          <button className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-[#2c2e31] to-[#252729] px-16 py-8 text-xl font-semibold text-[#d1d0c5] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#e2b714]/20">
            <div className="absolute inset-0 bg-linear-to-br from-[#e2b714] to-[#d4a50f] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <span className="relative z-10 transition-colors duration-300 group-hover:text-[#323437]">
              Multiplayer Mode
            </span>
          </button>
        </div>

        {/* Instructions */}
        <div className="w-full max-w-3xl rounded-2xl border border-[#2c2e31] bg-linear-to-br from-[#2c2e31]/50 to-[#252729]/50 p-10 shadow-2xl backdrop-blur-sm">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-semibold text-[#e2b714]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e2b714]/10">
              💡
            </span>
            How it works
          </h2>
          <div className="space-y-5 text-base">
            <div className="flex gap-4 rounded-xl bg-[#323437]/50 p-4 transition-colors hover:bg-[#323437]/80">
              <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#e2b714]/20 text-sm font-bold text-[#e2b714]">
                1
              </span>
              <p className="text-[#d1d0c5]">
                <span className="font-semibold text-[#e2b714]">Solo Mode:</span>{" "}
                <span className="text-[#9b9a8f]">
                  Test your typing speed and accuracy. Beat your personal best.
                </span>
              </p>
            </div>
            <div className="flex gap-4 rounded-xl bg-[#323437]/50 p-4 transition-colors hover:bg-[#323437]/80">
              <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#e2b714]/20 text-sm font-bold text-[#e2b714]">
                2
              </span>
              <p className="text-[#d1d0c5]">
                <span className="font-semibold text-[#e2b714]">
                  Multiplayer Mode:
                </span>{" "}
                <span className="text-[#9b9a8f]">
                  Race against others in real-time. First to finish wins.
                </span>
              </p>
            </div>
            <div className="flex gap-4 rounded-xl bg-[#323437]/50 p-4 transition-colors hover:bg-[#323437]/80">
              <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#e2b714]/20 text-sm font-bold text-[#e2b714]">
                ⚡
              </span>
              <p className="text-[#d1d0c5]">
                <span className="font-semibold text-[#e2b714]">Pro Tip:</span>{" "}
                <span className="text-[#9b9a8f]">
                  Stay focused, type accurately, and let your fingers fly!
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl text-center">
        <div className="flex flex-col items-center gap-3 text-sm text-[#646669]">
          <div className="flex items-center gap-2">
            <p>Built with Next.js & WebSockets</p>
            <span className="text-[#e2b714]">•</span>
            <a
              href="https://github.com"
              className="text-[#e2b714] transition-all duration-200 hover:text-[#d1d0c5] hover:underline"
            >
              GitHub
            </a>
          </div>
          <p className="text-xs">Made with ⌨️ by TypeSprint Team</p>
        </div>
      </footer>
    </div>
  );
}
