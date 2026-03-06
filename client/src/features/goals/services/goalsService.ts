import { API_BASE_URL } from "@/lib/config";
import { supabase } from "@/providers";
import type { Goal, SavingsBehavior } from "../types";

export const goalsAPI = {
  getGoals: async (): Promise<Goal[]> => {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((g: any) => ({
      id: g.uuid,
      title: g.name || g.type,
      target_amount: Number(g.target_amount),
      current_amount: Number(g.metadata?.current_amount ?? 0),
      target_date: g.end_date,
      created_at: g.created_at,
      updated_at: g.updated_at,
    }));
  },

  getGoalById: async (id: string): Promise<Goal | undefined> => {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("uuid", id)
      .single();

    if (error) throw error;
    if (!data) return undefined;

    return {
      id: data.uuid,
      title: data.name || data.type,
      target_amount: Number(data.target_amount),
      current_amount: Number(data.metadata?.current_amount ?? 0),
      target_date: data.end_date,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  generatePrediction: async (
    goalId: string,
    userId: string,
    accessToken: string,
  ): Promise<{
    prediction: string;
    monthsNeeded?: number;
    estimatedCompletionDate?: string;
  }> => {
    const url = new URL(`${API_BASE_URL}/api/goals/generate-prediction`);
    url.searchParams.append("goalId", goalId);
    url.searchParams.append("userId", userId);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate prediction");
    }

    return response.json();
  },

  createGoal: async (
    goal: Omit<Goal, "id" | "created_at" | "updated_at">,
  ): Promise<Goal> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("goals")
      .insert({
        name: goal.title,
        target_amount: goal.target_amount,
        end_date: goal.target_date,
        user_id: userData.user.id,
        status: "active",
        type: "saving", // default
        start_date: new Date().toISOString().split("T")[0],
        metadata: { current_amount: goal.current_amount ?? 0 },
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.uuid,
      title: data.name || data.type,
      target_amount: Number(data.target_amount),
      current_amount: Number(data.metadata?.current_amount ?? 0),
      target_date: data.end_date,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  updateGoal: async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    const { data, error } = await supabase
      .from("goals")
      .update({
        ...(updates.title !== undefined && { name: updates.title }),
        ...(updates.target_amount !== undefined && {
          target_amount: updates.target_amount,
        }),
        ...(updates.target_date !== undefined && {
          end_date: updates.target_date,
        }),
        updated_at: new Date().toISOString(),
        ...(updates.current_amount !== undefined && {
          metadata: { current_amount: updates.current_amount },
        }),
      })
      .eq("uuid", id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.uuid,
      title: data.name || data.type,
      target_amount: Number(data.target_amount),
      current_amount: Number(data.metadata?.current_amount ?? 0),
      target_date: data.end_date,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  deleteGoal: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("goals").delete().eq("uuid", id);

    if (error) throw error;
    return true;
  },

  getBehavior: async (): Promise<SavingsBehavior> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      return { average_monthly_savings: 0, average_monthly_spending: 0 };
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const url = new URL(`${API_BASE_URL}/api/cashflows/analytics/timeseries`);
    url.searchParams.set("timeView", "monthly");
    url.searchParams.set("startDate", startDate.toISOString());
    url.searchParams.set("endDate", endDate.toISOString());

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return { average_monthly_savings: 0, average_monthly_spending: 0 };
    }

    const months: Array<{
      period: string;
      inflow: number;
      outflow: number;
      savings: number;
    }> = await response.json();

    if (!months || months.length === 0) {
      return { average_monthly_savings: 0, average_monthly_spending: 0 };
    }

    const count = months.length;
    const totalSavings = months.reduce(
      (sum, m) => sum + (m.inflow + m.savings - m.outflow),
      0,
    );
    const totalSpending = months.reduce((sum, m) => sum + m.outflow, 0);

    return {
      average_monthly_savings: Math.max(0, totalSavings / count),
      average_monthly_spending: totalSpending / count,
    };
  },
};
