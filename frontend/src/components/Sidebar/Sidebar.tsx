"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Receipt,
  Wallet,
  Settings,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview",
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
    description: "Track spending",
  },
  {
    name: "Income",
    href: "/income",
    icon: Wallet,
    description: "Track earnings",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account & appearance",
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  function handleLogout() {
    setLoggingOut(true);
    localStorage.removeItem("access_token");
    router.replace("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-zinc-200/80 bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-950 lg:block">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex h-22 shrink-0 items-center gap-3 border-b border-zinc-100 px-6 dark:border-zinc-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
            <CircleDollarSign size={25} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <h1 className="text-[17px] font-bold tracking-tight text-zinc-900 dark:text-white">
              Money Tracker
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Personal finance
            </p>
          </div>
        </div>

        {/* Main navigation */}
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto px-4 py-5"
        >
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            Workspace
          </p>

          <div className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              const Icon = item.icon;

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => router.push(item.href)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/15"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-zinc-100 text-zinc-500 group-hover:bg-white dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700"
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.9} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {item.name}
                    </span>
                    <span
                      className={`mt-0.5 block text-[11px] ${
                        isActive
                          ? "text-emerald-50"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      {item.description}
                    </span>
                  </span>

                  {isActive && (
                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-white/90"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-zinc-100 p-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="group flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-3 py-3 text-sm font-medium text-zinc-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <LogOut size={18} />
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>

          <p className="mt-3 text-center text-xs text-zinc-500">
            Money Tracker · Personal Finance
          </p>
        </div>
      </div>
    </aside>
  );
}
