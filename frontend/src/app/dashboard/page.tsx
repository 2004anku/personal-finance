"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AddExpenseModal from "@/app/expenses/AddExpenseModal";
import { apiRequest } from "@/app/lib/api";
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

function formatCurrency(value: number | string) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();

  const [showAddExpense, setShowAddExpense] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const [dashboardData, expensesData] = await Promise.all([
        apiRequest<DashboardResponse>("/dashboard", {
          headers: authHeaders,
        }),

        apiRequest<Expense[]>("/expenses?date_range=this_month", {
          headers: authHeaders,
        }),
      ]);

      setDashboard(dashboardData);

      const sortedExpenses = [...expensesData]
        .sort(
          (a, b) =>
            new Date(b.expense_date).getTime() -
            new Date(a.expense_date).getTime(),
        )
        .slice(0, 5);

      setRecentExpenses(sortedExpenses);
    } catch (error) {
      console.error("Failed to load dashboard:", error);

      if (
        error instanceof Error &&
        error.message === "AUTHENTICATION_REQUIRED"
      ) {
        localStorage.removeItem("access_token");
        router.replace("/login");
        return;
      }

      setError(
        error instanceof Error ? error.message : "Unable to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-sm text-zinc-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-zinc-900">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {error || "Something went wrong."}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary } = dashboard;

  const summaryCards = [
    {
      title: "Income",
      value: formatCurrency(summary.income_this_month),
    },
    {
      title: "Expenses",
      value: formatCurrency(summary.expenses_this_month),
    },
    {
      title: "Balance",
      value: formatCurrency(summary.balance_this_month),
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-100">
      <Sidebar />

      <main className="lg:ml-64">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white px-6 py-5 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>

              <p className="mt-1 text-sm text-zinc-500">
                Here’s an overview of your finances this month.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddExpense(true)}
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              + Add Expense
            </button>
          </div>
        </header>

        <div className="space-y-6 p-6 lg:p-8">
          {/* Monthly Summary */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-zinc-200 bg-white p-5"
              >
                <p className="text-sm font-medium text-zinc-500">
                  {card.title}
                </p>

                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  {card.value}
                </p>

                <p className="mt-1 text-xs text-zinc-400">This month</p>
              </div>
            ))}
          </section>

          {/* Category + Payment */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Categories */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Spending by Category
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  This month’s expense distribution
                </p>
              </div>

              {dashboard.categories.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No expenses recorded this month.
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboard.categories.map((item) => (
                    <div key={item.category}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-zinc-700">
                          {item.category}
                        </span>

                        <span className="text-sm font-medium text-zinc-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-zinc-900"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-zinc-400">
                        {item.percentage}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Modes */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Spending by Payment Method
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  This month’s payment distribution
                </p>
              </div>

              {dashboard.payment_modes.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No payment data available this month.
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboard.payment_modes.map((item) => (
                    <div key={item.payment_mode}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-zinc-700">
                          {item.payment_mode}
                        </span>

                        <span className="text-sm font-medium text-zinc-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-zinc-900"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-zinc-400">
                        {item.percentage}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent Expenses */}
          <section className="rounded-xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900">
                Recent Expenses
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Your latest expenses this month
              </p>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">
                No expenses recorded this month.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left">
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Category
                      </th>

                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Note
                      </th>

                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Payment
                      </th>

                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Date
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-zinc-100 last:border-0"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                          {expense.category}
                        </td>

                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {expense.note || "-"}
                        </td>

                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {expense.payment_mode}
                        </td>

                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {formatDate(expense.expense_date)}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-zinc-900">
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
        onExpenseAdded={loadDashboard}
      />
    </div>
  );
}
