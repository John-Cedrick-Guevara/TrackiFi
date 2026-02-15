import { getSupabase } from "../utils/supabase";
import { Env } from "../types/env";
import {
  Transaction,
  CreateIncomeRequest,
  CreateExpenseRequest,
  CreateTransferRequest,
  TransactionFilters,
} from "../types/transaction.types";

/**
 * Create an income transaction
 * Income MUST have to_account_id
 */
export const createIncome = async (
  data: CreateIncomeRequest,
  env: Env,
  accessToken?: string,
): Promise<{ data?: Transaction; error?: Error }> => {
  const { client: supabase, accessToken: token } = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Verify account belongs to user
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", data.to_account_id)
    .eq("user_uuid", user.id)
    .single();

  if (accountError || !account) {
    return { error: new Error("Invalid account or unauthorized") };
  }

  const payload = {
    user_uuid: user.id,
    amount: data.amount,
    transaction_type: "income",
    to_account_id: data.to_account_id,
    from_account_id: null,
    date: data.date || new Date().toISOString(),
    category: data.category || null,
    description: data.description || null,
    metadata: data.metadata || {},
  };

  const { data: transaction, error } = await supabase
    .from("transactions")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Transaction creation error:", error);
    return { error: new Error(error.message) };
  }

  return { data: transaction };
};

/**
 * Create an expense transaction
 * Expense MUST have from_account_id
 */
export const createExpense = async (
  data: CreateExpenseRequest,
  env: Env,
  accessToken?: string,
): Promise<{ data?: Transaction; error?: Error }> => {
  const { client: supabase, accessToken: token } = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Verify account belongs to user
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", data.from_account_id)
    .eq("user_uuid", user.id)
    .single();

  if (accountError || !account) {
    return { error: new Error("Invalid account or unauthorized") };
  }

  const payload = {
    user_uuid: user.id,
    amount: data.amount,
    transaction_type: "expense",
    from_account_id: data.from_account_id,
    to_account_id: null,
    date: data.date || new Date().toISOString(),
    category: data.category || null,
    description: data.description || null,
    metadata: data.metadata || {},
  };

  const { data: transaction, error } = await supabase
    .from("transactions")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Transaction creation error:", error);
    return { error: new Error(error.message) };
  }

  return { data: transaction };
};

/**
 * Create a transfer transaction
 * Transfer MUST have both from_account_id and to_account_id
 */
export const createTransfer = async (
  data: CreateTransferRequest,
  env: Env,
  accessToken?: string,
): Promise<{ data?: Transaction; error?: Error }> => {
  const { client: supabase, accessToken: token } = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Verify both accounts belong to user
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_uuid", user.id)
    .in("id", [data.from_account_id, data.to_account_id]);

  if (accountsError || !accounts || accounts.length !== 2) {
    return { error: new Error("Invalid accounts or unauthorized") };
  }

  const payload = {
    user_uuid: user.id,
    amount: data.amount,
    transaction_type: "transfer",
    from_account_id: data.from_account_id,
    to_account_id: data.to_account_id,
    date: data.date || new Date().toISOString(),
    category: null, // Transfers don't have categories
    description: data.description || null,
    metadata: data.metadata || {},
  };

  const { data: transaction, error } = await supabase
    .from("transactions")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Transaction creation error:", error);
    return { error: new Error(error.message) };
  }

  return { data: transaction };
};

/**
 * Get transaction history with optional filters
 */
export const getTransactionHistory = async (
  filters: TransactionFilters,
  env: Env,
  accessToken?: string,
): Promise<{ data?: Transaction[]; error?: Error }> => {
  const { client: supabase, accessToken: token } = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_uuid", user.id)
    .order("date", { ascending: false });

  // Apply filters
  if (filters.transaction_type) {
    query = query.eq("transaction_type", filters.transaction_type);
  }

  if (filters.account_id) {
    query = query.or(
      `from_account_id.eq.${filters.account_id},to_account_id.eq.${filters.account_id}`,
    );
  }

  if (filters.start_date) {
    query = query.gte("date", filters.start_date);
  }

  if (filters.end_date) {
    query = query.lte("date", filters.end_date);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 20) - 1,
    );
  }

  const { data: transactions, error } = await query;

  if (error) {
    console.error("Transaction query error:", error);
    return { error: new Error(error.message) };
  }

  return { data: transactions || [] };
};
