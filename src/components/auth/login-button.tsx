"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogIn } from "lucide-react";

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="group flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
    >
      <LogIn className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
      {loading ? "Redirecting..." : "Sign in with Google"}
    </button>
  );
}
