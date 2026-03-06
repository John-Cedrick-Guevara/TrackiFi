export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  created_at: string;
  updated_at: string;
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
