import { z } from "zod";

export const transactionTypeSchema = z.enum(["income", "expense", "transfer"]);

// Base transaction schema
const baseTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  date: z.string().datetime().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Income validator - requires to_account_id
export const createIncomeValidator = baseTransactionSchema.extend({
  to_account_id: z.string().uuid("Invalid account ID"),
});

// Expense validator - requires from_account_id
export const createExpenseValidator = baseTransactionSchema.extend({
  from_account_id: z.string().uuid("Invalid account ID"),
});

// Transfer validator - requires both from_account_id and to_account_id
export const createTransferValidator = z
  .object({
    amount: z.number().positive("Amount must be positive"),
    from_account_id: z.string().uuid("Invalid source account ID"),
    to_account_id: z.string().uuid("Invalid destination account ID"),
    date: z.string().datetime().optional(),
    description: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .refine((data) => data.from_account_id !== data.to_account_id, {
    message: "Source and destination accounts must be different",
    path: ["to_account_id"],
  });

// Transaction filters validator
export const transactionFiltersValidator = z.object({
  transaction_type: transactionTypeSchema.optional(),
  account_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});
