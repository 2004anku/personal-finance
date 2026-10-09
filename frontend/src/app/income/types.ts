export type IncomePaymentMode = "UPI" | "Cash";

export type Income = {
  id: string;
  amount: number | string;
  source: string;
  payment_mode: IncomePaymentMode;
  note: string | null;
  income_date: string;
};
