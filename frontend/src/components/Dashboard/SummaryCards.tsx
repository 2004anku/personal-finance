import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import SummaryCard from "./SummaryCard";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export default function SummaryCards({
  totalIncome,
  totalExpenses,
  balance,
}: SummaryCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <SummaryCard
        title="Income"
        amount={totalIncome}
        description="This month"
        icon={ArrowUpRight}
        iconColor="text-emerald-700 dark:text-emerald-400"
        iconBackground="bg-emerald-50 dark:bg-emerald-950/60"
      />

      <SummaryCard
        title="Expenses"
        amount={totalExpenses}
        description="This month"
        icon={ArrowDownRight}
        iconColor="text-red-600 dark:text-red-400"
        iconBackground="bg-red-50 dark:bg-red-950/60"
      />

      <SummaryCard
        title="Balance"
        amount={balance}
        description="Income minus expenses"
        icon={Wallet}
        iconColor={
          balance >= 0
            ? "text-blue-600 dark:text-blue-400"
            : "text-red-600 dark:text-red-400"
        }
        iconBackground={
          balance >= 0
            ? "bg-blue-50 dark:bg-blue-950/60"
            : "bg-red-50 dark:bg-red-950/60"
        }
        valueColor={
          balance >= 0
            ? "text-zinc-900 dark:text-zinc-100"
            : "text-red-600 dark:text-red-400"
        }
      />
    </section>
  );
}
