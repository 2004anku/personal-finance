"use client";

type GlobalLoaderProps = {
  visible: boolean;
};

export default function GlobalLoader({ visible }: GlobalLoaderProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
        <p className="text-sm font-medium text-zinc-700">Loading...</p>
      </div>
    </div>
  );
}
