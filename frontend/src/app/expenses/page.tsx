"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddExpenseModal from "@/components/AddExpenseModal";
import { apiRequest } from "@/app/lib/api";

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

export default function ExpensesPage() {
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadExpenses() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Expense[]>("/expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedExpenses = [...data].sort(
        (a, b) =>
          new Date(b.expense_date).getTime() -
          new Date(a.expense_date).getTime(),
      );

      setExpenses(sortedExpenses);
    } catch (error) {
      console.error("Failed to load expenses:", error);

      setError(
        error instanceof Error ? error.message : "Unable to load expenses.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function handleDeleteExpense(expenseId: string) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingExpenseId(expenseId);
      setError("");

      await apiRequest(`/expenses/${expenseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await loadExpenses();
    } catch (error) {
      console.error("Failed to delete expense:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete expense. Please try again.",
      );
    } finally {
      setDeletingExpenseId(null);
    }
  }
  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-zinc-200 bg-white lg:block">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-20 items-center border-b border-zinc-200 px-6">
              <div>
                <h1 className="text-xl font-bold text-zinc-900">
                  Money Tracker
                </h1>

                <p className="text-xs text-zinc-500">Personal Finance</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                Dashboard
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
              >
                <span>▤</span>
                Expenses
              </button>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 lg:ml-0">
          {/* Header */}
          <header className="border-b border-zinc-200 bg-white">
            <div className="flex h-20 items-center justify-between px-6 lg:px-8">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Expenses</h2>

                <p className="text-sm text-zinc-500">
                  Manage all your expenses.
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

          {/* Content */}
          <div className="space-y-6 p-6 lg:p-8">
            <section className="rounded-xl border border-zinc-200 bg-white">
              {/* Section Header */}
              <div className="border-b border-zinc-200 p-6">
                <h3 className="text-lg font-semibold text-zinc-900">
                  All Expenses
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Your complete expense history.
                </p>
              </div>

              {/* Loading */}
              {loading && (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-zinc-700">
                    Loading expenses...
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    Fetching your expense history
                  </p>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-red-600">
                    Unable to load expenses
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">{error}</p>

                  <button
                    type="button"
                    onClick={loadExpenses}
                    className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && expenses.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-zinc-700">
                    No expenses recorded yet.
                  </p>

                  <p className="mt-1 text-sm text-zinc-400">
                    Start tracking your spending by adding your first expense.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowAddExpense(true)}
                    className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    + Add Expense
                  </button>
                </div>
              )}

              {/* Desktop Table */}
              {!loading && !error && expenses.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400">
                        <th className="px-6 py-4 font-medium">Category</th>

                        <th className="px-6 py-4 font-medium">Note</th>

                        <th className="px-6 py-4 font-medium">Payment</th>

                        <th className="px-6 py-4 font-medium">Date</th>

                        <th className="px-6 py-4 text-right font-medium">
                          Amount
                        </th>

                        <th className="px-6 py-4 text-right font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {expenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                            {expense.category}
                          </td>

                          <td className="max-w-xs px-6 py-4 text-sm text-zinc-600">
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

                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingExpense(expense)}
                                className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteExpense(expense.id)}
                                disabled={deletingExpenseId === expense.id}
                                className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingExpenseId === expense.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
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
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpense || Boolean(editingExpense)}
        onClose={() => {
          setShowAddExpense(false);
          setEditingExpense(null);
        }}
        onExpenseAdded={loadExpenses}
        expense={editingExpense}
      />
    </div>
  );
}
