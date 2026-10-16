"use client";

import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Filter,
  Pencil,
  Plus,
  TrendingUp,
  RefreshCw,
  Trash2,
} from "lucide-react";

import axiosInstance from "@/lib/axios/axios";
import { queryKeys } from "@/lib/tanstack/query-keys";
import AddIncomeModal from "@/app/income/AddIncomeModal";
import Sidebar from "@/components/Sidebar/Sidebar";

export type Income = {
  id: string;
  amount: number | string;
  source: string;
  payment_mode: "UPI" | "Cash";
  note: string | null;
  income_date: string;
};
export type IncomePaymentMode = "UPI" | "Cash";
type IncomeDateRange = "all" | "this_month" | "last_6_months" | "last_year";

const FILTER_OPTIONS: { value: IncomeDateRange; label: string }[] = [
  { value: "all", label: "All" },
  { value: "this_month", label: "This Month" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "last_year", label: "Last 1 Year" },
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

function isAuthenticationError(error: unknown): boolean {
  return (
    (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") ||
    (isAxiosError(error) && error.response?.status === 401)
  );
}

export default function IncomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<IncomeDateRange>("all");
  const [error, setError] = useState("");

  const {
    data: incomes = [],
    isPending: loading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.income.list, selectedFilter],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("AUTHENTICATION_REQUIRED");
      }

      const response = await axiosInstance.get<Income[]>("/incomes", {
        params:
          selectedFilter === "all" ? undefined : { date_range: selectedFilter },
      });

      return [...response.data].sort(
        (a, b) =>
          new Date(b.income_date).getTime() - new Date(a.income_date).getTime(),
      );
    },
    retry: (failureCount, error) =>
      !isAuthenticationError(error) && failureCount < 1,
  });

  useEffect(() => {
    if (isAuthenticationError(queryError)) {
      localStorage.removeItem("access_token");
      router.replace("/login");
    }
  }, [queryError, router]);

  const deleteIncomeMutation = useMutation({
    mutationFn: async (incomeId: string) => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("AUTHENTICATION_REQUIRED");
      }

      await axiosInstance.delete(`/incomes/${incomeId}`);
    },
    onMutate: () => {
      setError("");
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.income.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
    },
    onError: (mutationError: unknown) => {
      if (isAuthenticationError(mutationError)) {
        localStorage.removeItem("access_token");
        router.replace("/login");
        return;
      }

      if (isAxiosError(mutationError)) {
        const detail = mutationError.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to delete income. Please try again.",
        );
        return;
      }

      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to delete income. Please try again.",
      );
    },
    onSettled: () => {
      setDeletingIncomeId(null);
    },
  });

  function handleFilterChange(dateRange: IncomeDateRange) {
    setSelectedFilter(dateRange);
    setShowFilter(false);
    setError("");
  }

  function handleDeleteIncome(incomeId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this income?",
    );

    if (!confirmed) return;

    setDeletingIncomeId(incomeId);
    deleteIncomeMutation.mutate(incomeId);
  }

  async function handleIncomeSaved() {
    setShowAddIncome(false);
    setEditingIncome(null);
    setError("");

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ]);
  }

  const displayError =
    error ||
    (isError
      ? queryError instanceof Error
        ? queryError.message
        : "Unable to load income."
      : "");

  return (
    <div className="min-h-screen bg-green-50/60 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="min-w-0 flex-1 lg:ml-64">
          <header className="sticky top-0 z-10 isolate overflow-hidden border-b border-green-100 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
            {/* Animated cash-flow background */}
            <div
              className="cash-flow-track absolute inset-0 z-0 pointer-events-none"
              aria-hidden="true"
            />

            {/* Header content */}
            <div className="relative z-10 flex min-h-28 items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
              <div>
                <h2 className="font-heading text-page-title font-bold text-zinc-900 dark:text-zinc-100">
                  Income
                </h2>

                <p className="mt-1 font-primary text-label text-zinc-500 dark:text-zinc-400">
                  Manage and track all your income.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddIncome(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-green-700 px-3 py-2.5 font-primary text-label font-medium text-white transition hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400 dark:focus-visible:ring-offset-zinc-900"
              >
                <Plus size={18} strokeWidth={2} aria-hidden="true" />
                <span className="hidden sm:inline">Add Income</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </header>

          <div className="space-y-6 p-5 sm:p-6 lg:p-8">
            <section className="overflow-visible rounded-xl border border-green-100 bg-white shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 p-5 sm:p-6 dark:border-zinc-800">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400">
                      <TrendingUp
                        size={21}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h3 className="font-heading text-section-title font-semibold text-zinc-900 dark:text-zinc-100">
                        All Income
                      </h3>
                      <p className="mt-1 font-primary text-label text-zinc-500 dark:text-zinc-400">
                        Your complete income history.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowFilter((current) => !current)}
                      aria-expanded={showFilter}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 font-primary text-label font-medium text-zinc-700 transition hover:border-green-300 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-green-700 dark:hover:bg-zinc-800"
                    >
                      <Filter size={16} strokeWidth={1.8} aria-hidden="true" />
                      <span>
                        {FILTER_OPTIONS.find(
                          (option) => option.value === selectedFilter,
                        )?.label ?? "Filter"}
                      </span>
                    </button>

                    {showFilter && (
                      <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                        {FILTER_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleFilterChange(option.value)}
                            className={`w-full rounded-lg px-3 py-2.5 text-left font-primary text-label transition ${
                              selectedFilter === option.value
                                ? "bg-green-50 font-medium text-green-800 dark:bg-green-500/15 dark:text-green-400"
                                : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {loading && (
                <div className="p-10 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-100 border-t-green-700 dark:border-zinc-700 dark:border-t-green-400" />
                  <p className="mt-4 font-primary text-label font-medium text-zinc-700 dark:text-zinc-200">
                    Loading income...
                  </p>
                  <p className="mt-1 font-primary text-caption text-zinc-400 dark:text-zinc-500">
                    Fetching your income history
                  </p>
                </div>
              )}

              {!loading && displayError && (
                <div className="p-8 text-center">
                  <p className="font-primary text-label font-semibold text-red-600 dark:text-red-400">
                    Unable to load income
                  </p>
                  <p className="mx-auto mt-1 max-w-xl wrap-break-word font-primary text-label text-zinc-500 dark:text-zinc-400">
                    {displayError}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      void refetch();
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 font-primary text-label font-medium text-white transition hover:bg-green-800 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400"
                  >
                    <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}

              {!loading && !displayError && incomes.length === 0 && (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <CalendarDays
                      size={24}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-4 font-primary text-label font-semibold text-zinc-800 dark:text-zinc-200">
                    No income found for this period.
                  </p>
                  <p className="mt-1 font-primary text-label text-zinc-500 dark:text-zinc-400">
                    Try another date range or add your first income.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddIncome(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 font-primary text-label font-medium text-white transition hover:bg-green-800 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400"
                  >
                    <Plus size={16} strokeWidth={2} aria-hidden="true" />
                    <span>Add Income</span>
                  </button>
                </div>
              )}

              {!loading && !displayError && incomes.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-190 text-left">
                    <thead className="bg-green-50/70 dark:bg-zinc-800/80">
                      <tr className="border-b border-zinc-200 font-primary text-caption uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                        <th scope="col" className="px-6 py-4 font-semibold">
                          Source
                        </th>
                        <th scope="col" className="px-6 py-4 font-semibold">
                          Note
                        </th>
                        <th scope="col" className="px-6 py-4 font-semibold">
                          Payment
                        </th>
                        <th scope="col" className="px-6 py-4 font-semibold">
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-right font-semibold"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-right font-semibold"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {incomes.map((income) => (
                        <tr
                          key={income.id}
                          className="transition-colors hover:bg-green-50/60 dark:hover:bg-zinc-800/60"
                        >
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 font-primary text-label font-medium text-green-800 dark:bg-green-500/10 dark:text-green-400">
                              {income.source}
                            </span>
                          </td>

                          <td className="max-w-xs truncate px-6 py-4 font-primary text-label text-zinc-600 dark:text-zinc-300">
                            {income.note || "—"}
                          </td>

                          <td className="px-6 py-4 font-primary text-label text-zinc-600 dark:text-zinc-300">
                            {income.payment_mode}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 font-primary text-label text-zinc-500 dark:text-zinc-400">
                            {formatDate(income.income_date)}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-right font-primary text-label font-semibold text-green-700 dark:text-green-400">
                            +{formatCurrency(income.amount)}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingIncome(income)}
                                aria-label={`Edit income: ${income.source}`}
                                title="Edit income"
                                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-primary text-caption font-medium text-zinc-600 transition hover:bg-green-100 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:text-zinc-300 dark:hover:bg-green-500/15 dark:hover:text-green-400"
                              >
                                <Pencil
                                  size={14}
                                  strokeWidth={1.8}
                                  aria-hidden="true"
                                />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteIncome(income.id)}
                                disabled={deletingIncomeId === income.id}
                                aria-label={`Delete income: ${income.source}`}
                                title="Delete income"
                                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-primary text-caption font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
                              >
                                <Trash2
                                  size={14}
                                  strokeWidth={1.8}
                                  aria-hidden="true"
                                />
                                <span>
                                  {deletingIncomeId === income.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </span>
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
        onIncomeAdded={handleIncomeSaved}
        income={editingIncome}
      />
    </div>
  );
}
