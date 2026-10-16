"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  function toggleTheme() {
    if (!mounted) return;
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
        border border-zinc-200 text-zinc-600 transition-colors
        hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
        disabled:cursor-wait
        dark:border-zinc-800 dark:text-zinc-400
        dark:hover:border-emerald-900 dark:hover:bg-emerald-950/40
        dark:hover:text-emerald-400"
    >
      {isDark ? (
        <Sun size={19} strokeWidth={1.8} />
      ) : (
        <Moon size={19} strokeWidth={1.8} />
      )}
    </button>
  );
}
