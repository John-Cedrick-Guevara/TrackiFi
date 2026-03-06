import { getSupabase } from "../utils/supabase";
import { Env } from "../types/env";
import { exponentialSmoothingParams, Goal } from "../types/goals.types";
import { getUserAccounts } from "./account.service";

export const getGoals = async (env: Env, accessToken: string) => {
  const { client: supabase, accessToken: token } = getSupabase(
    env,
    accessToken,
  );

  // fetch user's goals from database
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", token);

  if (error) {
    throw error;
  }

  return data;
};

export const createGoal = async (
  env: Env,
  accessToken: string,
  goal: Omit<Goal, "uuid" | "created_at" | "updated_at">,
) => {
  const { client: supabase, accessToken: token } = getSupabase(
    env,
    accessToken,
  );

  // insert new goal into database
  const { data, error } = await supabase
    .from("goals")
    .insert({
      ...goal,
      user_id: token,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteGoal = async (
  env: Env,
  accessToken: string,
  goalId: string,
  userId: string,
) => {
  const { client: supabase, accessToken: token } = getSupabase(
    env,
    accessToken,
  );

  // delete goal from database
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("uuid", goalId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return true;
};
export const generatePrediction = async (
  env: Env,
  accessToken: string,
  goalId: string,
  userId: string,
): Promise<{
  prediction: string;
  success: boolean;
  monthsNeeded?: number;
  estimatedCompletionDate?: string;
}> => {
  const { client: supabase } = getSupabase(env, accessToken);

  // fetch goal info
  const { data: goalData, error: goalError } = await supabase
    .from("goals")
    .select("*")
    .eq("uuid", goalId)
    .eq("user_id", userId)
    .single();

  if (goalError || !goalData) throw goalError ?? new Error("Goal not found");

  const goalAmount = Number(goalData.target_amount);

  // Fetch savings account balance dynamically instead of relying on metadata
  const { data: accounts } = await getUserAccounts(env, accessToken);
  const savingsAccount = accounts?.find((acc) => acc.type === "savings");
  const currentAmount = savingsAccount?.balance ?? 0;
  const remainingAmount = goalAmount - currentAmount;

  // Fetch transactions from the transactions table (not the legacy cash_flow table)
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("amount, date, transaction_type")
    .eq("user_uuid", userId)
    .not("transaction_type", "eq", "transfer");

  if (txError) throw txError;

  if (!transactions || transactions.length < 4)
    return { prediction: "Not enough data for prediction", success: false };

  // Aggregate monthly net savings (inflow - outflow) using a Map
  const monthlyMap = new Map<string, number>();

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const amount = Number(t.amount);
    // allowance and income are positive contributions; expense is negative
    const value =
      t.transaction_type === "allowance" || t.transaction_type === "income"
        ? amount
        : -amount;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + value);
  });

  // Convert Map to time-ordered array
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([key, amount]) => {
      const [year, month] = key.split("-").map(Number);
      return { year, month, amount };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);

  if (remainingAmount <= 0)
    return { prediction: "Goal already reached", success: true };

  // exponential smoothing parameters
  const alpha = 0.3; // level smoothing
  const beta = 0.2; // trend smoothing

  // initialize level and trend
  let level = monthlyData[0].amount;
  let trend =
    monthlyData.length > 1 ? monthlyData[1].amount - monthlyData[0].amount : 0;

  for (let i = 1; i < monthlyData.length; i++) {
    const actual = monthlyData[i].amount;
    const previousLevel = level;
    const previousTrend = trend;

    level = alpha * actual + (1 - alpha) * (previousLevel + previousTrend);
    trend = beta * (level - previousLevel) + (1 - beta) * previousTrend;
  }

  // project months until goal
  let monthsNeeded = 0;
  let cumulativeFuture = 0;
  const MAX_MONTHS = 120; // 10 years safety cap

  // If level + trend is negative or zero, it might never be reached
  if (level <= 0 && trend <= 0) {
    return {
      prediction: "Goal unreachable with current spending habits",
      success: false,
    };
  }

  while (cumulativeFuture < remainingAmount) {
    monthsNeeded++;

    let projectedContribution = level + monthsNeeded * trend;
    if (projectedContribution < 0) projectedContribution = 0;

    cumulativeFuture += projectedContribution;

    if (monthsNeeded > MAX_MONTHS)
      return {
        prediction: "Goal unreachable within 10 years with current trend",
        success: true,
      };

    console.log(monthlyData);

    // safety against infinite loop if projectedContribution stays 0
    if (
      monthsNeeded > 1 &&
      projectedContribution === 0 &&
      cumulativeFuture < remainingAmount
    ) {
      return {
        prediction: "Goal unreachable with current trend",
        success: true,
      };
    }
  }

  const predictedDate = new Date();
  predictedDate.setMonth(predictedDate.getMonth() + monthsNeeded);
  const monthLabel = monthsNeeded === 1 ? "month" : "months";

  return {
    prediction: `At your current pace, you will reach this goal in ${monthsNeeded} ${monthLabel}.`,
    monthsNeeded,
    estimatedCompletionDate: predictedDate.toISOString().split("T")[0],
    success: true,
  };
};
