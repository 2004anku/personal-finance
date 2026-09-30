"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddExpenseModal from "@/components/AddExpenseModal";
import { apiRequest } from "@/app/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type DashboardResponse = {
  summary: {
    total_expenses: number | string;
    this_month: number | string;
    today: number | string;
    average_daily: number | string;
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

  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const [userData, dashboardData, expensesData] = await Promise.all([
        apiRequest<User>("/auth/me", {
          headers: authHeaders,
        }),

        apiRequest<DashboardResponse>("/dashboard", {
          headers: authHeaders,
        }),

        apiRequest<Expense[]>("/expenses", {
          headers: authHeaders,
        }),
      ]);

      setUser(userData);
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

      localStorage.removeItem("access_token");

      setError(
        error instanceof Error ? error.message : "Unable to load dashboard",
      );

      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-700">
            Loading dashboard...
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            Fetching your financial data
          </p>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center">
          <h1 className="text-lg font-semibold text-zinc-900">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {error || "Something went wrong."}
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  const summaryCards = [
    {
      title: "Total Expenses",
      value: formatCurrency(dashboard.summary.total_expenses),
      description: "All time",
    },
    {
      title: "This Month",
      value: formatCurrency(dashboard.summary.this_month),
      description: "This month",
    },
    {
      title: "Today",
      value: formatCurrency(dashboard.summary.today),
      description: "Today",
    },
    {
      title: "Average Daily",
      value: formatCurrency(dashboard.summary.average_daily),
      description: "This month",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Sidebar */}
      <aside className="fixed hidden h-screen w-64 border-r border-zinc-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-zinc-200 px-6">
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Money Tracker</h1>

              <p className="text-xs text-zinc-500">Personal Finance</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            <a
              href="/dashboard"
              className="flex items-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
            >
              Dashboard
            </a>

            <button
              type="button"
              onClick={() => setShowAddExpense(true)}
              className="flex w-full items-center rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              Expenses
            </button>
          </nav>

          {/* User */}
          <div className="border-t border-zinc-200 p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-zinc-900">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-zinc-500">
                {user?.email || ""}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Dashboard</h2>

              <p className="text-sm text-zinc-500">
                Here's an overview of your spending.
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

        {/* Dashboard Content */}
        <div className="space-y-6 p-6 lg:p-8">
          {/* Summary Cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

                <p className="mt-1 text-xs text-zinc-400">{card.description}</p>
              </div>
            ))}
          </section>

          {/* Category + Payment */}
          <section className="grid gap-6 xl:grid-cols-2">
            {/* Category */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-900">
                  Spending by Category
                </h3>

                <p className="text-sm text-zinc-500">
                  Where your money is going this month.
                </p>
              </div>

              <div className="space-y-5">
                {dashboard.categories.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    No expenses recorded yet.
                  </p>
                ) : (
                  dashboard.categories.map((item) => (
                    <div key={item.category}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-700">
                          {item.category}
                        </span>

                        <span className="text-sm text-zinc-500">
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

                      <p className="mt-1 text-right text-xs text-zinc-400">
                        {item.percentage}%
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-900">
                  Spending by Payment Method
                </h3>

                <p className="text-sm text-zinc-500">
                  How you are paying for your expenses.
                </p>
              </div>

              <div className="space-y-5">
                {dashboard.payment_modes.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    No expenses recorded yet.
                  </p>
                ) : (
                  dashboard.payment_modes.map((item) => (
                    <div key={item.payment_mode}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-700">
                          {item.payment_mode}
                        </span>

                        <span className="text-sm text-zinc-500">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-zinc-700"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-right text-xs text-zinc-400">
                        {item.percentage}%
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Recent Expenses */}
          <section className="rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 p-6">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  Recent Expenses
                </h3>

                <p className="text-sm text-zinc-500">
                  Your latest transactions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddExpense(true)}
                className="text-sm font-medium text-zinc-900 hover:underline"
              >
                Add expense
              </button>
            </div>

            <div className="overflow-x-auto">
              {recentExpenses.length === 0 ? (
                <div className="p-6 text-sm text-zinc-400">
                  No expenses recorded yet.
                </div>
              ) : (
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400">
                      <th className="px-6 py-4 font-medium">Category</th>

                      <th className="px-6 py-4 font-medium">Note</th>

                      <th className="px-6 py-4 font-medium">Payment</th>

                      <th className="px-6 py-4 font-medium">Date</th>

                      <th className="px-6 py-4 text-right font-medium">
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

                        <td className="px-6 py-4 text-sm text-zinc-600">
                          {expense.note || "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-zinc-600">
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
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onExpenseAdded={loadDashboard}
      />
    </div>
  );
}
