"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";

import ThemeToggle from "@/components/Theme/ThemeToggle";
import AddExpenseModal from "@/app/expenses/AddExpenseModal";
import axiosInstance from "@/lib/axios/axios";
import { queryKeys } from "@/lib/tanstack/query-keys";
import Sidebar from "@/components/Sidebar/Sidebar";

import SummaryCards from "./SummaryCards";
import CategoryChart from "./CategoryChart";
import PaymentMethods from "./PaymentMethods";
import RecentExpenses from "./RecentExpenses";
import DashboardStatus from "./DashboardStatus";

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

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthChecked(true);
  }, [router]);

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
        params: { date_range: "this_month" },
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
      <div className="min-h-screen bg-background text-foreground">
        <DashboardStatus type="loading" />
      </div>
    );
  }

  if (hasError || !dashboard) {
    const currentError = dashboardError ?? expensesError;

    if (
      axios.isAxiosError(currentError) &&
      currentError.response?.status === 401
    ) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
          <p className="text-sm text-text-secondary">
            Your session has expired. Redirecting to login...
          </p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background text-foreground">
        <DashboardStatus
          type="error"
          message={getErrorMessage(currentError)}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  const income = Number(dashboard.summary.income_this_month);
  const expenses = Number(dashboard.summary.expenses_this_month);
  const balance = Number(dashboard.summary.balance_this_month);

  const categoryData = dashboard.categories.map((item) => ({
    category: item.category,
    amount: Number(item.amount),
  }));

  const paymentData = dashboard.payment_modes.map((item) => ({
    payment_mode: item.payment_mode,
    amount: Number(item.amount),
    percentage: Number(item.percentage),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Sidebar />

      <main className="min-w-0 lg:ml-64">
        <header className="border-b border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                Personal Finance
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Here’s an overview of your finances this month.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <ThemeToggle />

              <button
                type="button"
                onClick={() => setShowAddExpense(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-background"
              >
                <Plus size={16} aria-hidden="true" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-5 sm:p-6 lg:p-8">
          <SummaryCards
            totalIncome={income}
            totalExpenses={expenses}
            balance={balance}
          />

          <section
            aria-label="Expense analytics"
            className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2"
          >
            <CategoryChart data={categoryData} />
            <PaymentMethods data={paymentData} />
          </section>

          <RecentExpenses
            expenses={recentExpenses.map((expense) => ({
              id: expense.id,
              amount: Number(expense.amount),
              category: expense.category,
              description: expense.note ?? undefined,
              expense_date: expense.expense_date,
              payment_method: expense.payment_mode,
            }))}
          />
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
