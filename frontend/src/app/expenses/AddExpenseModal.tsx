"use client";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import axiosInstance from "@/app/lib/axios";

type Expense = {
  id: string;
  amount: number | string;
  category: string;
  note: string | null;
  payment_mode: string;
  expense_date: string;
};

type AddExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void | Promise<void>;
  expense?: Expense | null;
};

const categories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const paymentModes = ["Cash", "UPI", "Card", "Bank Transfer", "Other"];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Your session has expired. Please log in again.";
    }

    const detail: unknown = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    return fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  onExpenseAdded,
  expense = null,
}: AddExpenseModalProps) {
  const isEditMode = Boolean(expense);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [expenseDate, setExpenseDate] = useState(getTodayDate());
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (expense) {
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setPaymentMode(expense.payment_mode);
      setExpenseDate(expense.expense_date);
      setNote(expense.note || "");
    } else {
      setAmount("");
      setCategory("Food");
      setPaymentMode("UPI");
      setExpenseDate(getTodayDate());
      setNote("");
    }

    setError("");
  }, [isOpen, expense]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const payload = {
        amount: numericAmount,
        category,
        note: note.trim() || null,
        payment_mode: paymentMode,
        expense_date: expenseDate,
      };

      if (isEditMode && expense) {
        await axiosInstance.put(`/expenses/${expense.id}`, payload);
      } else {
        await axiosInstance.post("/expenses", payload);
      }

      await onExpenseAdded();
      onClose();
    } catch (submitError) {
      console.error(
        isEditMode ? "Failed to update expense:" : "Failed to add expense:",
        submitError,
      );

      setError(
        getErrorMessage(
          submitError,
          isEditMode
            ? "Unable to update expense. Please try again."
            : "Unable to add expense. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <h2 className="font-heading text-subheading font-semibold text-zinc-900">
              {isEditMode ? "Edit Expense" : "Add Expense"}
            </h2>

            <p className="mt-1 font-primary text-body text-zinc-500">
              {isEditMode
                ? "Update the details of this expense."
                : "Record a new expense."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 items-center justify-center rounded-lg font-primary text-body text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-primary text-body text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="amount"
              className="mb-2 block font-primary text-body font-medium text-zinc-700"
            >
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-primary text-body text-zinc-500">
                ₹
              </span>

              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-8 pr-3 font-primary text-body text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block font-primary text-body font-medium text-zinc-700"
              >
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-primary text-body text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="paymentMode"
                className="mb-2 block font-primary text-body font-medium text-zinc-700"
              >
                Payment Method
              </label>

              <select
                id="paymentMode"
                value={paymentMode}
                onChange={(event) => setPaymentMode(event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-primary text-body text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              >
                {paymentModes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="expenseDate"
              className="mb-2 block font-primary text-body font-medium text-zinc-700"
            >
              Date
            </label>

            <input
              id="expenseDate"
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-primary text-body text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="note"
              className="mb-2 block font-primary text-body font-medium text-zinc-700"
            >
              Note
              <span className="ml-1 font-primary text-body font-normal text-zinc-400">
                (optional)
              </span>
            </label>

            <textarea
              id="note"
              rows={3}
              maxLength={500}
              placeholder="What was this expense for?"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={isSubmitting}
              className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-primary text-body text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-zinc-200 px-4 py-2.5 font-primary text-body font-medium text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-zinc-900 px-5 py-2.5 font-primary text-body font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? isEditMode
                  ? "Saving..."
                  : "Adding..."
                : isEditMode
                  ? "Save Changes"
                  : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
