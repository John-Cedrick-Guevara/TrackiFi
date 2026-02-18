export type TimeView = "daily" | "weekly" | "monthly";

export interface TimeSeriesData {
  savings: number;
  period: string;
  inflow: number;
  outflow: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}
