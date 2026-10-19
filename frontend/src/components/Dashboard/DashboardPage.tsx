"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";

import AddExpenseModal from "@/app/expenses/AddExpenseModal";
import axiosInstance from "@/lib/axios/axios";
import { queryKeys } from "@/lib/tanstack/query-keys";
import Sidebar from "@/components/Sidebar/Sidebar";
import IncomeExpenseChart, {
  type IncomeExpensePoint,
} from "./IncomeExpenseChart";
import SummaryCards from "./SummaryCards";
import CategoryChart from "./CategoryChart";
import PaymentMethods from "./PaymentMethods";
import RecentTransactions from "./RecentExpenses";
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

type Income = {
  id: string;
  amount: number | string;
  source: string;
  payment_mode: string;
  note: string | null;
  income_date: string;
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

function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

function getDateKey(date: string): string {
  // Supports API dates such as YYYY-MM-DD without timezone shifts.
  return date.slice(0, 10);
}

function getLast30DaysChartData(
  expenses: Expense[],
  incomes: Income[],
): IncomeExpensePoint[] {
  const dailyTotals = new Map<
    string,
    { date: string; income: number; expenses: number }
  >();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 29; offset >= 0; offset--) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);

    const dateKey = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, "0"),
      String(day.getDate()).padStart(2, "0"),
    ].join("-");

    dailyTotals.set(dateKey, {
      date: dateKey,
      income: 0,
      expenses: 0,
    });
  }

  for (const expense of expenses) {
    const dateKey = getDateKey(expense.expense_date);
    const day = dailyTotals.get(dateKey);

    if (day) {
      day.expenses += Number(expense.amount) || 0;
    }
  }

  for (const income of incomes) {
    const dateKey = getDateKey(income.income_date);
    const day = dailyTotals.get(dateKey);

    if (day) {
      day.income += Number(income.amount) || 0;
    }
  }

  return Array.from(dailyTotals.values());
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

  const {
    data: recentIncomes = [],
    isPending: incomesLoading,
    isError: incomesIsError,
    error: incomesError,
    refetch: refetchIncomes,
  } = useQuery({
    queryKey: [...queryKeys.income.list, "dashboard-recent"],
    queryFn: async () => {
      const response = await axiosInstance.get<Income[]>("/incomes");

      return [...response.data]
        .sort(
          (a, b) =>
            new Date(b.income_date).getTime() -
            new Date(a.income_date).getTime(),
        )
        .slice(0, 5);
    },
    enabled: authChecked,
  });

  const {
    data: chartExpenses = [],
    isPending: chartExpensesLoading,
    isError: chartExpensesError,
    error: chartExpensesQueryError,
    refetch: refetchChartExpenses,
  } = useQuery({
    queryKey: [...queryKeys.expenses.list("all"), "income-expense-chart"],
    queryFn: async () => {
      const response = await axiosInstance.get<Expense[]>("/expenses");
      return response.data;
    },
    enabled: authChecked,
  });

  const {
    data: chartIncomes = [],
    isPending: chartIncomesLoading,
    isError: chartIncomesError,
    error: chartIncomesQueryError,
    refetch: refetchChartIncomes,
  } = useQuery({
    queryKey: [...queryKeys.income.list, "income-expense-chart"],
    queryFn: async () => {
      const response = await axiosInstance.get<Income[]>("/incomes");
      return response.data;
    },
    enabled: authChecked,
  });

  const chartData = useMemo(
    () => getLast30DaysChartData(chartExpenses, chartIncomes),
    [chartExpenses, chartIncomes],
  );

  useEffect(() => {
    const errors = [
      dashboardError,
      expensesError,
      incomesError,
      chartExpensesQueryError,
      chartIncomesQueryError,
    ];

    if (errors.some(isUnauthorized)) {
      localStorage.removeItem("access_token");
      queryClient.clear();
      router.replace("/login");
    }
  }, [
    dashboardError,
    expensesError,
    incomesError,
    chartExpensesQueryError,
    chartIncomesQueryError,
    queryClient,
    router,
  ]);

  const loading = !authChecked || dashboardLoading || expensesLoading;
  const hasError = dashboardIsError || expensesIsError;

  const handleRetry = () => {
    void refetchDashboard();
    void refetchExpenses();
    void refetchIncomes();
    void refetchChartExpenses();
    void refetchChartIncomes();
  };

  const handleExpenseAdded = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard,
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.all,
      }),
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.expenses.list("all"), "income-expense-chart"],
      }),
    ]);

    setShowAddExpense(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
        <DashboardStatus type="loading" />
      </div>
    );
  }

  if (hasError || !dashboard) {
    const currentError = dashboardError ?? expensesError;

    if (isUnauthorized(currentError)) {
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
        <Sidebar />
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

            <button
              type="button"
              onClick={() => setShowAddExpense(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-background"
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add Expense</span>
            </button>
          </div>
        </header>

        <div className="space-y-6 p-5 sm:p-6 lg:p-8">
          <SummaryCards
            totalIncome={income}
            totalExpenses={expenses}
            balance={balance}
          />

          <IncomeExpenseChart
            data={chartData}
            isLoading={chartExpensesLoading || chartIncomesLoading}
            isError={chartExpensesError || chartIncomesError}
            onRetry={() => {
              void refetchChartExpenses();
              void refetchChartIncomes();
            }}
          />

          <section
            aria-label="Expense analytics"
            className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2"
          >
            <CategoryChart data={categoryData} />
            <PaymentMethods data={paymentData} />
          </section>

          <RecentTransactions
            expenses={recentExpenses.map((expense) => ({
              id: expense.id,
              amount: Number(expense.amount),
              category: expense.category,
              description: expense.note ?? undefined,
              expense_date: expense.expense_date,
              payment_method: expense.payment_mode,
            }))}
            incomes={recentIncomes.map((income) => ({
              ...income,
              amount: Number(income.amount),
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
