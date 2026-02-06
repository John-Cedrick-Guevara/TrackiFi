import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers";
import { fetchCashFlowTimeSeries, fetchCashFlowByCategory } from "./api";
import type { TimeView } from "./types";
import BiaxialBarChart from "./components/BiaxialBarChart";
import CategoryBarChart from "./components/CategoryBarChart";
import InflowCategoryBarChart from "./components/InflowCategoryBarChart";
import SavingsBarChart from "./components/SavingsBarChart";
import TimeViewToggle from "./components/TimeViewToggle";
import { format, subDays } from "date-fns";

const Analytics = () => {
  const supabase = useSupabase();
  const [timeView, setTimeView] = useState<TimeView>("daily");
  const [savingsTimeView, setSavingsTimeView] = useState<TimeView>("weekly");

  // Calculate date range (last 90 days to provide enough data for weekly/monthly views)
  const { startDateStr, endDateStr, startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 90);

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
  }, []);

  // Fetch time series data for the main Comparison Chart
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

      return await fetchCashFlowTimeSeries(
        token,
        timeView,
        startDateStr,
        endDateStr,
      );
    },
  });

  // Fetch time series data for the Savings Chart (independent time view)
  const { data: savingsTimeSeriesData, isLoading: isSavingsLoading } = useQuery(
    {
      queryKey: [
        "savingsTimeSeries",
        savingsTimeView,
        startDateStr,
        endDateStr,
      ],
      queryFn: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("No authentication token");
        }

        return await fetchCashFlowTimeSeries(
          token,
          savingsTimeView,
          startDateStr,
          endDateStr,
        );
      },
    },
  );

  // Fetch outflow category data
  const { data: outflowCategoryData, isLoading: isOutflowCategoryLoading } =
    useQuery({
      queryKey: ["cashFlowByCategory", "out", startDateStr, endDateStr],
      queryFn: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("No authentication token");
        }

        return await fetchCashFlowByCategory(
          token,
          startDateStr,
          endDateStr,
          "out",
        );
      },
    });

  // Fetch inflow category data
  const { data: inflowCategoryData, isLoading: isInflowCategoryLoading } =
    useQuery({
      queryKey: ["cashFlowByCategory", "in", startDateStr, endDateStr],
      queryFn: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("No authentication token");
        }

        return await fetchCashFlowByCategory(
          token,
          startDateStr,
          endDateStr,
          "in",
        );
      },
    });

    console.log(inflowCategoryData)

  return (
    <div className="min-h-screen bg-bg-main p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Cash Flow Insights
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Last 90 days: {format(startDate, "MMM dd, yyyy")} -{" "}
            {format(endDate, "MMM dd, yyyy")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Global View
          </span>
        </div>
      </div>

      {/* Cash Flow Comparison Chart */}
      <div className="bg-bg-surface rounded-2xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Flow Comparison
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
            View:
          </span>
          <TimeViewToggle value={timeView} onChange={setTimeView} />
        </div>
        <BiaxialBarChart
          data={timeSeriesData}
          isLoading={isTimeSeriesLoading}
          timeView={timeView}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Overview Chart - Full Width */}
        <div className="bg-bg-surface rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Savings Overview
              </h2>
              <p className="text-sm text-text-secondary">
                Net savings (Inflow - Outflow) over time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
                View:
              </span>
              <div className="flex gap-1 bg-bg-main p-1 rounded-md">
                <button
                  onClick={() => setSavingsTimeView("weekly")}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    savingsTimeView === "weekly"
                      ? "bg-bg-surface text-accent-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSavingsTimeView("monthly")}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    savingsTimeView === "monthly"
                      ? "bg-bg-surface text-accent-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>
          <SavingsBarChart
            data={savingsTimeSeriesData}
            isLoading={isSavingsLoading}
            timeView={savingsTimeView}
          />
        </div>

        {/* Category Breakdown Chart - Spending */}
        <div className="bg-bg-surface rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Spending by Category
          </h2>
          <CategoryBarChart
            data={outflowCategoryData}
            isLoading={isOutflowCategoryLoading}
          />
        </div>

        {/* Category Breakdown Chart - Income */}
        <div className="bg-bg-surface rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Income by Category
          </h2>
          <InflowCategoryBarChart
            data={inflowCategoryData}
            isLoading={isInflowCategoryLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
