interface PaymentMethod {
  payment_mode: string;
  amount: number;
  percentage: number;
}

interface PaymentMethodsProps {
  data: PaymentMethod[];
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function PaymentMethods({ data }: PaymentMethodsProps) {
  const paymentMethods = data.filter(
    (item) => Number.isFinite(item.amount) && item.amount >= 0,
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors dark:border-zinc-700/80 dark:bg-zinc-900">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Payment Methods
        </h2>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          How you paid this month
        </p>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No payment data available.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {paymentMethods.map((method) => {
            const percentage = Math.min(
              100,
              Math.max(0, Number(method.percentage) || 0),
            );

            return (
              <div key={method.payment_mode}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {method.payment_mode}
                  </span>

                  <span className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(Number(method.amount) || 0)}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-green-700 transition-all duration-300 dark:bg-green-500"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-label={`${method.payment_mode} percentage`}
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>

                <p className="mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400">
                  {percentage.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
