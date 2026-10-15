"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { apiRequest } from "@/lib/Api/api";

type LoginResponse = {
  access_token: string;
  token_type: string;
};

const transactions = [
  {
    name: "Monthly salary",
    category: "Income",
    date: "Today",
    amount: "+₹45,000",
    positive: true,
  },
  {
    name: "Groceries",
    category: "Food & essentials",
    date: "Yesterday",
    amount: "-₹1,850",
    positive: false,
  },
  {
    name: "Freelance project",
    category: "Income",
    date: "Oct 12",
    amount: "+₹8,500",
    positive: true,
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      localStorage.setItem("access_token", data.access_token);
      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-0 h-112 w-md rounded-full bg-green-400/10 blur-[140px]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-375 flex-col px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
        {/* Brand */}
        <header className="flex items-center justify-between">
          <Link href="/login" className="group inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-transform group-hover:-rotate-6">
              <Wallet size={23} strokeWidth={2.2} />
            </span>
            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              Money <span className="text-emerald-400">Tracker</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-2 text-xs text-zinc-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            Your finances, simplified
          </div>
        </header>

        {/* Main content */}
        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-14">
          {/* Left: product introduction */}
          <section className="mx-auto w-full max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3.5 py-2 text-sm font-medium text-emerald-300">
              <Sparkles size={15} />A smarter way to manage money
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Your money.
              <span className="mt-2 block bg-linear-to-r from-emerald-300 via-green-400 to-teal-300 bg-clip-text text-transparent">
                In focus.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400 sm:text-lg">
              Understand your spending, keep track of your income, and make more
              confident decisions with your money.
            </p>

            {/* Dashboard preview */}
            <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/75 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-400">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Financial overview
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Your money at a glance
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  Overview
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-linear-to-br from-emerald-400/9to-transparent p-5">
                <p className="text-sm text-zinc-400">Track every rupee</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                  <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                    ₹ Your way
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                    <TrendingUp size={16} />
                    Stay in control
                  </div>
                </div>

                {/* Decorative chart */}
                <div
                  className="mt-5 flex h-14 items-end gap-2"
                  aria-hidden="true"
                >
                  {[30, 43, 35, 58, 46, 65, 52, 77, 62, 88, 72, 100].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-md bg-linear-to-t from-emerald-600/30 to-emerald-400/90 transition-all duration-500 hover:to-teal-300"
                        style={{ height: `${height}%` }}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/2.5 p-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                      <ArrowDownRight size={17} />
                    </span>
                    Income
                  </div>
                  <p className="mt-3 text-lg font-semibold text-white">
                    Track earnings
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Keep income organized
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/2.5 p-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400">
                      <ArrowUpRight size={17} />
                    </span>
                    Expenses
                  </div>
                  <p className="mt-3 text-lg font-semibold text-white">
                    Monitor spending
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Know where it goes
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-200">
                    Example transactions
                  </p>
                  <span className="text-xs text-zinc-500">Preview</span>
                </div>

                <div className="space-y-1">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.name}
                      className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.035] sm:px-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            transaction.positive
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-rose-400/10 text-rose-400"
                          }`}
                        >
                          {transaction.positive ? (
                            <ArrowDownRight size={17} />
                          ) : (
                            <ArrowUpRight size={17} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-200">
                            {transaction.name}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {transaction.category} · {transaction.date}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 text-sm font-semibold ${
                          transaction.positive
                            ? "text-emerald-400"
                            : "text-zinc-300"
                        }`}
                      >
                        {transaction.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
              <ShieldCheck size={17} className="text-emerald-400" />
              Built to help you stay on top of your finances
            </div>
          </section>

          {/* Right: login form */}
          <section className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-9">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-300 to-green-500 text-zinc-950 shadow-lg shadow-emerald-500/20">
                  <Wallet size={27} strokeWidth={2.1} />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Sign in to continue to your dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-zinc-200"
                  >
                    Email address
                  </label>

                  <div className="group relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-emerald-400"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/70 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition duration-200 placeholder:text-zinc-600 hover:border-zinc-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-zinc-200"
                    >
                      Password
                    </label>
                  </div>

                  <div className="group relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-emerald-400"
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/70 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition duration-200 placeholder:text-zinc-600 hover:border-zinc-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/6 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm leading-6 text-rose-300"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-400 to-green-400 px-4 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/10 transition duration-200 hover:-translate-y-0.5 hover:from-emerald-300 hover:to-green-300 hover:shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-zinc-500">
                  YOUR FINANCES, YOUR CONTROL
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <p className="text-center text-sm text-zinc-400">
                New to Money Tracker?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-emerald-400 underline-offset-4 transition hover:text-emerald-300 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500">
              <LockKeyhole size={13} />
              Secure sign-in · Your account stays yours
            </p>
          </section>
        </div>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.07] py-5 text-xs text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Money Tracker</p>
          <p>Make every rupee count.</p>
        </footer>
      </div>
    </main>
  );
}
