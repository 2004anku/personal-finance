"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface DashboardStatusProps {
  type: "loading" | "error" | "empty";
  message?: string;
  onRetry?: () => void;
}

export default function DashboardStatus({
  type,
  message,
  onRetry,
}: DashboardStatusProps) {
  if (type === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-zinc-50 px-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"
          role="status"
          aria-label="Loading"
        />
        <p className="mt-4 text-sm font-medium text-zinc-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-zinc-50 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={24} className="text-red-600" aria-hidden="true" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-zinc-900">
          Unable to load dashboard
        </h2>

        <p className="mt-2 max-w-md text-sm text-zinc-500">
          {message || "Something went wrong while loading your dashboard."}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-center">
      <p className="text-sm text-zinc-500">{message || "No data available."}</p>
    </div>
  );
}
