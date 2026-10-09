export const queryKeys = {
  dashboard: ["dashboard"] as const,

  expenses: {
    all: ["expenses"] as const,
    list: (dateRange: string) => ["expenses", dateRange] as const,
    detail: (expenseId: string) => ["expenses", "detail", expenseId] as const,
  },

  profile: ["profile"] as const,

  income: {
    all: ["income"] as const,
    list: ["income", "list"] as const,
  },
};
