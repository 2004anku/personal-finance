"use client";

import { useEffect, useState } from "react";

import { apiRequest } from "@/app/lib/api";

type Income = {
  id: string;
  amount: number | string;
  source: string;
  payment_mode: IncomePaymentMode;
  note: string | null;
  income_date: string;
};

type AddIncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onIncomeAdded: () => void;
  income?: Income | null;
};

type IncomePaymentMode = "UPI" | "Cash";

const incomeSources = [
  "Salary",
  "Freelance",
  "Business",
  "Bonus",
  "Gift",
  "Other",
];

const incomePaymentModes: IncomePaymentMode[] = ["UPI", "Cash"];

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AddIncomeModal({
  isOpen,
  onClose,
  onIncomeAdded,
  income = null,
}: AddIncomeModalProps) {
  const isEditMode = Boolean(income);

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("Salary");
  const [incomeDate, setIncomeDate] = useState(getTodayDate());
  const [note, setNote] = useState("");
  const [paymentMode, setPaymentMode] = useState<IncomePaymentMode>("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (income) {
      setAmount(String(income.amount));
      setSource(income.source);
      setPaymentMode(income.payment_mode);
      setIncomeDate(income.income_date);
      setNote(income.note || "");
    } else {
      setAmount("");
      setSource("Salary");
      setPaymentMode("UPI");
      setIncomeDate(getTodayDate());
      setNote("");
    }

    setError("");
  }, [isOpen, income]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const payload = {
        amount: Number(amount),
        source,
        payment_mode: paymentMode,
        note: note.trim() || null,
        income_date: incomeDate,
      };

      if (isEditMode && income) {
        await apiRequest(`/incomes/${income.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/incomes", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      onClose();
      onIncomeAdded();
    } catch (error) {
      console.error(
        isEditMode ? "Failed to update income:" : "Failed to add income:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Unable to update income. Please try again."
            : "Unable to add income. Please try again.",
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <h2 className="font-heading text-subheading font-semibold text-zinc-900">
              {isEditMode ? "Edit Income" : "Add Income"}
            </h2>

            <p className="mt-1 font-primary text-body text-zinc-500">
              {isEditMode
                ? "Update the details of this income."
                : "Record money received from salary or other sources."}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-primary text-body text-red-600">
              {error}
            </div>
          )}

          {/* Amount */}
          <div>
            <label
              htmlFor="incomeAmount"
              className="mb-2 block font-primary text-body font-medium text-zinc-700"
            >
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-primary text-body text-zinc-500">
                ₹
              </span>

              <input
                id="incomeAmount"
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

          {/* Source */}
          <div>
            <label
              htmlFor="incomeSource"
              className="mb-2 block font-primary text-body font-medium text-zinc-700"
            >
              Income Source
            </label>

            <select
              id="incomeSource"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-primary text-body text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
            >
              {incomeSources.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Mode */}
          <div>
            <label
              htmlFor="incomePaymentMode"
              className="mb-2 block font-primary text-body font-medium text-zinc-700"
            >
              Payment Mode
            </label>

            <select
              id="incomePaymentMode"
              value={paymentMode}
              onChange={(event) =>
                setPaymentMode(event.target.value as IncomePaymentMode)
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-primary text-body text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
            >
              {incomePaymentModes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="incomeDate"
              className="mb-2 block font-primary text-body font-medium text-zinc-700"
            >
              Date
            </label>

            <input
              id="incomeDate"
              type="date"
              value={incomeDate}
              onChange={(event) => setIncomeDate(event.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-primary text-body text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
            />
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="incomeNote"
              className="mb-2 block font-primary text-body font-medium text-zinc-700"
            >
              Note
              <span className="ml-1 font-primary text-body font-normal text-zinc-400">
                (optional)
              </span>
            </label>

            <textarea
              id="incomeNote"
              rows={3}
              maxLength={500}
              placeholder="Where did this income come from?"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={isSubmitting}
              className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-primary text-body text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
            />
          </div>

          {/* Buttons */}
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
                  : "Add Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
