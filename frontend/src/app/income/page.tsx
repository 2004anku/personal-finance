"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AddIncomeModal from "@/app/income/AddIncomeModal";
import { apiRequest } from "@/app/lib/api";
import Sidebar from "@/components/Sidebar/Sidebar";

type Income = {
  id: string;
  amount: number | string;
  source: string;
  note: string | null;
  income_date: string;
};

type IncomeDateRange = "all" | "this_month" | "last_6_months" | "last_year";

const FILTER_OPTIONS: {
  value: IncomeDateRange;
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

export default function IncomePage() {
  const router = useRouter();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<IncomeDateRange>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadIncomes(dateRange: IncomeDateRange = selectedFilter) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const endpoint =
        dateRange === "all" ? "/incomes" : `/incomes?date_range=${dateRange}`;

      const data = await apiRequest<Income[]>(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedIncomes = [...data].sort(
        (a, b) =>
          new Date(b.income_date).getTime() - new Date(a.income_date).getTime(),
      );

      setIncomes(sortedIncomes);
    } catch (error) {
      console.error("Failed to load incomes:", error);

      setError(
        error instanceof Error ? error.message : "Unable to load incomes.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(dateRange: IncomeDateRange) {
    setSelectedFilter(dateRange);
    setShowFilter(false);

    loadIncomes(dateRange);
  }

  async function handleDeleteIncome(incomeId: string) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this income?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingIncomeId(incomeId);
      setError("");

      await apiRequest(`/incomes/${incomeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await loadIncomes();
    } catch (error) {
      console.error("Failed to delete income:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete income. Please try again.",
      );
    } finally {
      setDeletingIncomeId(null);
    }
  }

  useEffect(() => {
    loadIncomes("all");
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
                  Income
                </h2>

                <p className="font-primary text-label text-zinc-500">
                  Manage all your income.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddIncome(true)}
                className="rounded-lg bg-zinc-900 px-4 py-2.5 font-primary text-label font-medium text-white transition hover:bg-zinc-800"
              >
                + Add Income
              </button>
            </div>
          </header>

          <div className="space-y-6 p-6 lg:p-8">
            <section className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 p-6">
                <h3 className="font-heading text-section-title font-semibold text-zinc-900">
                  All Income
                </h3>

                <p className="mt-1 font-primary text-label text-zinc-500">
                  Your complete income history.
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
                    Loading income...
                  </p>

                  <p className="mt-1 font-primary text-caption text-zinc-400">
                    Fetching your income history
                  </p>
                </div>
              )}

              {!loading && error && (
                <div className="p-8 text-center">
                  <p className="font-primary text-label font-medium text-red-600">
                    Unable to load income
                  </p>

                  <p className="mt-1 font-primary text-label text-zinc-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => loadIncomes()}
                    className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 font-primary text-label font-medium text-white hover:bg-zinc-800"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && incomes.length === 0 && (
                <div className="p-8 text-center">
                  <p className="font-primary text-label font-medium text-zinc-700">
                    No income found for this period.
                  </p>

                  <p className="mt-1 font-primary text-label text-zinc-400">
                    Try selecting a different date range.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowAddIncome(true)}
                    className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 font-primary text-label font-medium text-white hover:bg-zinc-800"
                  >
                    + Add Income
                  </button>
                </div>
              )}

              {!loading && !error && incomes.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 font-primary text-caption uppercase tracking-wide text-zinc-400">
                        <th className="px-6 py-4 font-medium">Source</th>

                        <th className="px-6 py-4 font-medium">Note</th>

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
                      {incomes.map((income) => (
                        <tr
                          key={income.id}
                          className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                        >
                          <td className="px-6 py-4 font-primary text-label font-medium text-zinc-900">
                            {income.source}
                          </td>

                          <td className="max-w-xs px-6 py-4 font-primary text-label text-zinc-600">
                            {income.note || "—"}
                          </td>

                          <td className="px-6 py-4 font-primary text-label text-zinc-500">
                            {formatDate(income.income_date)}
                          </td>

                          <td className="px-6 py-4 text-right font-primary text-label font-semibold text-green-600">
                            +{formatCurrency(income.amount)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingIncome(income)}
                                className="rounded-md px-3 py-1.5 font-primary text-caption font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteIncome(income.id)}
                                disabled={deletingIncomeId === income.id}
                                className="rounded-md px-3 py-1.5 font-primary text-caption font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingIncomeId === income.id
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

      <AddIncomeModal
        isOpen={showAddIncome || Boolean(editingIncome)}
        onClose={() => {
          setShowAddIncome(false);
          setEditingIncome(null);
        }}
        onIncomeAdded={loadIncomes}
        income={editingIncome}
      />
    </div>
  );
}
