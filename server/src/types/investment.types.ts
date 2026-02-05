export type InvestmentType = "stock" | "crypto" | "fund" | "savings" | "other";
export type InvestmentStatus = "active" | "closed";

export interface Investment {
  uuid: string;
  user_uuid: string;
  name: string;
  type: InvestmentType;
  principal: number;
  current_value: number;
  start_date: string;
  status: InvestmentStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Calculated fields
  absolute_gain?: number;
  percentage_change?: number;
}

export interface InvestmentValueHistory {
  uuid: string;
  investment_uuid: string;
  value: number;
  recorded_at: string;
  notes?: string;
  created_at: string;
}

export interface CreateInvestmentPayload {
  name: string;
  type: InvestmentType;
  principal: number;
  start_date: string;
  metadata?: Record<string, any>;
}

export interface UpdateValuePayload {
  value: number;
  recorded_at?: string;
  notes?: string;
}

export interface CashOutPayload {
  amount: number;
  date: string;
  notes?: string;
}
