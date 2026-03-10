import { z } from "zod";

// Goal creation validator
export const createGoalValidator = z.object({
  name: z
    .string()
    .min(2, "Goal name must be at least 2 characters")
    .max(100, "Goal name must be at most 100 characters"),
  target_amount: z.number().positive("Target amount must be positive"),
  type: z.enum(["saving", "spending"]).default("saving"),
  source_account_id: z.string().uuid("Invalid source account ID"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().max(500).optional(),
});

// Goal update validator
export const updateGoalValidator = z.object({
  name: z
    .string()
    .min(2, "Goal name must be at least 2 characters")
    .max(100, "Goal name must be at most 100 characters")
    .optional(),
  target_amount: z
    .number()
    .positive("Target amount must be positive")
    .optional(),
  type: z.enum(["saving", "spending"]).optional(),
  source_account_id: z.string().uuid("Invalid source account ID").optional(),
  end_date: z.string().optional(),
  description: z.string().max(500).optional(),
});

// Contribution creation validator
export const createContributionValidator = z.object({
  transaction_id: z.string().uuid("Invalid transaction ID"),
  amount: z.number().positive("Contribution amount must be positive"),
});

// Prediction query validator
export const predictionQueryValidator = z.object({
  interval: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
});
