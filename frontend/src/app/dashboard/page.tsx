const summaryCards = [
  {
    title: "Total Expenses",
    value: "₹42,580",
    description: "All time",
  },
  {
    title: "This Month",
    value: "₹8,450",
    description: "September 2026",
  },
  {
    title: "Today",
    value: "₹750",
    description: "29 September",
  },
  {
    title: "Average Daily",
    value: "₹940",
    description: "This month",
  },
];

const categoryExpenses = [
  { category: "Food", amount: "₹3,200", percentage: 38 },
  { category: "Travel", amount: "₹1,850", percentage: 22 },
  { category: "Shopping", amount: "₹1,450", percentage: 17 },
  { category: "Bills", amount: "₹1,100", percentage: 13 },
  { category: "Entertainment", amount: "₹850", percentage: 10 },
];

const paymentMethods = [
  { method: "UPI", amount: "₹4,250", percentage: 50 },
  { method: "Card", amount: "₹2,350", percentage: 28 },
  { method: "Cash", amount: "₹1,250", percentage: 15 },
  { method: "Bank Transfer", amount: "₹600", percentage: 7 },
];

const recentExpenses = [
  {
    category: "Food",
    note: "Lunch",
    paymentMode: "UPI",
    date: "29 Sep 2026",
    amount: "₹350",
  },
  {
    category: "Travel",
    note: "Auto Rickshaw",
    paymentMode: "Cash",
    date: "29 Sep 2026",
    amount: "₹200",
  },
  {
    category: "Shopping",
    note: "T-shirt",
    paymentMode: "Card",
    date: "28 Sep 2026",
    amount: "₹850",
  },
  {
    category: "Bills",
    note: "Internet Bill",
    paymentMode: "UPI",
    date: "27 Sep 2026",
    amount: "₹600",
  },
];

export default function DashboardPage() {
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

            <a
              href="/expenses"
              className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              Expenses
            </a>
          </nav>

          {/* User */}
          <div className="border-t border-zinc-200 p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-zinc-900">User</p>
              <p className="truncate text-xs text-zinc-500">user@example.com</p>
            </div>

            <button className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100">
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

            <a
              href="/expenses"
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              + Add Expense
            </a>
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
                {categoryExpenses.map((item) => (
                  <div key={item.category}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-700">
                        {item.category}
                      </span>

                      <span className="text-sm text-zinc-500">
                        {item.amount}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-zinc-900"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    <p className="mt-1 text-right text-xs text-zinc-400">
                      {item.percentage}%
                    </p>
                  </div>
                ))}
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
                {paymentMethods.map((item) => (
                  <div key={item.method}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-700">
                        {item.method}
                      </span>

                      <span className="text-sm text-zinc-500">
                        {item.amount}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-zinc-700"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    <p className="mt-1 text-right text-xs text-zinc-400">
                      {item.percentage}%
                    </p>
                  </div>
                ))}
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

              <a
                href="/expenses"
                className="text-sm font-medium text-zinc-900 hover:underline"
              >
                View all
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400">
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Note</th>
                    <th className="px-6 py-4 font-medium">Payment</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 text-right font-medium">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {recentExpenses.map((expense) => (
                    <tr
                      key={`${expense.note}-${expense.date}`}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                        {expense.category}
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {expense.note}
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {expense.paymentMode}
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-500">
                        {expense.date}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-semibold text-zinc-900">
                        {expense.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
