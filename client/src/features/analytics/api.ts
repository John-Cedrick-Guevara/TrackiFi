import type { TimeSeriesData, CategoryData, TimeView } from "./types";

const API_BASE_URL = "http://127.0.0.1:8787/api/cashflows/analytics";

/**
 * Fetches cash flow time series data
 */
export const fetchCashFlowTimeSeries = async (
  token: string,
  timeView: TimeView,
  startDate: string,
  endDate: string,
): Promise<TimeSeriesData[]> => {
  const url = new URL(`${API_BASE_URL}/timeseries`);
  url.searchParams.append("timeView", timeView);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch time series data: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetches cash flow breakdown by category
 */
export const fetchCashFlowByCategory = async (
  token: string,
  startDate: string,
  endDate: string,
): Promise<CategoryData[]> => {
  const url = new URL(`${API_BASE_URL}/by-category`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch category data: ${response.statusText}`);
  }

  return response.json();
};
