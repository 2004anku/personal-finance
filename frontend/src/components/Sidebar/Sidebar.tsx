"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Receipt,
  Wallet,
  UserRound,
  Settings2,
  LoaderCircle,
} from "lucide-react";

import { apiRequest } from "@/lib/Api/api";
import ThemeToggle from "@/components/Theme/ThemeToggle";
type User = {
  id: string;
  name: string;
  email: string;
};

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
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const userData = await apiRequest<User>("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelled) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to load sidebar user:", error);

        if (!cancelled) {
          localStorage.removeItem("access_token");
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setUserLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleLogout() {
    setLoggingOut(true);
    localStorage.removeItem("access_token");
    router.replace("/login");
  }

  const isProfileActive = pathname === "/profile";

  const userInitials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

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

        {/* User profile */}
        <div className="px-4 pb-5 pt-5">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            Your account
          </p>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            aria-current={isProfileActive ? "page" : undefined}
            className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isProfileActive
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white shadow-sm">
              {userLoading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                userInitials
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {userLoading
                  ? "Loading profile..."
                  : user?.name || "My Account"}
              </p>
              <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                {isProfileActive ? "Viewing profile" : "Manage your account"}
              </p>
            </div>

            <ChevronRight
              size={16}
              className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                isProfileActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-400"
              }`}
            />
          </button>
        </div>

        {/* Main navigation */}
        <nav aria-label="Main navigation" className="flex-1 px-4">
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
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="group flex flex-1 items-center gap-3 rounded-xl border border-zinc-200 px-3 py-3 text-sm font-medium text-zinc-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-zinc-500">
            Money Tracker · Personal Finance
          </p>
        </div>
      </div>
    </aside>
  );
}
