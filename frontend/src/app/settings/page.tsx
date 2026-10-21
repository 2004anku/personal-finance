"use client";

import Link from "next/link";
import { UserRound, Palette, ChevronRight, Settings2 } from "lucide-react";

import Sidebar from "@/components/Sidebar/Sidebar";
import ThemeToggle from "@/components/Theme/ThemeToggle";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Shared sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="min-w-0 lg:ml-64">
        {/* Page header */}
        <header className="border-b border-border bg-surface">
          <div className="px-5 py-5 sm:px-6 lg:px-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              Personal Finance
            </p>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Settings2 size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  Settings
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  Manage your account and personalize your experience.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Settings sections */}
        <div className="space-y-8 p-5 sm:p-6 lg:p-8">
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Account
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Manage your personal information.
              </p>
            </div>

            <Link
              href="/profile"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all hover:border-emerald-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:border-emerald-800 sm:p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <UserRound size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text-primary">
                  Profile
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  View and manage your profile and account details.
                </p>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-emerald-500"
              />
            </Link>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Preferences
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Customize how Money Tracker looks.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                <Palette size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text-primary">
                  Appearance
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Switch between light and dark mode.
                </p>
              </div>

              <div className="shrink-0">
                <ThemeToggle />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
