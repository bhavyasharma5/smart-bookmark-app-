import { LoginButton } from "@/components/auth/login-button";
import { Bookmark, Sparkles, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Gradient background effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/25">
            <Bookmark className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Smart{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Bookmarks
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="max-w-md text-lg text-gray-400">
          Save, organize, and sync your bookmarks in real-time across all your
          devices.
        </p>

        {/* Features */}
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm text-gray-300">
            <Zap className="h-4 w-4 text-yellow-400" />
            Real-time sync
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm text-gray-300">
            <Shield className="h-4 w-4 text-green-400" />
            Private &amp; secure
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm text-gray-300">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Smart favicons
          </div>
        </div>

        {/* Login */}
        <div className="mt-4">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
