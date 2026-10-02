"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AddExpenseModal from "@/app/expenses/AddExpenseModal";
import { apiRequest } from "@/app/lib/api";
import Sidebar from "@/components/Sidebar/Sidebar";

type Expense = {
  id: string;
  amount: number | string;
  category: string;
  note: string | null;
  payment_mode: string;
  expense_date: string;
};

type ExpenseDateRange = "all" | "this_month" | "last_6_months" | "last_year";

const FILTER_OPTIONS: {
  value: ExpenseDateRange;
  label: string;
}[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "this_month",
    label: "This Month",
  },
  {
    value: "last_6_months",
    label: "Last 6 Months",
  },
  {
    value: "last_year",
    label: "Last 1 Year",
  },
];

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

  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ExpenseDateRange>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadExpenses(dateRange: ExpenseDateRange = selectedFilter) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const endpoint =
        dateRange === "all" ? "/expenses" : `/expenses?date_range=${dateRange}`;

      const data = await apiRequest<Expense[]>(endpoint, {
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

  function handleFilterChange(dateRange: ExpenseDateRange) {
    setSelectedFilter(dateRange);
    setShowFilter(false);

    loadExpenses(dateRange);
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
    loadExpenses("all");
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 lg:ml-64">
          <header className="border-b border-zinc-200 bg-white">
            <div className="flex h-20 items-center justify-between px-6 lg:px-8">
              <div>
                <h2 className="font-heading text-page-title font-bold text-zinc-900">
                  Expenses
                </h2>

                <p className="font-primary text-label text-zinc-500">
                  Manage all your expenses.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddExpense(true)}
                className="rounded-lg bg-zinc-900 px-4 py-2.5 font-primary text-label font-medium text-white transition hover:bg-zinc-800"
              >
                + Add Expense
              </button>
            </div>
          </header>

          <div className="space-y-6 p-6 lg:p-8">
            <section className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 p-6">
                <h3 className="font-heading text-section-title font-semibold text-zinc-900">
                  All Expenses
                </h3>

                <p className="mt-1 font-primary text-label text-zinc-500">
                  Your complete expense history.
                </p>

                <div className="relative mt-4">
                  <button
                    type="button"
                    onClick={() => setShowFilter((current) => !current)}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 font-primary text-label font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Filter
                  </button>

                  {showFilter && (
                    <div className="absolute left-0 top-full z-20 mt-2 w-52 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
                      {FILTER_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleFilterChange(option.value)}
                          className={`w-full rounded-md px-3 py-2 text-left font-primary text-label transition ${
                            selectedFilter === option.value
                              ? "bg-zinc-100 font-medium text-zinc-900"
                              : "text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {loading && (
                <div className="p-8 text-center">
                  <p className="font-primary text-label font-medium text-zinc-700">
                    Loading expenses...
                  </p>

                  <p className="mt-1 font-primary text-caption text-zinc-400">
                    Fetching your expense history
                  </p>
                </div>
              )}

              {!loading && error && (
                <div className="p-8 text-center">
                  <p className="font-primary text-label font-medium text-red-600">
                    Unable to load expenses
                  </p>

                  <p className="mt-1 font-primary text-label text-zinc-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => loadExpenses()}
                    className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 font-primary text-label font-medium text-white hover:bg-zinc-800"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && expenses.length === 0 && (
                <div className="p-8 text-center">
                  <p className="font-primary text-label font-medium text-zinc-700">
                    No expenses found for this period.
                  </p>

                  <p className="mt-1 font-primary text-label text-zinc-400">
                    Try selecting a different date range.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowAddExpense(true)}
                    className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 font-primary text-label font-medium text-white hover:bg-zinc-800"
                  >
                    + Add Expense
                  </button>
                </div>
              )}

              {!loading && !error && expenses.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 font-primary text-caption uppercase tracking-wide text-zinc-400">
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
                          <td className="px-6 py-4 font-primary text-label font-medium text-zinc-900">
                            {expense.category}
                          </td>

                          <td className="max-w-xs px-6 py-4 font-primary text-label text-zinc-600">
                            {expense.note || "—"}
                          </td>

                          <td className="px-6 py-4 font-primary text-label text-zinc-600">
                            {expense.payment_mode}
                          </td>

                          <td className="px-6 py-4 font-primary text-label text-zinc-500">
                            {formatDate(expense.expense_date)}
                          </td>

                          <td className="px-6 py-4 text-right font-primary text-label font-semibold text-zinc-900">
                            {formatCurrency(expense.amount)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingExpense(expense)}
                                className="rounded-md px-3 py-1.5 font-primary text-caption font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteExpense(expense.id)}
                                disabled={deletingExpenseId === expense.id}
                                className="rounded-md px-3 py-1.5 font-primary text-caption font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
