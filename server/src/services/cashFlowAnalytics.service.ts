import { getSupabase } from "../utils/supabase";
import { Env } from "../types/env";

/**
 * Fetches today's cash flow summary (total inflow and outflow)
 * Now pulls from the transactions table
 */
export const getTodayCashFlow = async (env: Env, accessToken?: string) => {
  const { client: supabase, accessToken: token } = getSupabase(
    env,
    accessToken,
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

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

  // Fetch today's transactions from the new table
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("amount, transaction_type")
    .eq("user_uuid", user.id)
    .gte("date", startOfDay.toISOString())
    .lte("date", endOfDay.toISOString());

  if (error) {
    console.error("Supabase query error:", error);
    return { error };
  }

  // Aggregate income and expense (transfers are excluded from net cash flow totals)
  const summary = (transactions || []).reduce(
    (acc, transaction) => {
      const amount = parseFloat(transaction.amount.toString());
      if (transaction.transaction_type === "income") {
        acc.inflow += amount;
      } else if (transaction.transaction_type === "expense") {
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
 * Now pulls from the transactions table
 */
export const getRecentTransactions = async (env: Env, accessToken?: string) => {
  const { client: supabase, accessToken: token } = getSupabase(
    env,
    accessToken,
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Fetch recent transactions from the new table
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_uuid", user.id)
    .order("date", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Supabase query error:", error);
    return { error };
  }

  // Map back to the expected legacy format if necessary or keep new format
  // For now, let's map it to keep frontend working with minimal changes
  const mappedTransactions = (transactions || []).map((t) => ({
    uuid: t.id,
    amount: t.amount,
    type:
      t.transaction_type === "income"
        ? "in"
        : t.transaction_type === "expense"
          ? "out"
          : "transfer",
    metadata: {
      ...t.metadata,
      category_name: t.category,
    },
    logged_at: t.date,
  }));

  return { data: mappedTransactions };
};

/**
 * Fetches cash flow time series data aggregated by time view
 * Now pulls from the transactions table
 */
export const getCashFlowTimeSeries = async (
  env: Env,
  timeView: "daily" | "weekly" | "monthly",
  startDate: string,
  endDate: string,
  accessToken?: string,
) => {
  const { client: supabase, accessToken: token } = getSupabase(
    env,
    accessToken,
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Fetch transactions in date range from the new table
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("amount, transaction_type, date, metadata")
    .eq("user_uuid", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    console.error("Supabase query error:", error);
    return { error };
  }

  // Map and filter for the aggregator
  const mappedTransactions = (transactions || [])
    .map((t) => ({
      amount: t.amount,
      type:
        t.transaction_type === "income"
          ? "in"
          : t.transaction_type === "expense"
            ? "out"
            : "transfer",
      logged_at: t.date,
      metadata: t.metadata,
    }))
    .filter(
      (t) => t.type !== "transfer" && !(t.metadata as any)?.investment_uuid,
    );

  // Aggregate data based on time view
  const aggregated = aggregateByTimeView(mappedTransactions, timeView);

  return { data: aggregated };
};

/**
 * Fetches cash flow breakdown by category
 * Now pulls from the transactions table
 */
export const getCashFlowByCategory = async (
  env: Env,
  startDate: string,
  endDate: string,
  accessToken?: string,
  type: "in" | "out" = "out",
) => {
  const { client: supabase, accessToken: token } = getSupabase(
    env,
    accessToken,
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: new Error("Unauthorized: Invalid token") };
  }

  // Fetch transactions in date range from the new table
  // Map 'in' to 'income' and 'out' to 'expense'
  const dbType = type === "in" ? "income" : "expense";

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("amount, category, metadata")
    .eq("user_uuid", user.id)
    .eq("transaction_type", dbType)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) {
    console.error("Supabase query error:", error);
    return { error };
  }

  // Aggregate by category
  const categoryMap = new Map<string, number>();
  let total = 0;

  (transactions || []).forEach((transaction) => {
    const metadata = transaction.metadata as any;
    // Skip investment transactions in category breakdown
    if (metadata?.investment_uuid) return;

    const amount = parseFloat(transaction.amount.toString());
    const category = transaction.category || "Uncategorized";

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
