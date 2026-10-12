"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Receipt,
  Wallet,
} from "lucide-react";

import { apiRequest } from "@/app/lib/api";

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
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    name: "Income",
    href: "/income",
    icon: Wallet,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
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

        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);

        localStorage.removeItem("access_token");
        router.replace("/login");
      }
    }

    loadUser();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    router.replace("/login");
  }

  function handleProfileClick() {
    router.push("/profile");
  }

  const userInitial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <aside className="fixed hidden h-screen w-64 border-r border-zinc-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-zinc-200 px-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Money Tracker</h1>

            <p className="text-xs text-zinc-500">Personal Finance</p>
          </div>
        </div>

        {/* Profile */}
        <div className="border-b border-zinc-200 p-4">
          <button
            type="button"
            onClick={handleProfileClick}
            className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
              pathname === "/profile" ? "bg-zinc-100" : "hover:bg-zinc-100"
            }`}
          >
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              {userInitial}
            </div>

            {/* User */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">
                {user?.name || "Loading..."}
              </p>

              <p className="text-xs text-zinc-500">View Profile</p>
            </div>

            {/* Profile arrow */}
            <ChevronRight
              size={18}
              strokeWidth={1.8}
              className="shrink-0 text-zinc-400"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 space-y-2 p-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />

                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-zinc-200 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />

            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
