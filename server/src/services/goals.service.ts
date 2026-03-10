import { getSupabase } from "../utils/supabase";
import { Env } from "../types/env";
import {
  GoalWithProgress,
  CreateGoalPayload,
  UpdateGoalPayload,
  GoalContribution,
  CreateContributionPayload,
  TimeInterval,
  TimeSeriesPoint,
} from "../types/goals.types";

// ==================
// GOAL CRUD
// ==================

export const getGoals = async (
  env: Env,
  accessToken: string,
): Promise<{ data?: GoalWithProgress[]; error?: Error }> => {
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

  // Fetch goals
  const { data: goals, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: new Error(error.message) };
  }

  if (!goals || goals.length === 0) {
    return { data: [] };
  }

  // Compute progress for each goal from contributions
  const goalsWithProgress: GoalWithProgress[] = await Promise.all(
    goals.map(async (goal) => {
      const { data: contributions } = await supabase
        .from("goal_contributions")
        .select("amount")
        .eq("goal_id", goal.uuid);

      const current_amount = (contributions || []).reduce(
        (sum: number, c: { amount: number }) => sum + Number(c.amount),
        0,
      );

      return { ...goal, current_amount };
    }),
  );

  return { data: goalsWithProgress };
};

export const getGoalById = async (
  env: Env,
  accessToken: string,
  goalId: string,
): Promise<{ data?: GoalWithProgress; error?: Error }> => {
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

  const { data: goal, error } = await supabase
    .from("goals")
    .select("*")
    .eq("uuid", goalId)
    .eq("user_id", user.id)
    .single();

  if (error || !goal) {
    return { error: new Error(error?.message || "Goal not found") };
  }

  // Compute progress from contributions
  const { data: contributions } = await supabase
    .from("goal_contributions")
    .select("amount")
    .eq("goal_id", goal.uuid);

  const current_amount = (contributions || []).reduce(
    (sum: number, c: { amount: number }) => sum + Number(c.amount),
    0,
  );

  return { data: { ...goal, current_amount } };
};

export const createGoal = async (
  env: Env,
  accessToken: string,
  payload: CreateGoalPayload,
): Promise<{ data?: GoalWithProgress; error?: Error }> => {
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

  // Verify source account belongs to user
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", payload.source_account_id)
    .eq("user_uuid", user.id)
    .single();

  if (accountError || !account) {
    return { error: new Error("Source account not found or unauthorized") };
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      name: payload.name,
      target_amount: payload.target_amount,
      type: payload.type || "saving",
      source_account_id: payload.source_account_id,
      start_date: payload.start_date || new Date().toISOString().split("T")[0],
      end_date: payload.end_date || null,
      description: payload.description || null,
      user_id: user.id,
      status: "active",
    })
    .select("*")
    .single();

  if (error) {
    return { error: new Error(error.message) };
  }

  return { data: { ...data, current_amount: 0 } };
};

export const updateGoal = async (
  env: Env,
  accessToken: string,
  goalId: string,
  payload: UpdateGoalPayload,
): Promise<{ data?: GoalWithProgress; error?: Error }> => {
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

  // If updating source_account_id, verify it belongs to user
  if (payload.source_account_id) {
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", payload.source_account_id)
      .eq("user_uuid", user.id)
      .single();

    if (accountError || !account) {
      return { error: new Error("Source account not found or unauthorized") };
    }
  }

  const { data, error } = await supabase
    .from("goals")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("uuid", goalId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return { error: new Error(error.message) };
  }

  // Compute current progress
  const { data: contributions } = await supabase
    .from("goal_contributions")
    .select("amount")
    .eq("goal_id", goalId);

  const current_amount = (contributions || []).reduce(
    (sum: number, c: { amount: number }) => sum + Number(c.amount),
    0,
  );

  return { data: { ...data, current_amount } };
};

export const deleteGoal = async (
  env: Env,
  accessToken: string,
  goalId: string,
): Promise<{ data?: boolean; error?: Error }> => {
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

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("uuid", goalId)
    .eq("user_id", user.id);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { data: true };
};

// ==================
// CONTRIBUTIONS
// ==================

