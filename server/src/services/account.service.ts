import { getSupabase } from "../utils/supabase";
import { Env } from "../types/env";
import { Account, AccountWithBalance } from "../types/account.types";

/**
 * Get all accounts for the authenticated user with balances
 */
export const getUserAccounts = async (
  env: Env,
  accessToken?: string,
): Promise<{ data?: AccountWithBalance[]; error?: Error }> => {
  const { client: supabase, accessToken: token } = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Fetch user's accounts
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_uuid", user.id)
    .order("type", { ascending: true }); // Allowance first, then Savings

  if (error) {
    console.error("Supabase query error:", error);
    return { error: new Error(error.message) };
  }

  if (!accounts || accounts.length === 0) {
    return { data: [] };
  }

  // Calculate balance for each account
  const accountsWithBalances: AccountWithBalance[] = await Promise.all(
    accounts.map(async (account) => {
      const balanceResult = await getAccountBalance(
        account.id,
        env,
        accessToken,
      );
      return {
        ...account,
        balance: balanceResult.data || 0,
      };
    }),
  );

  return { data: accountsWithBalances };
};

/**
 * Get balance for a specific account by aggregating transactions
 * Balance is DERIVED, never stored
 */
export const getAccountBalance = async (
  accountId: string,
  env: Env,
  accessToken?: string,
): Promise<{ data?: number; error?: Error }> => {
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
    .eq("id", accountId)
    .eq("user_uuid", user.id)
    .single();

  if (accountError || !account) {
    return { error: new Error("Account not found or unauthorized") };
  }

  // Use the database function to calculate balance
  const { data, error } = await supabase.rpc("get_account_balance", {
    account_id_param: accountId,
  });

  if (error) {
    console.error("Balance calculation error:", error);
    return { error: new Error(error.message) };
  }

  return { data: parseFloat(data || "0") };
};

/**
 * Get a specific account by ID
 */
export const getAccountById = async (
  accountId: string,
  env: Env,
  accessToken?: string,
): Promise<{ data?: Account; error?: Error }> => {
  const { client: supabase, accessToken: token } = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  const { data: account, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .eq("user_uuid", user.id)
    .single();

  if (error) {
    console.error("Supabase query error:", error);
    return { error: new Error(error.message) };
  }

  return { data: account };
};
