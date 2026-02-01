import { API_BASE_URL as BASE_URL } from "@/lib/config";
import type { CashFlowSummary, Transaction } from "./types";

const API_BASE_URL = `${BASE_URL}/api/cashflows/analytics`;

/**
 * Fetches today's cash flow summary (total inflow and outflow)
 */
export const fetchTodayCashFlow = async (
  token: string,
): Promise<CashFlowSummary> => {
  const response = await fetch(`${API_BASE_URL}/today`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch today's cash flow");
  }

  return response.json();
};

/**
 * Fetches recent transaction history (last 20 transactions)
 */
export const fetchRecentTransactions = async (
  token: string,
): Promise<Transaction[]> => {
  const response = await fetch(`${API_BASE_URL}/recent`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch recent transactions");
  }

  return response.json();
};
