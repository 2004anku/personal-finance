interface Expense {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  category?: string;
  amount: number;
  expense_date: string;
  payment_method?: string;
}

interface RecentExpensesProps {
  expenses: Expense[];
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recentExpenses = [...expenses]
    .sort(
      (a, b) =>
        new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Recent Expenses
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Your latest transactions</p>
        </div>
      </div>

      {recentExpenses.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center px-6">
          <p className="text-sm text-zinc-500">No recent expenses found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full  text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Note</th>
                <th className="px-6 py-3 font-medium">Payment</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {recentExpenses.map((expense, index) => (
                <tr
                  key={
                    expense.id ??
                    expense._id ??
                    `${expense.expense_date}-${index}`
                  }
                  className="transition-colors hover:bg-zinc-50"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                      {expense.category || "Uncategorized"}
                    </span>
                  </td>

                  <td className="max-w-48 truncate px-6 py-4 text-zinc-600">
                    {expense.description || expense.title || "—"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-zinc-600">
                    {expense.payment_method || "—"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-zinc-500">
                    {formatDate(expense.expense_date)}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-zinc-900">
                    {formatCurrency(Number(expense.amount) || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
