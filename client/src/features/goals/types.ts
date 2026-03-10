export interface Goal {
  id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  source_account_id: string;
  target_date?: string;
  start_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  uuid: string;
  goal_id: string;
  transaction_id: string;
  amount: number;
  contributed_at: string;
  created_at: string;
}

export interface CreateGoalPayload {
  title: string;
  target_amount: number;
  source_account_id: string;
  target_date?: string;
  description?: string;
}

export interface CreateContributionPayload {
  transaction_id: string;
  amount: number;
}

export interface SavingsBehavior {
  average_monthly_savings: number;
  average_monthly_spending: number;
  forecast_months_to_goal?: number;
}

export interface GoalForecast {
  months_to_goal: number;
  is_on_track: boolean;
  forecast_message: string;
}

export interface PredictionResult {
  prediction: string;
  monthsNeeded?: number;
  estimatedCompletionDate?: string;
  timeSeries?: { period: string; amount: number }[];
}
