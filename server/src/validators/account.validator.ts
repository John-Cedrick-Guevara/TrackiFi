import { z } from "zod";

export const accountTypeSchema = z.enum(["allowance", "savings"]);

export const createAccountValidator = z.object({
  name: z.string().min(1, "Account name is required").trim(),
  type: accountTypeSchema,
});

export const accountIdValidator = z.object({
  id: z.string().uuid("Invalid account ID"),
});
