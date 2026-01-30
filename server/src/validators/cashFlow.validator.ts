import zod from "zod";

export const quickEntryValidator = zod.object({
  amount: zod.string().min(1, "Amount is required"),
  type: zod.enum(["cash_in", "cash_out"]),
  category: zod.string().min(1, "Category is required"),
  selectedTags: zod.array(zod.string()),
});
