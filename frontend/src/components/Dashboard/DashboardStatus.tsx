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
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 text-foreground transition-colors">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"
          role="status"
          aria-label="Loading"
        />

        <p className="mt-4 text-sm font-medium text-text-secondary">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 text-center text-foreground transition-colors">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
          <AlertCircle
            size={24}
            className="text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-text-primary">
          Unable to load dashboard
        </h2>

        <p className="mt-2 max-w-md text-sm text-text-secondary">
          {message || "Something went wrong while loading your dashboard."}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-background"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-border bg-surface px-4 text-center">
      <p className="text-sm text-text-secondary">
        {message || "No data available."}
      </p>
    </div>
  );
}
