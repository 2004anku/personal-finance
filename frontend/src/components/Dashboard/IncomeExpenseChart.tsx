"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type IncomeExpensePoint = {
  date: string;
  income: number;
  expenses: number;
};

type IncomeExpenseChartProps = {
  data: IncomeExpensePoint[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function IncomeExpenseChart({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}: IncomeExpenseChartProps) {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Income vs Expenses
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Daily cash flow over the last 30 days
        </p>

        <div className="flex h-72 items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-green-200 border-t-green-600"
            role="status"
            aria-label="Loading chart"
          />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Income vs Expenses
        </h2>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Unable to load chart data.
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Try Again
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Income vs Expenses
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Daily cash flow over the last 30 days
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-72 items-center justify-center">
          <p className="text-sm text-text-secondary">
            No financial data available for this period.
          </p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: 8, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => value.slice(5)}
                tick={{
                  fill: "var(--text-muted)",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
                minTickGap={18}
              />

              <YAxis
                tickFormatter={(value: number) =>
                  value >= 1000
                    ? `₹${(value / 1000).toLocaleString("en-IN")}k`
                    : `₹${value}`
                }
                tick={{
                  fill: "var(--text-muted)",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
                width={65}
              />

              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name) => [
                  formatCurrency(Number(value ?? 0)),
                  name === "income" ? "Income" : "Expenses",
                ]}
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--foreground)",
                }}
                labelStyle={{
                  color: "var(--text-primary)",
                }}
              />

              <Legend
                formatter={(value) =>
                  value === "income" ? "Income" : "Expenses"
                }
              />

              <Line
                type="monotone"
                dataKey="income"
                name="income"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls
              />

              <Line
                type="monotone"
                dataKey="expenses"
                name="expenses"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
