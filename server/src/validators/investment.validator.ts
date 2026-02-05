import zod from "zod";

export const investmentTypeSchema = zod.enum([
  "stock",
  "crypto",
  "fund",
  "savings",
  "other",
]);

export const createInvestmentValidator = zod.object({
  name: zod.string().min(1, "Name is required"),
  type: investmentTypeSchema,
  principal: zod.number().positive("Principal must be greater than 0"),
  start_date: zod.string().min(1, "Start date is required"),
  metadata: zod.record(zod.any()).optional(),
});

export const updateValueValidator = zod.object({
  value: zod.number().min(0, "Value cannot be negative"),
  recorded_at: zod.string().optional(),
  notes: zod.string().optional(),
});

export const cashOutValidator = zod.object({
  amount: zod.number().positive("Amount must be greater than 0"),
  date: zod.string().min(1, "Date is required"),
  notes: zod.string().optional(),
});

export const updateInvestmentValidator = zod.object({
  name: zod.string().min(1).optional(),
  type: investmentTypeSchema.optional(),
  principal: zod.number().positive().optional(),
  start_date: zod.string().optional(),
  status: zod.enum(["active", "closed"]).optional(),
});
