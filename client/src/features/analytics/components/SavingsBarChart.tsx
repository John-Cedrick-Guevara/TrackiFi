import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { format, addDays, isSameMonth } from "date-fns";
import type { TimeSeriesData, TimeView } from "../types";
import { useSavingsAggregation } from "../hooks/useSavingsAggregation";

interface SavingsBarChartProps {
  data: TimeSeriesData[] | undefined;
  isLoading: boolean;
  timeView: TimeView;
}

/**
 * SavingsBarChart Component
 *
 * Displays a bar chart showing net savings (Inflow - Outflow) over time.
 * Supports Weekly and Monthly views.
 */
const SavingsBarChart: React.FC<SavingsBarChartProps> = ({
  data,
  isLoading,
  timeView,
}) => {
  // Helper to parse date string without timezone shifts
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    if (dateStr.length === 10) {
      // Handle YYYY-MM-DD
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  // Theme colors
  const COLORS = {
    positive: "#2ecc71", // TrackiFi Green
    negative: "#e74c3c", // Calmed Red
    axis: "#94a3b8",
    grid: "#e2e8f0",
  };

  // Process data to calculate savings using the reusable hook
  const chartData = useSavingsAggregation(data);

  // Custom tooltips... (no changes needed in code logic)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const { savings, inflow, outflow, period } = data;

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
          minimumFractionDigits: 0,
        }).format(amount);
      };

      return (
        <div className="bg-bg-surface px-4 py-3 rounded-lg shadow-lg border border-border">
          <p className="text-sm font-semibold text-text-primary mb-2">
            {formatPeriodLabel(period, timeView)}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-text-secondary flex justify-between gap-4">
              <span>Total In:</span>
              <span className="text-green-600 font-medium">
                {formatCurrency(inflow)}
              </span>
            </p>
            <p className="text-xs text-text-secondary flex justify-between gap-4">
              <span>Total Out:</span>
              <span className="text-purple-600 font-medium">
                {formatCurrency(outflow)}
              </span>
            </p>
            <div className="pt-1 mt-1 border-t border-border flex justify-between gap-4">
              <span className="text-sm font-semibold text-text-primary">
                Net Savings:
              </span>
              <span
                className={`text-sm font-bold ${savings >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(savings)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatPeriodLabel = (period: string, view: string) => {
    try {
      if (view === "daily") {
        return format(parseDate(period), "MMM dd, yyyy");
      } else if (view === "weekly") {
        const date = parseDate(period);
        const endDate = addDays(date, 6);
        if (isSameMonth(date, endDate)) {
          return `${format(date, "MMM d")} - ${format(endDate, "d")}`;
        }
        return `${format(date, "MMM d")} - ${format(endDate, "MMM d")}`;
      } else {
        const [year, month] = period.split("-");
        const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        return format(monthDate, "MMMM yyyy");
      }
    } catch (error) {
      return period;
    }
  };

  const formatXAxis = (value: string) => {
    try {
      if (timeView === "daily") {
        return format(parseDate(value), "MMM dd");
      } else if (timeView === "weekly") {
        const date = parseDate(value);
        const endDate = addDays(date, 6);
        if (isSameMonth(date, endDate)) {
          return `${format(date, "MMM d")} - ${format(endDate, "d")}`;
        }
        return `${format(date, "MMM d")} - ${format(endDate, "MMM d")}`;
      } else {
        const [year, month] = value.split("-");
        const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        return format(monthDate, "MMM");
      }
    } catch (e) {
      return value;
    }
  };

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-text-secondary">
        No data available for this period.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={COLORS.grid}
          />
          <XAxis
            dataKey="period"
            tickFormatter={formatXAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.axis, fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.axis, fontSize: 12 }}
            tickFormatter={(value) =>
              `₱${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}`
            }
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: "20px", fontSize: "12px" }}
            formatter={() => (
              <span className="text-text-secondary font-medium">
                Net Savings
              </span>
            )}
          />
          <ReferenceLine y={0} stroke={COLORS.axis} strokeWidth={1} />
          <Bar dataKey="savings" radius={[4, 4, 0, 0]} animationDuration={1000}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.savings >= 0 ? COLORS.positive : COLORS.negative}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SavingsBarChart;
