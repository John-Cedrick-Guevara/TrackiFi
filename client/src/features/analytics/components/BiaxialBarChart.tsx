import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesData } from "../types";
import { format } from "date-fns";

interface BiaxialBarChartProps {
  data: TimeSeriesData[] | undefined;
  isLoading: boolean;
  timeView: "daily" | "weekly" | "monthly";
}

const BiaxialBarChart: React.FC<BiaxialBarChartProps> = ({
  data,
  isLoading,
  timeView,
}) => {
  // Theme colors
  const COLORS = {
    inflow: "#2ecc71", // Green for cash in
    outflow: "#9b59b6", // Purple for cash out
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const inflow =
        payload.find((p: any) => p.dataKey === "inflow")?.value || 0;
      const outflow =
        payload.find((p: any) => p.dataKey === "outflow")?.value || 0;
      const net = inflow - outflow;

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
          minimumFractionDigits: 0,
        }).format(amount);
      };

      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {formatPeriodLabel(payload[0].payload.period, timeView)}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-green-600">
              Cash In: {formatCurrency(inflow)}
            </p>
            <p className="text-sm text-purple-600">
              Cash Out: {formatCurrency(outflow)}
            </p>
            <p
              className={`text-sm font-medium ${net >= 0 ? "text-green-700" : "text-red-700"}`}
            >
              Net: {formatCurrency(net)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Format period label based on time view
  const formatPeriodLabel = (period: string, view: string) => {
    try {
      if (view === "daily") {
        return format(new Date(period), "MMM dd, yyyy");
      } else if (view === "weekly") {
        return `Week of ${format(new Date(period), "MMM dd, yyyy")}`;
      } else {
        // Monthly format: period is "YYYY-MM"
        const [year, month] = period.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return format(date, "MMMM yyyy");
      }
    } catch (error) {
      return period;
    }
  };

  // Format X-axis ticks
  const formatXAxis = (value: string) => {
    try {
      if (timeView === "daily") {
        return format(new Date(value), "MMM dd");
      } else if (timeView === "weekly") {
        return format(new Date(value), "MMM dd");
      } else {
        // Monthly format: value is "YYYY-MM"
        const [year, month] = value.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return format(date, "MMM yyyy");
      }
    } catch (error) {
      return value;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Loading chart...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="period"
          tickFormatter={formatXAxis}
          stroke="#6c757d"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="#6c757d"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) =>
            new Intl.NumberFormat("en-PH", {
              notation: "compact",
              compactDisplay: "short",
            }).format(value)
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: "10px",  }}
          iconType="rect"
          formatter={(value) => (
            <span style={{ color: "#212529", fontSize: "14px" }}>
              {value === "inflow" ? "Cash In" : "Cash Out"}
            </span>
          )}
        />
        <Bar dataKey="inflow" fill={COLORS.inflow} radius={[8, 8, 0, 0]} />
        <Bar dataKey="outflow" fill={COLORS.outflow} radius={[8, 8, 0, 0]} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default BiaxialBarChart;
