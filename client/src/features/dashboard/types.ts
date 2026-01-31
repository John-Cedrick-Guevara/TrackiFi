export interface CashFlowSummary {
  inflow: number;
  outflow: number;
}

export interface Transaction {
  uuid: string;
  amount: number;
  type: "in" | "out";
  metadata: {
    category_name?: string;
    tags?: string[];
  } | null;
  logged_at: string;
}
