import { getSupabase } from "../utils/supabase";
import { Env } from "../types/env";

/**
 * Fetches today's cash flow summary (total inflow and outflow)
 */
export const getTodayCashFlow = async (env: Env, accessToken?: string) => {
  const supabase = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Get today's date range (start and end of day)
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  // Fetch today's transactions
  const { data: transactions, error } = await supabase
    .from("cash_flow")
    .select("amount, type")
    .eq("user_uuid", user.id)
    .eq("status", "completed") // Only completed transactions
    .gte("logged_at", startOfDay.toISOString())
    .lte("logged_at", endOfDay.toISOString());

  if (error) {
    console.error("Supabase query error:", error);
    return { error };
  }

  // Aggregate inflow and outflow
  const summary = (transactions || []).reduce(
    (acc, transaction) => {
      const amount = parseFloat(transaction.amount.toString());
      if (transaction.type === "in") {
        acc.inflow += amount;
      } else if (transaction.type === "out") {
        acc.outflow += amount;
      }
      return acc;
    },
    { inflow: 0, outflow: 0 },
  );

  return { data: summary };
};

/**
 * Fetches recent transaction history (last 20 transactions)
 */
export const getRecentTransactions = async (env: Env, accessToken?: string) => {
  const supabase = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Fetch recent transactions
  const { data: transactions, error } = await supabase
    .from("cash_flow")
    .select("uuid, amount, type, metadata, logged_at")
    .eq("user_uuid", user.id)
    .eq("status", "completed") // Only completed transactions
    .order("logged_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Supabase query error:", error);
    return { error };
  }

  return { data: transactions || [] };
};

/**
 * Fetches cash flow time series data aggregated by time view
 */
export const getCashFlowTimeSeries = async (
  env: Env,
  timeView: "daily" | "weekly" | "monthly",
  startDate: string,
  endDate: string,
  accessToken?: string,
) => {
  const supabase = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Fetch transactions in date range
  const { data: transactions, error } = await supabase
    .from("cash_flow")
    .select("amount, type, logged_at")
    .eq("user_uuid", user.id)
    .eq("status", "completed")
    .gte("logged_at", startDate)
    .lte("logged_at", endDate)
    .order("logged_at", { ascending: true });

  if (error) {
    console.error("Supabase query error:", error);
    return { error };
  }

  // Aggregate data based on time view
  const aggregated = aggregateByTimeView(transactions || [], timeView);

  return { data: aggregated };
};

/**
 * Fetches cash flow breakdown by category (outflows only)
 */
export const getCashFlowByCategory = async (
  env: Env,
  startDate: string,
  endDate: string,
  accessToken?: string,
) => {
  const supabase = getSupabase(env, accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Fetch outflow transactions in date range
  const { data: transactions, error } = await supabase
    .from("cash_flow")
    .select("amount, metadata")
    .eq("user_uuid", user.id)
    .eq("type", "out")
    .eq("status", "completed")
    .gte("logged_at", startDate)
    .lte("logged_at", endDate);

  if (error) {
    console.error("Supabase query error:", error);
    return { error };
  }

  // Aggregate by category
  const categoryMap = new Map<string, number>();
  let total = 0;

  (transactions || []).forEach((transaction) => {
    const amount = parseFloat(transaction.amount.toString());
    const category =
      (transaction.metadata as any)?.category_name || "Uncategorized";

    categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
    total += amount;
  });

  // Convert to array and calculate percentages
  const categoryData = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  return { data: categoryData };
};

/**
 * Helper function to aggregate transactions by time view
 */
function aggregateByTimeView(
  transactions: any[],
  timeView: "daily" | "weekly" | "monthly",
) {
  const dataMap = new Map<
    string,
    { period: string; inflow: number; outflow: number }
  >();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.logged_at);
    const amount = parseFloat(transaction.amount.toString());
    let periodKey: string;

    if (timeView === "daily") {
      periodKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
    } else if (timeView === "weekly") {
      // Get week start (Monday to Sunday)
      const weekStart = new Date(date);
      // Use local date components to avoid timezone shifts when generating the key
      const day = weekStart.getDay();
      const diff = day === 0 ? 6 : day - 1;
      weekStart.setDate(weekStart.getDate() - diff);
      
      // format as YYYY-MM-DD using local time
      periodKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
    } else {
      // monthly
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!dataMap.has(periodKey)) {
      dataMap.set(periodKey, { period: periodKey, inflow: 0, outflow: 0 });
    }

    const entry = dataMap.get(periodKey)!;
    if (transaction.type === "in") {
      entry.inflow += amount;
    } else {
      entry.outflow += amount;
    }
  });

  return Array.from(dataMap.values()).sort((a, b) =>
    a.period.localeCompare(b.period),
  );
}
