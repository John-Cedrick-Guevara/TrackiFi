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
import {
  TrendingUp,
  BarChart3,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  return (
    <div className="min-h-screen">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary tracking-tight">
                  Analytics
                </h1>
              </div>
              <p className="text-sm sm:text-base text-text-secondary ml-0 sm:ml-14">
                Visualize your financial patterns and track spending trends
              </p>
            </div>

            {/* Date Range Badge */}
            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-text-secondary mt-0.5" />
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">
                  Analysis Period
                </p>
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200 border-2 px-3 py-1 text-xs sm:text-sm font-medium"
                >
                  {format(startDate, "MMM dd")} -{" "}
                  {format(endDate, "MMM dd, yyyy")}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow Comparison Chart - Hero Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="relative bg-gradient-to-br from-white to-gray-50/50 rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100/50 overflow-hidden backdrop-blur-sm">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />

            <div className="relative p-6 sm:p-8">
              {/* Chart Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md shadow-purple-500/20">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                      Cash Flow Comparison
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary">
                      Track income vs expenses over time
                    </p>
                  </div>
                </div>

                {/* Time View Toggle */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
                    View:
                  </span>
                  <TimeViewToggle value={timeView} onChange={setTimeView} />
                </div>
              </div>

              {/* Chart */}
              <BiaxialBarChart
                data={timeSeriesData}
                isLoading={isTimeSeriesLoading}
                timeView={timeView}
              />
            </div>
          </div>
        </div>

        {/* Savings Overview Chart - Full Width Featured Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="relative bg-gradient-to-br from-white to-green-50/30 rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-green-100/50 overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-grid-green-100/40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />

            <div className="relative p-6 sm:p-8">
              {/* Chart Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md shadow-green-500/20">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                      Savings Overview
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary">
                      Net savings (Inflow - Outflow) over time
                    </p>
                  </div>
                </div>

                {/* Custom Time View Toggle for Savings */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
                    View:
                  </span>
                  <div className="inline-flex gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-green-200/50 shadow-sm">
                    <button
                      onClick={() => setSavingsTimeView("weekly")}
                      className={cn(
                        "px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200",
                        savingsTimeView === "weekly"
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md shadow-green-500/30"
                          : "text-text-secondary hover:text-text-primary hover:bg-green-50/50",
                      )}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setSavingsTimeView("monthly")}
                      className={cn(
                        "px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200",
                        savingsTimeView === "monthly"
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md shadow-green-500/30"
                          : "text-text-secondary hover:text-text-primary hover:bg-green-50/50",
                      )}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <SavingsBarChart
                data={savingsTimeSeriesData}
                isLoading={isSavingsLoading}
                timeView={savingsTimeView}
              />
            </div>
          </div>
        </div>

        {/* Category Analysis Section */}
        <div>
          <div className="mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-1">
              Category Breakdown
            </h2>
            <p className="text-sm text-text-secondary">
              Analyze your spending and income patterns by category
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Spending by Category */}
            <div className="group relative bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-lg shadow-gray-200/50 border border-orange-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/60">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-grid-orange-100/40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl group-hover:bg-orange-400/15 transition-colors duration-500" />

              <div className="relative p-6">
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md shadow-orange-500/20">
                    <ArrowDownRight className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-text-primary">
                      Spending by Category
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Where your money goes
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <CategoryBarChart
                  data={outflowCategoryData}
                  isLoading={isOutflowCategoryLoading}
                />
              </div>
            </div>

            {/* Income by Category */}
            <div className="group relative bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-lg shadow-gray-200/50 border border-green-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/60">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-grid-green-100/40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-400/10 rounded-full blur-3xl group-hover:bg-green-400/15 transition-colors duration-500" />

              <div className="relative p-6">
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md shadow-green-500/20">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-text-primary">
                      Income by Category
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Sources of your income
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <InflowCategoryBarChart
                  data={inflowCategoryData}
                  isLoading={isInflowCategoryLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
