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

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
}
