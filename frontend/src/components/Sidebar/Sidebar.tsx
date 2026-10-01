"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
    icon: "▦",
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: "▤",
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
        router.push("/login");
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
        router.push("/login");
      }
    }

    loadUser();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    router.push("/login");
  }

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

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-zinc-200 p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-zinc-900">
              {user?.name || "Loading..."}
            </p>

            <p className="truncate text-xs text-zinc-500">
              {user?.email || ""}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