export const getContributions = async (
  env: Env,
  accessToken: string,
  goalId: string,
): Promise<{ data?: GoalContribution[]; error?: Error }> => {
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

  // Verify goal belongs to user
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("uuid")
    .eq("uuid", goalId)
    .eq("user_id", user.id)
    .single();

  if (goalError || !goal) {
    return { error: new Error("Goal not found or unauthorized") };
  }

  const { data, error } = await supabase
    .from("goal_contributions")
    .select("*")
    .eq("goal_id", goalId)
    .order("contributed_at", { ascending: false });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { data: data || [] };
};

export const addContribution = async (
  env: Env,
  accessToken: string,
  goalId: string,
  payload: CreateContributionPayload,
): Promise<{ data?: GoalContribution; error?: Error }> => {
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

  // Verify goal belongs to user and get source_account_id
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("uuid, source_account_id")
    .eq("uuid", goalId)
    .eq("user_id", user.id)
    .single();

  if (goalError || !goal) {
    return { error: new Error("Goal not found or unauthorized") };
  }

  // Verify transaction belongs to user
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .select("id, amount, to_account_id, from_account_id")
    .eq("id", payload.transaction_id)
    .eq("user_uuid", user.id)
    .single();

  if (txError || !transaction) {
    return { error: new Error("Transaction not found or unauthorized") };
  }

  // Verify the transaction involves the goal's source account
  const txAccountIds = [
    transaction.to_account_id,
    transaction.from_account_id,
  ].filter(Boolean);
  if (!txAccountIds.includes(goal.source_account_id)) {
    return {
      error: new Error(
        "Transaction does not involve the goal's source account",
      ),
    };
  }

  // Verify contribution amount doesn't exceed transaction amount
  const txAmount = Number(transaction.amount);
  if (payload.amount > txAmount) {
    return {
      error: new Error("Contribution amount exceeds transaction amount"),
    };
  }

  // Check total allocations of this transaction across all goals don't exceed transaction amount
  const { data: existingContributions } = await supabase
    .from("goal_contributions")
    .select("amount")
    .eq("transaction_id", payload.transaction_id);

  const totalAllocated = (existingContributions || []).reduce(
    (sum: number, c: { amount: number }) => sum + Number(c.amount),
    0,
  );

  if (totalAllocated + payload.amount > txAmount) {
    return {
      error: new Error(
        `Over-allocation: transaction has ${txAmount} total, ${totalAllocated} already allocated. Maximum additional: ${txAmount - totalAllocated}`,
      ),
    };
  }

  const { data, error } = await supabase
    .from("goal_contributions")
    .insert({
      goal_id: goalId,
      transaction_id: payload.transaction_id,
      amount: payload.amount,
      contributed_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return { error: new Error(error.message) };
  }

  return { data };
};

export const removeContribution = async (
  env: Env,
  accessToken: string,
  goalId: string,
  contributionId: string,
): Promise<{ data?: boolean; error?: Error }> => {
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

  // Verify goal belongs to user
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("uuid")
    .eq("uuid", goalId)
    .eq("user_id", user.id)
    .single();

  if (goalError || !goal) {
    return { error: new Error("Goal not found or unauthorized") };
  }

  const { error } = await supabase
    .from("goal_contributions")
    .delete()
    .eq("uuid", contributionId)
    .eq("goal_id", goalId);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { data: true };
};

// ==================
// CONTRIBUTION TIME SERIES
// ==================

const getContributionTimeSeries = async (
  supabase: any,
  goalId: string,
  interval: TimeInterval,
): Promise<TimeSeriesPoint[]> => {
  const { data: contributions } = await supabase
    .from("goal_contributions")
    .select("amount, contributed_at")
    .eq("goal_id", goalId)
    .order("contributed_at", { ascending: true });

  if (!contributions || contributions.length === 0) {
    return [];
  }

  // Group contributions by time interval
  const bucketMap = new Map<string, number>();

  contributions.forEach((c: { amount: number; contributed_at: string }) => {
    const date = new Date(c.contributed_at);
    let key: string;

    if (interval === "daily") {
      key = date.toISOString().split("T")[0];
    } else if (interval === "weekly") {
      // ISO week: get Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date);
      monday.setDate(diff);
      key = monday.toISOString().split("T")[0];
    } else {
      // monthly
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    bucketMap.set(key, (bucketMap.get(key) ?? 0) + Number(c.amount));
  });

  return Array.from(bucketMap.entries())
    .map(([period, amount]) => ({ period, amount }))
    .sort((a, b) => a.period.localeCompare(b.period));
};

// ==================
// PREDICTION (using contribution time-series + exponential smoothing)
// ==================

export const generatePrediction = async (
  env: Env,
  accessToken: string,
  goalId: string,
  interval: TimeInterval = "monthly",
): Promise<{
  prediction: string;
  success: boolean;
  monthsNeeded?: number;
  estimatedCompletionDate?: string;
  timeSeries?: TimeSeriesPoint[];
}> => {
  const { client: supabase, accessToken: token } = getSupabase(
    env,
    accessToken,
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { prediction: "Unauthorized", success: false };
  }

  // Fetch goal info
  const { data: goalData, error: goalError } = await supabase
    .from("goals")
    .select("*")
    .eq("uuid", goalId)
    .eq("user_id", user.id)
    .single();

  if (goalError || !goalData) {
    return { prediction: "Goal not found", success: false };
  }

  const goalAmount = Number(goalData.target_amount);

  // Compute current progress from contributions
  const { data: allContributions } = await supabase
    .from("goal_contributions")
    .select("amount")
    .eq("goal_id", goalId);

  const currentAmount = (allContributions || []).reduce(
    (sum: number, c: { amount: number }) => sum + Number(c.amount),
    0,
  );

  const remainingAmount = goalAmount - currentAmount;

  if (remainingAmount <= 0) {
    return {
      prediction: "Goal already reached!",
      success: true,
      monthsNeeded: 0,
    };
  }

  // Build time-series from contribution records
  const timeSeries = await getContributionTimeSeries(
    supabase,
    goalId,
    interval,
  );

  if (timeSeries.length < 2) {
    return {
      prediction:
        "Not enough contribution data for prediction. Add more contributions to enable forecasting.",
      success: false,
      timeSeries,
    };
  }

  // Exponential smoothing (Holt's method)
  const alpha = 0.3; // level smoothing
  const beta = 0.2; // trend smoothing

  let level = timeSeries[0].amount;
  let trend =
    timeSeries.length > 1 ? timeSeries[1].amount - timeSeries[0].amount : 0;

  for (let i = 1; i < timeSeries.length; i++) {
    const actual = timeSeries[i].amount;
    const previousLevel = level;
    const previousTrend = trend;

    level = alpha * actual + (1 - alpha) * (previousLevel + previousTrend);
    trend = beta * (level - previousLevel) + (1 - beta) * previousTrend;
  }

  // Project periods until goal
  let periodsNeeded = 0;
  let cumulativeFuture = 0;
  const MAX_PERIODS = 120;

  if (level <= 0 && trend <= 0) {
    return {
      prediction: "Goal unreachable with current contribution habits",
      success: false,
      timeSeries,
    };
  }

  while (cumulativeFuture < remainingAmount) {
    periodsNeeded++;

    let projected = level + periodsNeeded * trend;
    if (projected < 0) projected = 0;

    cumulativeFuture += projected;

    if (periodsNeeded > MAX_PERIODS) {
      return {
        prediction: "Goal unreachable within 10 years with current trend",
        success: false,
        timeSeries,
      };
    }

    if (
      periodsNeeded > 1 &&
      projected === 0 &&
      cumulativeFuture < remainingAmount
    ) {
      return {
        prediction: "Goal unreachable with current contribution trend",
        success: false,
        timeSeries,
      };
    }
  }

  // Convert periods to months for the estimated date
  const monthsNeeded =
    interval === "daily"
      ? Math.ceil(periodsNeeded / 30)
      : interval === "weekly"
        ? Math.ceil(periodsNeeded / 4)
        : periodsNeeded;

  const predictedDate = new Date();
  predictedDate.setMonth(predictedDate.getMonth() + monthsNeeded);
  const periodLabel = periodsNeeded === 1 ? "period" : "periods";
  const monthLabel = monthsNeeded === 1 ? "month" : "months";

  return {
    prediction: `At your current pace, you will reach this goal in approximately ${monthsNeeded} ${monthLabel} (~${periodsNeeded} ${interval} ${periodLabel}).`,
    monthsNeeded,
    estimatedCompletionDate: predictedDate.toISOString().split("T")[0],
    success: true,
    timeSeries,
  };
};
