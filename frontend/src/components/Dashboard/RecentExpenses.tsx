interface Transaction {
  id?: string;
  _id?: string;
  title?: string;
  source?: string;
  description?: string;
  note?: string | null;
  category?: string;
  amount: number;
  expense_date?: string;
  income_date?: string;
  date?: string;
  payment_method?: string;
  payment_mode?: string;
  type: "income" | "expense";
}

interface RecentTransactionsProps {
  expenses: Omit<Transaction, "type">[];
  incomes: Omit<Transaction, "type">[];
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string) {
  if (!value) return "—";

  // Handle date-only values without timezone shifting.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecentTransactions({
  expenses,
  incomes,
}: RecentTransactionsProps) {
  const transactions: Transaction[] = [
    ...expenses.map((expense) => ({
      ...expense,
      type: "expense" as const,
      date: expense.expense_date ?? expense.date,
    })),
    ...incomes.map((income) => ({
      ...income,
      type: "income" as const,
      date: income.income_date ?? income.date ?? income.expense_date,
    })),
  ];

  const recentTransactions = transactions
    .sort((a, b) => {
      const dateA = new Date(a.date ?? "").getTime();
      const dateB = new Date(b.date ?? "").getTime();

      // Keep invalid dates at the bottom.
      if (Number.isNaN(dateA)) return 1;
      if (Number.isNaN(dateB)) return -1;

      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-700/80">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Transactions
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Your latest income and expenses
          </p>
        </div>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center px-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No transactions yet. Add your first income or expense.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-3 font-medium">Transaction</th>
                <th className="px-6 py-3 font-medium">Category / Source</th>
                <th className="px-6 py-3 font-medium">Payment</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentTransactions.map((transaction, index) => {
                const isIncome = transaction.type === "income";

                const transactionTitle = isIncome
                  ? transaction.note?.trim() ||
                    transaction.title?.trim() ||
                    transaction.source?.trim() ||
                    "Income"
                  : transaction.note?.trim() ||
                    transaction.description?.trim() ||
                    transaction.title?.trim() ||
                    "Expense";

                const transactionSubtitle = isIncome
                  ? transaction.source || "Income"
                  : transaction.category || "Expense";

                return (
                  <tr
                    key={
                      transaction.id ??
                      transaction._id ??
                      `${transaction.type}-${transaction.date}-${index}`
                    }
                    className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex min-w-40 items-center gap-3">
                        <span
                          aria-label={isIncome ? "Income" : "Expense"}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                            isIncome
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                          }`}
                        >
                          {isIncome ? "↙" : "↗"}
                        </span>

                        <div className="min-w-0">
                          <p
                            title={transactionTitle}
                            className="max-w-56 truncate font-medium text-zinc-900 dark:text-zinc-100"
                          >
                            {transactionTitle}
                          </p>

                          <p
                            className={`mt-0.5 text-xs ${
                              isIncome
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {transactionSubtitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-zinc-600 dark:text-zinc-300">
                      {isIncome
                        ? transaction.source || "Income"
                        : transaction.category || "Other"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-zinc-600 dark:text-zinc-300">
                      {transaction.payment_method ||
                        transaction.payment_mode ||
                        "—"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      {formatDate(transaction.date)}
                    </td>

                    <td
                      className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {formatCurrency(Number(transaction.amount) || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
