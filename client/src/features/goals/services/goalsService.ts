import { API_BASE_URL } from "@/lib/config";
import { supabase } from "@/providers";
import type {
  Goal,
  GoalContribution,
  CreateGoalPayload,
  CreateContributionPayload,
  SavingsBehavior,
  PredictionResult,
} from "../types";

// Helper to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error("No authentication token");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }

  return response.json();
};

export const goalsAPI = {
  // ==================
  // GOAL CRUD
  // ==================

  getGoals: async (): Promise<Goal[]> => {
    const result = await fetchWithAuth(`${API_BASE_URL}/api/goals`);
    return (result.data || []).map(mapGoalFromServer);
  },

  getGoalById: async (id: string): Promise<Goal | undefined> => {
    const result = await fetchWithAuth(`${API_BASE_URL}/api/goals/${id}`);
    return result.data ? mapGoalFromServer(result.data) : undefined;
  },

  createGoal: async (payload: CreateGoalPayload): Promise<Goal> => {
    const result = await fetchWithAuth(`${API_BASE_URL}/api/goals`, {
      method: "POST",
      body: JSON.stringify({
        name: payload.title,
        target_amount: payload.target_amount,
        source_account_id: payload.source_account_id,
        end_date: payload.target_date || undefined,
        description: payload.description || undefined,
        type: "saving",
      }),
    });
    return mapGoalFromServer(result.data);
  },

  updateGoal: async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    const serverPayload: Record<string, any> = {};
    if (updates.title !== undefined) serverPayload.name = updates.title;
    if (updates.target_amount !== undefined)
      serverPayload.target_amount = updates.target_amount;
    if (updates.target_date !== undefined)
      serverPayload.end_date = updates.target_date;
    if (updates.description !== undefined)
      serverPayload.description = updates.description;
    if (updates.source_account_id !== undefined)
      serverPayload.source_account_id = updates.source_account_id;

    const result = await fetchWithAuth(`${API_BASE_URL}/api/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(serverPayload),
    });
    return mapGoalFromServer(result.data);
  },

  deleteGoal: async (id: string): Promise<boolean> => {
    await fetchWithAuth(`${API_BASE_URL}/api/goals/${id}`, {
      method: "DELETE",
    });
    return true;
  },

  // ==================
  // CONTRIBUTIONS
  // ==================

  getContributions: async (goalId: string): Promise<GoalContribution[]> => {
    const result = await fetchWithAuth(
      `${API_BASE_URL}/api/goals/${goalId}/contributions`,
    );
    return result.data || [];
  },

  addContribution: async (
    goalId: string,
    payload: CreateContributionPayload,
  ): Promise<GoalContribution> => {
    const result = await fetchWithAuth(
      `${API_BASE_URL}/api/goals/${goalId}/contributions`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    return result.data;
  },

  removeContribution: async (
    goalId: string,
    contributionId: string,
  ): Promise<boolean> => {
    await fetchWithAuth(
      `${API_BASE_URL}/api/goals/${goalId}/contributions/${contributionId}`,
      { method: "DELETE" },
    );
    return true;
  },

  // ==================
  // PREDICTION
  // ==================

  generatePrediction: async (
    goalId: string,
    interval: "daily" | "weekly" | "monthly" = "monthly",
  ): Promise<PredictionResult> => {
    const url = new URL(`${API_BASE_URL}/api/goals/${goalId}/prediction`);
    url.searchParams.set("interval", interval);

    const result = await fetchWithAuth(url.toString());
    return result;
  },

  // ==================
  // BEHAVIOR (unchanged — used for fallback forecasting)
  // ==================

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

// Map server goal shape to client Goal type
function mapGoalFromServer(g: any): Goal {
  return {
    id: g.uuid,
    title: g.name || g.type,
    description: g.description || undefined,
    target_amount: Number(g.target_amount),
    current_amount: Number(g.current_amount ?? 0),
    source_account_id: g.source_account_id || "",
    target_date: g.end_date || undefined,
    start_date: g.start_date,
    status: g.status || "active",
    created_at: g.created_at,
    updated_at: g.updated_at,
  };
}
