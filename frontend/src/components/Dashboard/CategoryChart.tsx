"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryData {
  category: string;
  amount: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

const chartColors = [
  "#18181b",
  "#3f3f46",
  "#71717a",
  "#a1a1aa",
  "#d4d4d8",
  "#52525b",
  "#27272a",
  "#e4e4e7",
];

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.filter(
    (item) => Number.isFinite(item.amount) && item.amount > 0,
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Spending by Category
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          This month’s expense distribution
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-zinc-500">
              No expenses recorded this month.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {chartData.map((item, index) => (
                    <Cell
                      key={item.category}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {chartData.slice(0, 6).map((item, index) => {
              const total = chartData.reduce(
                (sum, category) => sum + category.amount,
                0,
              );

              const percentage = total > 0 ? (item.amount / total) * 100 : 0;

              return (
                <div
                  key={item.category}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          chartColors[index % chartColors.length],
                      }}
                      aria-hidden="true"
                    />

                    <span className="truncate text-sm text-zinc-600">
                      {item.category}
                    </span>
                  </div>

                  <span className="shrink-0 text-sm font-medium text-zinc-900">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
