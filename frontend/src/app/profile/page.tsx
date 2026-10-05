"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/app/lib/api";
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
        router.push("/login");
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
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function handleCancel() {
    if (!user) {
      return;
    }

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
      router.push("/login");
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
      setSuccess("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);

      setError(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page">
        <Sidebar />

        <main className="min-h-screen lg:ml-64">
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-text-secondary">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-medium text-text-secondary">Account</p>

            <h1 className="mt-1 text-page-title font-semibold text-text-primary">
              Profile
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              View and manage your personal information.
            </p>
          </div>

          {/* Profile Card */}
          <section className="rounded-card border border-border bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="text-section-title font-semibold text-text-primary">
                  Personal Information
                </h2>

                <p className="mt-1 text-small text-text-secondary">
                  Your account information
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
                  className="rounded-control bg-primary px-4 py-2 text-small font-medium text-primary-foreground transition hover:bg-primary-hover"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="p-6">
              {success && (
                <div className="mb-6 rounded-control border border-border bg-zinc-50 px-4 py-3 text-small text-text-primary">
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-control border border-red-200 bg-red-50 px-4 py-3 text-small text-error">
                  {error}
                </div>
              )}

              {!editing ? (
                <div className="space-y-6">
                  {/* User ID */}
                  <div>
                    <p className="text-label font-medium text-text-secondary">
                      User ID
                    </p>

                    <p className="mt-2 break-all text-body text-text-primary">
                      {user?.id}
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <p className="text-label font-medium text-text-secondary">
                      Name
                    </p>

                    <p className="mt-2 text-body text-text-primary">
                      {user?.name}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-label font-medium text-text-secondary">
                      Email
                    </p>

                    <p className="mt-2 text-body text-text-primary">
                      {user?.email}
                    </p>
                  </div>

                  {/* Created At */}
                  <div>
                    <p className="text-label font-medium text-text-secondary">
                      Member Since
                    </p>

                    <p className="mt-2 text-body text-text-primary">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User ID */}
                  <div>
                    <label className="text-label font-medium text-text-secondary">
                      User ID
                    </label>

                    <div className="mt-2 rounded-control border border-border bg-zinc-50 px-4 py-3">
                      <p className="break-all text-small text-text-muted">
                        {user?.id}
                      </p>
                    </div>

                    <p className="mt-1 text-caption text-text-muted">
                      User ID cannot be changed.
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="text-label font-medium text-text-secondary"
                    >
                      Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      minLength={2}
                      maxLength={100}
                      className="mt-2 w-full rounded-control border border-border bg-input px-4 py-3 text-body text-text-primary outline-none transition focus:border-focus focus:ring-4 focus:ring-focus-ring"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="text-label font-medium text-text-secondary"
                    >
                      Email
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="mt-2 w-full rounded-control border border-border bg-input px-4 py-3 text-body text-text-primary outline-none transition focus:border-focus focus:ring-4 focus:ring-focus-ring"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 border-t border-border pt-6">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="rounded-control border border-border px-4 py-2 text-small font-medium text-text-secondary transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-control bg-primary px-4 py-2 text-small font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
