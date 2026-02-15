import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/providers";
import type {
  AccountWithBalance,
  Transaction,
  CreateIncomeRequest,
  CreateExpenseRequest,
  CreateTransferRequest,
  TransactionFilters,
} from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

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

// ==================
// ACCOUNT QUERIES
// ==================

/**
 * Fetch all user accounts with balances
 */
export const useAccounts = () => {
  return useQuery<AccountWithBalance[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const data = await fetchWithAuth(`${API_BASE_URL}/api/accounts`);
      return data.data;
    },
  });
};

/**
 * Fetch a specific account balance
 */
export const useAccountBalance = (accountId: string) => {
  return useQuery<number>({
    queryKey: ["account-balance", accountId],
    queryFn: async () => {
      const data = await fetchWithAuth(
        `${API_BASE_URL}/api/accounts/${accountId}/balance`,
      );
      return data.data.balance;
    },
    enabled: !!accountId,
  });
};

// ==================
// TRANSACTION MUTATIONS
// ==================

/**
 * Create income transaction
 */
export const useCreateIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateIncomeRequest) => {
      return fetchWithAuth(`${API_BASE_URL}/api/transactions/income`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate accounts to refresh balances
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["account-balance"] });
    },
  });
};

/**
 * Create expense transaction
 */
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseRequest) => {
      return fetchWithAuth(`${API_BASE_URL}/api/transactions/expense`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate accounts to refresh balances
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["account-balance"] });
    },
  });
};

/**
 * Create transfer transaction
 */
export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransferRequest) => {
      return fetchWithAuth(`${API_BASE_URL}/api/transactions/transfer`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate accounts to refresh balances
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["account-balance"] });
    },
  });
};

// ==================
// TRANSACTION QUERIES
// ==================

/**
 * Fetch transaction history with filters
 */
export const useTransactionHistory = (filters?: TransactionFilters) => {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.transaction_type)
        params.append("transaction_type", filters.transaction_type);
      if (filters?.account_id) params.append("account_id", filters.account_id);
      if (filters?.start_date) params.append("start_date", filters.start_date);
      if (filters?.end_date) params.append("end_date", filters.end_date);
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.offset) params.append("offset", filters.offset.toString());

      const data = await fetchWithAuth(
        `${API_BASE_URL}/api/transactions?${params.toString()}`,
      );
      return data.data;
    },
  });
};
