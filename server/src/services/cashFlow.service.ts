import { QuickEntryFormData } from "../types/cashFlow.types";
import { getSupabase } from "../utils/supabase";
import { Env } from "../types/env";

export const createQuickEntry = async (
  data: QuickEntryFormData,
  env: Env,
  accessToken?: string,
) => {
  const { client: supabase, accessToken: token } = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Error("Unauthorized: Invalid token");
  }

  const dbPayload = {
    user_uuid: user.id,
    amount: parseFloat(data.amount.replace(/,/g, "")), // Ensure number
    type: data.type === "cash_in" ? "in" : "out",
    // Store original category and tags in metadata since we don't have IDs yet
    metadata: {
      category_name: data.category,
      tags: data.selectedTags,
    },
    // logged_at defaults to now()
    // status defaults to 'completed'
  };

  // Defensive validation: Log warning if category type might be mismatched
  // (In a full-scale app, we would validate against a categories table)
  const incomeCategories = [
    "Allowance",
    "Freelance",
    "Investments",
    "Gifts",
    "Other Income",
  ];
  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Health",
    "Utilities",
  ];

  if (dbPayload.type === "in" && expenseCategories.includes(data.category)) {
    console.warn(
      `Potential category mismatch: Income marked as ${data.category}`,
    );
  } else if (
    dbPayload.type === "out" &&
    incomeCategories.includes(data.category)
  ) {
    console.warn(
      `Potential category mismatch: Expense marked as ${data.category}`,
    );
  }

  const { error } = await supabase.from("cash_flow").insert([dbPayload]);
  if (error) {
    console.error("Supabase insert error:", error);
  }
  return error;
};
