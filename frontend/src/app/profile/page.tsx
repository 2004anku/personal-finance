"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Mail,
  CalendarDays,
  Fingerprint,
  Pencil,
  X,
  Check,
  LoaderCircle,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { apiRequest } from "@/lib/Api/api";
import Sidebar from "@/components/Sidebar/Sidebar";

type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await apiRequest<User>("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(data);
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        console.error("Failed to load profile:", error);
        localStorage.removeItem("access_token");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function handleCancel() {
    if (!user) return;

    setName(user.name);
    setEmail(user.email);
    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await apiRequest<User>("/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      setUser(updatedUser);
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const initials = (user?.name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  const labelClass =
    "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Sidebar />

        <main className="flex min-h-screen items-center justify-center px-6 lg:ml-64">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading your profile...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 transition-colors dark:bg-zinc-950">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* Page heading */}
          <header className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span>Account</span>
              <span>/</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Profile
              </span>
            </div>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Your Profile
                </h1>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
                  Manage your personal information and account details.
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
              )}
            </div>
          </header>

          {/* Feedback messages */}
          {success && (
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <Check className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            >
              <X className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {/* Profile summary */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="h-24 bg-linear-to-r from-emerald-400 via-emerald-500 to-teal-600" />

              <div className="px-6 pb-6">
                <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-emerald-500 text-2xl font-bold text-white shadow-sm dark:border-zinc-900">
                  {initials}
                </div>

                <h2 className="mt-4 wrap-break-words text-xl font-bold text-zinc-900 dark:text-white">
                  {user?.name || "User"}
                </h2>

                <p className="mt-1 break-all text-sm text-zinc-500 dark:text-zinc-400">
                  {user?.email}
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <ShieldCheck size={18} />
                  <span className="font-medium">Personal account</span>
                </div>

                <div className="mt-5 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />

                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Member since
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {memberSince}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Personal information */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
              <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-5 sm:px-7 dark:border-zinc-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <UserRound size={21} />
                </div>

                <div>
                  <h2 className="font-semibold text-zinc-900 dark:text-white">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {editing
                      ? "Update your details below."
                      : "Your registered account details."}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className={labelClass} htmlFor="userId">
                        User ID
                      </label>

                      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950">
                        <Fingerprint className="h-5 w-5 shrink-0 text-zinc-400" />
                        <p
                          id="userId"
                          className="break-all text-sm text-zinc-500 dark:text-zinc-400"
                        >
                          {user?.id}
                        </p>
                      </div>

                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Your user ID cannot be changed.
                      </p>
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="name">
                        Full Name
                      </label>

                      <div className="relative">
                        <UserRound className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          required
                          minLength={2}
                          maxLength={100}
                          disabled={saving}
                          placeholder="Enter your full name"
                          className={`${inputClass} pl-12`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="email">
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                          disabled={saving}
                          placeholder="Enter your email address"
                          className={`${inputClass} pl-12`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:justify-end dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <ArrowLeft size={16} />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <LoaderCircle size={16} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-0">
                    <InfoRow
                      icon={<Fingerprint size={19} />}
                      label="User ID"
                      value={user?.id || "—"}
                      breakAll
                    />

                    <InfoRow
                      icon={<UserRound size={19} />}
                      label="Full Name"
                      value={user?.name || "—"}
                    />

                    <InfoRow
                      icon={<Mail size={19} />}
                      label="Email Address"
                      value={user?.email || "—"}
                      breakAll
                    />

                    <InfoRow
                      icon={<CalendarDays size={19} />}
                      label="Member Since"
                      value={memberSince}
                      last
                    />
                  </div>
                )}
              </div>
            </section>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
            Keep your account information up to date.
          </p>
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  breakAll = false,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  breakAll?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-4 py-5 ${
        last ? "" : "border-b border-zinc-100 dark:border-zinc-800"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        {icon}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </p>

        <p
          className={`mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 ${
            breakAll ? "break-all" : "wrap-break-words"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
