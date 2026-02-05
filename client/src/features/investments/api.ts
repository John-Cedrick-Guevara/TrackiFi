import { API_BASE_URL as BASE_URL } from "@/lib/config";
import type {
  Investment,
  CreateInvestmentPayload,
  UpdateValuePayload,
  CashOutPayload,
} from "./types";

const API_BASE_URL = `${BASE_URL}/api/investments`;

export const fetchInvestments = async (
  token: string,
): Promise<Investment[]> => {
  const response = await fetch(API_BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch investments");
  }
  const result = await response.json();
  return result.data;
};

export const fetchInvestment = async (
  id: string,
  token: string,
): Promise<Investment & { history: any[] }> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch investment");
  }
  const result = await response.json();
  return result.data;
};

export const createInvestment = async (
  payload: CreateInvestmentPayload,
  token: string,
): Promise<Investment> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create investment");
  }
  const result = await response.json();
  return result.data;
};

export const updateValue = async (
  id: string,
  payload: UpdateValuePayload,
  token: string,
): Promise<Investment> => {
  const response = await fetch(`${API_BASE_URL}/${id}/value`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update investment value");
  }
  const result = await response.json();
  return result.data;
};

export const cashOut = async (
  id: string,
  payload: CashOutPayload,
  token: string,
): Promise<Investment> => {
  const response = await fetch(`${API_BASE_URL}/${id}/cashout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to cash out investment");
  }
  const result = await response.json();
  return result.data;
};

export const deleteInvestment = async (
  id: string,
  token: string,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete investment");
  }
};
