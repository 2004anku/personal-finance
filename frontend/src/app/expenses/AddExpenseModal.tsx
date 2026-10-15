"use client";

import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { X, Receipt } from "lucide-react";

import axiosInstance from "@/lib/axios/axios";

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

const inputClasses =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-primary text-body text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-500 dark:focus:ring-green-500/10 dark:disabled:bg-zinc-800/60";

const labelClasses =
  "mb-2 block font-primary text-body font-medium text-zinc-700 dark:text-zinc-300";

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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/50 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-modal-title"
        className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-green-100 bg-white shadow-2xl shadow-zinc-950/10 transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/30"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-5 sm:px-6 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400">
              <Receipt size={21} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <div>
              <h2
                id="expense-modal-title"
                className="font-heading text-subheading font-semibold text-zinc-900 dark:text-zinc-100"
              >
                {isEditMode ? "Edit Expense" : "Add Expense"}
              </h2>

              <p className="mt-1 font-primary text-body text-zinc-500 dark:text-zinc-400">
                {isEditMode
                  ? "Update the details of this expense."
                  : "Record a new expense."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-primary text-body text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="amount" className={labelClasses}>
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-primary text-body font-medium text-zinc-500 dark:text-zinc-400">
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
                className={`${inputClasses} pl-8`}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className={labelClasses}>
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={isSubmitting}
                className={inputClasses}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="paymentMode" className={labelClasses}>
                Payment Method
              </label>

              <select
                id="paymentMode"
                value={paymentMode}
                onChange={(event) => setPaymentMode(event.target.value)}
                disabled={isSubmitting}
                className={inputClasses}
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
            <label htmlFor="expenseDate" className={labelClasses}>
              Date
            </label>

            <input
              id="expenseDate"
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              required
              disabled={isSubmitting}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="note" className={labelClasses}>
              Note
              <span className="ml-1 font-normal text-zinc-400 dark:text-zinc-500">
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
              className={`${inputClasses} resize-none`}
            />

            <p className="mt-1 text-right font-primary text-caption text-zinc-400 dark:text-zinc-500">
              {note.length}/500
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-zinc-200 px-4 py-2.5 font-primary text-body font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 font-primary text-body font-medium text-white transition hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400 dark:focus-visible:ring-offset-zinc-900"
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
