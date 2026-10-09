"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import AddExpenseModal from "@/app/expenses/AddExpenseModal";
import axiosInstance from "@/app/lib/axios";
import { queryKeys } from "@/app/lib/tanstack/query-keys";
import Sidebar from "@/components/Sidebar/Sidebar";

type DashboardResponse = {
  summary: {
    income_this_month: number | string;
    expenses_this_month: number | string;
    balance_this_month: number | string;
  };

  categories: {
    category: string;
    amount: number | string;
    percentage: number;
  }[];

  payment_modes: {
    payment_mode: string;
    amount: number | string;
    percentage: number;
  }[];
};

type Expense = {
  id: string;
  amount: number | string;
  category: string;
  note: string | null;
  payment_mode: string;
  expense_date: string;
};

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

function formatCurrency(value: number | string) {
  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (!error.response) {
      return "Unable to connect to the server. Check that your backend is running.";
    }

    return error.message || "Unable to load dashboard.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load dashboard.";
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication before requesting dashboard data.
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  // Fetch dashboard summary and category/payment breakdowns.
  const {
    data: dashboard,
    isPending: dashboardLoading,
    isError: dashboardIsError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const response = await axiosInstance.get<DashboardResponse>("/dashboard");

      return response.data;
    },
    enabled: authChecked,
  });

  // Fetch and sort the five most recent expenses this month.
  const {
    data: recentExpenses = [],
    isPending: expensesLoading,
    isError: expensesIsError,
    error: expensesError,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: queryKeys.expenses.list("this_month"),
    queryFn: async () => {
      const response = await axiosInstance.get<Expense[]>("/expenses", {
        params: {
          date_range: "this_month",
        },
      });

      return [...response.data]
        .sort(
          (a, b) =>
            new Date(b.expense_date).getTime() -
            new Date(a.expense_date).getTime(),
        )
        .slice(0, 5);
    },
    enabled: authChecked,
  });

  // Handle expired or invalid authentication.
  useEffect(() => {
    const authError = dashboardError ?? expensesError;

    if (axios.isAxiosError(authError) && authError.response?.status === 401) {
      localStorage.removeItem("access_token");

      queryClient.removeQueries({
        queryKey: queryKeys.dashboard,
      });

      queryClient.removeQueries({
        queryKey: queryKeys.expenses.all,
      });

      router.replace("/login");
    }
  }, [dashboardError, expensesError, queryClient, router]);

  const loading = !authChecked || dashboardLoading || expensesLoading;
  const hasError = dashboardIsError || expensesIsError;

  const handleRetry = () => {
    void refetchDashboard();
    void refetchExpenses();
  };

  // Refresh dashboard and expense queries after adding an expense.
  const handleExpenseAdded = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard,
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.all,
      }),
    ]);

    setShowAddExpense(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />

          <p className="text-sm text-zinc-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError || !dashboard) {
    const currentError = dashboardError ?? expensesError;

    // Don't show an error screen while redirecting after a 401.
    if (
      axios.isAxiosError(currentError) &&
      currentError.response?.status === 401
    ) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
          <p className="text-sm text-zinc-500">
            Your session has expired. Redirecting to login...
          </p>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="max-w-md px-6 text-center">
          <h1 className="text-lg font-semibold text-zinc-900">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {getErrorMessage(currentError)}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary } = dashboard;

  const income = Number(summary.income_this_month);
  const expenses = Number(summary.expenses_this_month);
  const balance = Number(summary.balance_this_month);

  const categoryChartData = dashboard.categories.map((item) => ({
    name: item.category,
    value: Number(item.amount),
  }));

  const summaryCards = [
    {
      title: "Income",
      value: income,
      description: "This month",
      icon: ArrowUpRight,
      iconWrapper: "bg-emerald-50 text-emerald-600",
      valueColor: "text-zinc-900",
    },
    {
      title: "Expenses",
      value: expenses,
      description: "This month",
      icon: ArrowDownRight,
      iconWrapper: "bg-red-50 text-red-600",
      valueColor: "text-zinc-900",
    },
    {
      title: "Balance",
      value: balance,
      description: "Income minus expenses",
      icon: Wallet,
      iconWrapper:
        balance >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600",
      valueColor: balance >= 0 ? "text-zinc-900" : "text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />

      <main className="lg:ml-64">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white">
          <div className="flex items-center justify-between px-6 py-5 lg:px-8">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Personal Finance
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Here’s an overview of your finances this month.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddExpense(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>
          </div>
        </header>

        <div className="space-y-6 p-6 lg:p-8">
          {/* Summary */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-500">
                        {card.title}
                      </p>

                      <p
                        className={`mt-3 text-2xl font-bold tracking-tight ${card.valueColor}`}
                      >
                        {formatCurrency(card.value)}
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        {card.description}
                      </p>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconWrapper}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Category Chart */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Spending by Category
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  This month’s expense distribution
                </p>
              </div>

              {categoryChartData.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-center">
                    <Receipt className="mx-auto h-8 w-8 text-zinc-300" />

                    <p className="mt-3 text-sm text-zinc-500">
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
                          data={categoryChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={82}
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          {categoryChartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={chartColors[index % chartColors.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(Number(value ?? 0))
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {dashboard.categories.slice(0, 6).map((item, index) => (
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
                          />

                          <span className="truncate text-sm text-zinc-600">
                            {item.category}
                          </span>
                        </div>

                        <span className="shrink-0 text-sm font-medium text-zinc-900">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Spending by Payment Method
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  This month’s payment distribution
                </p>
              </div>

              {dashboard.payment_modes.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-center">
                    <CreditCard className="mx-auto h-8 w-8 text-zinc-300" />

                    <p className="mt-3 text-sm text-zinc-500">
                      No payment data available this month.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {dashboard.payment_modes.map((item) => (
                    <div key={item.payment_mode}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                            <CreditCard className="h-4 w-4 text-zinc-600" />
                          </div>

                          <span className="text-sm font-medium text-zinc-700">
                            {item.payment_mode}
                          </span>
                        </div>

                        <span className="text-sm font-semibold text-zinc-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              Math.max(item.percentage, 0),
                              100,
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1.5 text-xs text-zinc-400">
                        {item.percentage}% of monthly expenses
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent Expenses */}
          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Recent Expenses
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Your latest expenses this month
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/expenses")}
                className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
              >
                View all
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Receipt className="mx-auto h-8 w-8 text-zinc-300" />

                <p className="mt-3 text-sm text-zinc-500">
                  No expenses recorded this month.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/70 text-left">
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Category
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Note
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Payment
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Date
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-zinc-100 transition last:border-0 hover:bg-zinc-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                              <Receipt className="h-4 w-4 text-zinc-600" />
                            </div>

                            <span className="text-sm font-medium text-zinc-900">
                              {expense.category}
                            </span>
                          </div>
                        </td>

                        <td className="max-w-xs px-6 py-4 text-sm text-zinc-500">
                          <span className="block truncate">
                            {expense.note || "-"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {expense.payment_mode}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                          {formatDate(expense.expense_date)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-zinc-900">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  );
}
