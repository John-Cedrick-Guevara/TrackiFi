import { useMemo } from "react";
import type { TimeSeriesData } from "../types";

export interface AggregatedSavingsData extends TimeSeriesData {
  savings: number;
}

/**
 * Hook to aggregate and calculate savings from time series data.
 * Computes: Savings = Inflow - Outflow
 */
export const useSavingsAggregation = (data: TimeSeriesData[] | undefined) => {
  const aggregatedData = useMemo(() => {
    if (!data) return [];

    return data.map((item) => {
      const inflow = Number(item.inflow || 0);
      const outflow = Number(item.outflow || 0);
      return {
        ...item,
        inflow,
        outflow,
        savings: inflow - outflow,
      };
    });
  }, [data]);

  return aggregatedData;
};
