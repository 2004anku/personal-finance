"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import { apiRequest } from "@/lib/Api/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Contains an uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Contains a number", valid: /\d/.test(password) },
    {
      label: "Contains a special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const strength = passwordChecks.filter((item) => item.valid).length;
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      router.push("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition duration-200 placeholder:text-zinc-500 hover:border-white/20 focus:border-emerald-400/70 focus:bg-white/[0.07] focus:ring-4 focus:ring-emerald-400/10 disabled:opacity-60";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-8 text-white selection:bg-emerald-400/30 sm:px-6">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-24 h-112 w-md rounded-full bg-teal-500/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-size-[24px_24px]" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-2">
        {/* Branding panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-linear-to-br from-emerald-400/10 via-zinc-900 to-zinc-950 p-10 lg:flex xl:p-12">
          <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full border border-emerald-300/10" />
          <div className="pointer-events-none absolute -right-12 top-36 h-48 w-48 rounded-full border border-emerald-300/10" />

          <a
            href="/login"
            className="relative inline-flex w-fit items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20">
              <Wallet size={22} strokeWidth={2.2} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Money<span className="text-emerald-400">Tracker</span>
            </span>
          </a>

          <div className="relative my-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <ShieldCheck size={14} />
              Your financial journey starts here
            </div>

            <h1 className="max-w-md text-4xl leading-tight font-semibold tracking-tight xl:text-5xl">
              Make every
              <span className="block bg-linear-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                rupee count.
              </span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
              Create your account and take control of your income, expenses, and
              financial goals—all in one place.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Track income and daily expenses",
                "Understand your spending habits",
                "Build better financial routines",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                    <Check size={14} />
                  </span>
                  <span className="text-sm text-zinc-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-zinc-500">
            A clearer picture of your money starts with one step.
          </p>
        </section>

        {/* Registration form */}
        <section className="p-6 sm:p-9 lg:p-10 xl:p-12">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-zinc-950">
              <Wallet size={21} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Money<span className="text-emerald-400">Tracker</span>
            </span>
          </div>

          <div className="mb-7">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
              <UserRound size={23} />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Create your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Get started with your personal finance dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Full name
              </label>

              <div className="relative">
                <UserRound
                  size={17}
                  className="absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-500"
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  required
                  maxLength={100}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-500"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-500"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  disabled={loading}
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-md text-zinc-500 transition hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">
                      Password strength
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        strength <= 1
                          ? "text-rose-400"
                          : strength <= 2
                            ? "text-amber-400"
                            : strength === 3
                              ? "text-teal-300"
                              : "text-emerald-400"
                      }`}
                    >
                      {strength <= 1
                        ? "Weak"
                        : strength <= 2
                          ? "Fair"
                          : strength === 3
                            ? "Good"
                            : "Strong"}
                    </span>
                  </div>

                  <div className="flex gap-1.5" aria-hidden="true">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          strength >= level
                            ? strength <= 1
                              ? "bg-rose-400"
                              : strength <= 2
                                ? "bg-amber-400"
                                : strength === 3
                                  ? "bg-teal-300"
                                  : "bg-emerald-400"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>

                  <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {passwordChecks.map((check) => (
                      <li
                        key={check.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          check.valid ? "text-emerald-400" : "text-zinc-500"
                        }`}
                      >
                        {check.valid ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-zinc-600" />
                        )}
                        {check.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Confirm password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-500"
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  required
                  disabled={loading}
                  aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
                  className={`${inputClass} pr-12 ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-emerald-400/60"
                        : "border-rose-400/60"
                      : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-md text-zinc-500 transition hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <p
                  className={`mt-2 flex items-center gap-1.5 text-xs ${
                    passwordsMatch ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {passwordsMatch ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <X size={13} />
                  )}
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
              >
                <X size={17} className="mt-0.5 shrink-0" />
                <p className="wrap-break-word">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-400 to-teal-300 px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-zinc-500">ALREADY REGISTERED?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-emerald-400 transition hover:text-emerald-300 hover:underline"
            >
              Sign in
            </a>
          </p>

          <p className="mt-6 text-center text-xs leading-5 text-zinc-500">
            By creating an account, you can start organizing your personal
            finances in one place.
          </p>
        </section>
      </div>
    </main>
  );
}
