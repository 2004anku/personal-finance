import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
  description?: string;
  valueColor?: string;
}

export default function SummaryCard({
  title,
  amount,
  icon: Icon,
  iconColor,
  iconBackground,
  description,
  valueColor = "text-zinc-900",
}: SummaryCardProps) {
  const formattedAmount = `₹${Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>

          <p className={`mt-3 text-2xl font-bold tracking-tight ${valueColor}`}>
            {formattedAmount}
          </p>

          {description && (
            <p className="mt-1 text-xs text-zinc-400">{description}</p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBackground}`}
        >
          <Icon
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
            className={iconColor}
          />
        </div>
      </div>
    </div>
  );
}
