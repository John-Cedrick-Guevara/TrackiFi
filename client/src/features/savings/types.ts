// Account Types
export type AccountType = "allowance" | "savings";

export interface Account {
  id: string;
  user_uuid: string;
  name: string;
  type: AccountType;
  created_at: string;
  updated_at: string;
}

export interface AccountWithBalance extends Account {
  balance: number;
}

// Transaction Types
export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  user_uuid: string;
  amount: number;
  transaction_type: TransactionType;
  from_account_id: string | null;
  to_account_id: string | null;
  date: string;
  category: string | null;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateIncomeRequest {
  amount: number;
  to_account_id: string;
  date?: string;
  category?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CreateExpenseRequest {
  amount: number;
  from_account_id: string;
  date?: string;
  category?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CreateTransferRequest {
  amount: number;
  from_account_id: string;
  to_account_id: string;
  date?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface TransactionFilters {
  transaction_type?: TransactionType;
  account_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}
