export interface Goal {
  uuid: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  type: "saving" | "spending";
  source_account_id: string;
  start_date: string;
  end_date?: string;
  status: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GoalWithProgress extends Goal {
  current_amount: number;
}

export interface CreateGoalPayload {
  name: string;
  target_amount: number;
  type: "saving" | "spending";
  source_account_id: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface UpdateGoalPayload {
  name?: string;
  target_amount?: number;
  type?: "saving" | "spending";
  source_account_id?: string;
  end_date?: string;
  description?: string;
}

export interface GoalContribution {
  uuid: string;
  goal_id: string;
  transaction_id: string;
  amount: number;
  contributed_at: string;
  created_at: string;
}

export interface CreateContributionPayload {
  transaction_id: string;
  amount: number;
}

export type TimeInterval = "daily" | "weekly" | "monthly";

export interface TimeSeriesPoint {
  period: string;
  amount: number;
}

export interface ExponentialSmoothingParams {
  alpha: number;
  beta: number;
  data: TimeSeriesPoint[];
  goalAmount: number;
  currentAmount: number;
}
