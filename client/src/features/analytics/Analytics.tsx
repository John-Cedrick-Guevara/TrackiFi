import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers";
import { fetchCashFlowTimeSeries, fetchCashFlowByCategory } from "./api";
import type { TimeView } from "./types";
import BiaxialBarChart from "./components/BiaxialBarChart";
import CategoryBarChart from "./components/CategoryBarChart";
import TimeViewToggle from "./components/TimeViewToggle";
import { format, subDays } from "date-fns";

const Analytics = () => {
  const supabase = useSupabase();
  const [timeView, setTimeView] = useState<TimeView>("daily");

  // Calculate date range (last 30 days) - use useMemo to prevent recalculation
  const { startDateStr, endDateStr, startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 30);

    // Set to start of day for start date
    start.setHours(0, 0, 0, 0);
    // Set to end of day for end date
    end.setHours(23, 59, 59, 999);

    return {
      startDateStr: start.toISOString(),
      endDateStr: end.toISOString(),
      startDate: start,
      endDate: end,
    };
  }, []); // Empty dependency array - only calculate once on mount
  // Fetch time series data
  const { data: timeSeriesData, isLoading: isTimeSeriesLoading } = useQuery({
    queryKey: ["cashFlowTimeSeries", timeView, startDateStr, endDateStr],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("No authentication token");
      }

      const data = await fetchCashFlowTimeSeries(
        token,
        timeView,
        startDateStr,
        endDateStr,
      );
      console.log("Time series data received:", data);
      return data;
    },
  });

  // Fetch category data
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["cashFlowByCategory", startDateStr, endDateStr],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("No authentication token");
      }

      const data = await fetchCashFlowByCategory(
        token,
        startDateStr,
        endDateStr,
      );
      console.log("Category data received:", data);
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-bg-main p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Cash Flow Insights
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {format(startDate, "MMM dd, yyyy")} -{" "}
            {format(endDate, "MMM dd, yyyy")}
          </p>
        </div>
        <TimeViewToggle value={timeView} onChange={setTimeView} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Comparison Chart */}
        <div className="bg-bg-surface rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Cash Flow Comparison
          </h2>
          <BiaxialBarChart
            data={timeSeriesData}
            isLoading={isTimeSeriesLoading}
            timeView={timeView}
          />
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-bg-surface rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Spending by Category
          </h2>
          <CategoryBarChart data={categoryData} isLoading={isCategoryLoading} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
