"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/app/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      router.push("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-md rounded-card bg-surface p-8 shadow-card">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-heading font-bold tracking-tight text-primary">
            Create your account
          </h1>

          <p className="mt-2 text-small text-secondary">
            Create your personal finance account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-small font-medium text-secondary"
            >
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-control border border-default bg-input px-4 py-3 text-body text-primary outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus-ring"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-small font-medium text-secondary"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-control border border-default bg-input px-4 py-3 text-body text-primary outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus-ring"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-small font-medium text-secondary"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              required
              className="w-full rounded-control border border-default bg-input px-4 py-3 text-body text-primary outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus-ring"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-small font-medium text-secondary"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full rounded-control border border-default bg-input px-4 py-3 text-body text-primary outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus-ring"
            />
          </div>

          {error && <p className="text-small text-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-control bg-primary px-4 py-3 text-small font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-small text-secondary">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
