import { getSupabase } from "../utils/supabase";
import { Env } from "../types/env";
import {
  CreateInvestmentPayload,
  UpdateValuePayload,
  CashOutPayload,
  Investment,
} from "../types/investment.types";

export const createInvestment = async (
  data: CreateInvestmentPayload,
  env: Env,
  accessToken?: string,
) => {
  const supabase = getSupabase(env, accessToken);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized: Invalid token" };
  }

  // 1. Create the investment record
  const { data: investment, error: invError } = await supabase
    .from("investments")
    .insert([
      {
        user_uuid: user.id,
        name: data.name,
        type: data.type,
        principal: data.principal,
        current_value: data.principal, // Initially same as principal
        start_date: data.start_date,
        metadata: data.metadata,
        status: "active",
      },
    ])
    .select()
    .single();

  if (invError) return { error: invError.message };

  // 2. Add initial history entry
  const { error: histError } = await supabase
    .from("investment_value_history")
    .insert([
      {
        investment_uuid: investment.uuid,
        value: data.principal,
        recorded_at: new Date().toISOString(),
        notes: "Initial investment",
      },
    ]);

  if (histError) console.error("History recording error:", histError);

  // 3. Create a cash_out entry in cash_flow table
  const { error: cfError } = await supabase.from("cash_flow").insert([
    {
      user_uuid: user.id,
      amount: data.principal,
      type: "out",
      source_reason: `Investment: ${data.name}`,
      metadata: {
        investment_uuid: investment.uuid,
        action: "invest",
        category_name: "Investment",
      },
    },
  ]);

  if (cfError) console.error("Cash flow recording error:", cfError);

  return { data: investment };
};

export const getInvestments = async (env: Env, accessToken?: string) => {
  const supabase = getSupabase(env, accessToken);

  // Explicitly verify user to ensure token is valid and get user.id for explicit filtering
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized: Invalid token" };
  }

  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_uuid", user.id) // Explicitly filter by user_uuid even with RLS enabled
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  if (!data) return { data: [] };

  const investmentsWithGains = data.map((inv: Investment) => {
    const absolute_gain = (inv.current_value || 0) - (inv.principal || 0);
    const percentage_change =
      inv.principal > 0 ? (absolute_gain / inv.principal) * 100 : 0;
    return {
      ...inv,
      absolute_gain,
      percentage_change,
    };
  });

  return { data: investmentsWithGains };
};

export const getInvestmentById = async (
  id: string,
  env: Env,
  accessToken?: string,
) => {
  const supabase = getSupabase(env, accessToken);

  // Explicitly verify user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized: Invalid token" };
  }

  const { data: investment, error: invError } = await supabase
    .from("investments")
    .select("*")
    .eq("uuid", id)
    .eq("user_uuid", user.id) // Explicitly filter by user_uuid
    .single();

  if (invError) return { error: invError.message };

  const { data: history, error: histError } = await supabase
    .from("investment_value_history")
    .select("*")
    .eq("investment_uuid", id)
    .order("recorded_at", { ascending: true });

  if (histError) return { error: histError.message };

  const current_value = investment.current_value || 0;
  const principal = investment.principal || 0;
  const absolute_gain = current_value - principal;
  const percentage_change =
    principal > 0 ? (absolute_gain / principal) * 100 : 0;

  return {
    data: {
      ...investment,
      history: history || [],
      absolute_gain,
      percentage_change,
    },
  };
};

export const updateInvestmentValue = async (
  id: string,
  data: UpdateValuePayload,
  env: Env,
  accessToken?: string,
) => {
  const supabase = getSupabase(env, accessToken);

  // Explicitly verify user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized: Invalid token" };
  }

  // 1. Update the investment current_value
  const { data: investment, error: invError } = await supabase
    .from("investments")
    .update({ current_value: data.value, updated_at: new Date().toISOString() })
    .eq("uuid", id)
    .eq("user_uuid", user.id) // Explicitly filter
    .select()
    .single();

  if (invError) return { error: invError.message };

  // 2. Add to history
  const { error: histError } = await supabase
    .from("investment_value_history")
    .insert([
      {
        investment_uuid: id,
        value: data.value,
        recorded_at: data.recorded_at || new Date().toISOString(),
        notes: data.notes,
      },
    ]);

  if (histError) console.error("History recording error:", histError);

  return { data: investment };
};

export const cashOutInvestment = async (
  id: string,
  data: CashOutPayload,
  env: Env,
  accessToken?: string,
) => {
  const supabase = getSupabase(env, accessToken);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "Unauthorized: Invalid token" };

  // 1. Fetch current state with user check
  const { data: investment, error: fetchError } = await supabase
    .from("investments")
    .select("*")
    .eq("uuid", id)
    .eq("user_uuid", user.id) // Explicitly filter
    .single();

  if (fetchError) return { error: fetchError.message };

  if (data.amount > investment.current_value) {
    return { error: "Withdrawal amount exceeds current value" };
  }

  const newValue = (investment.current_value || 0) - data.amount;
  // Calculate how much principal this withdrawal represents (proportionally)
  const principalReduced =
    investment.current_value > 0
      ? (data.amount / investment.current_value) * (investment.principal || 0)
      : 0;
  const newPrincipal = (investment.principal || 0) - principalReduced;

  // 2. Update investment
  const { data: updatedInv, error: invUpdateError } = await supabase
    .from("investments")
    .update({
      current_value: newValue,
      principal: newPrincipal,
      status: newValue <= 0 ? "closed" : "active",
      updated_at: new Date().toISOString(),
    })
    .eq("uuid", id)
    .eq("user_uuid", user.id) // Explicitly filter
    .select()
    .single();

  if (invUpdateError) return { error: invUpdateError.message };

  // 3. Add to history
  await supabase.from("investment_value_history").insert([
    {
      investment_uuid: id,
      value: newValue,
      recorded_at: data.date,
      notes: `Withdrawal: ${data.amount}`,
    },
  ]);

  // 4. Record as cash_in entry
  const { error: cfError } = await supabase.from("cash_flow").insert([
    {
      user_uuid: user.id,
      amount: data.amount,
      type: "in",
      source_reason: `Withdrawal from ${investment.name}`,
      metadata: {
        investment_uuid: id,
        action: "cashout",
        category_name: "Investment Return",
        notes: data.notes,
      },
    },
  ]);

  if (cfError) console.error("Cash flow recording error:", cfError);

  return { data: updatedInv };
};

export const deleteInvestment = async (
  id: string,
  env: Env,
  accessToken?: string,
) => {
  const supabase = getSupabase(env, accessToken);

  // Explicitly verify user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized: Invalid token" };
  }

  const { error } = await supabase
    .from("investments")
    .delete()
    .eq("uuid", id)
    .eq("user_uuid", user.id); // Explicitly filter

  return { error: error?.message };
};
