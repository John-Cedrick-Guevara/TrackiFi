import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CategoryData } from "../types";

interface InflowCategoryBarChartProps {
  data: CategoryData[] | undefined;
  isLoading: boolean;
}

/**
 * InflowCategoryBarChart
 * Visualizes Cash Flow In grouped by category.
 *
 * Data Aggregation Logic:
 * - Records are filtered by type='in' on the server-side.
 * - Grouped by category_name (stored in metadata).
 * - Aggregated by summing the amount for each category.
 * - Sorted in descending order of total amount.
 */
const InflowCategoryBarChart: React.FC<InflowCategoryBarChartProps> = ({
  data,
  isLoading,
}) => {
  // Theme color for inflow (Green/Teal accent)
  const BAR_COLOR = "#2ecc71"; // Emerald green

  // Custom tooltip for inflow
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const category = payload[0].payload.category;
      const amount = payload[0].value;
      const percentage = payload[0].payload.percentage;

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
          minimumFractionDigits: 0,
        }).format(amount);
      };

      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">{category}</p>
          <div className="space-y-1">
            <p className="text-sm text-emerald-600">
              Inflow: {formatCurrency(amount)}
            </p>
            <p className="text-sm text-gray-600">
              {percentage.toFixed(1)}% of total income
            </p>
          </div>
        </div>
      );
    }
    return null;
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
        <p className="text-gray-400">No income data for this period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e0e0e0"
          vertical={false}
        />
        <XAxis
          dataKey="category"
          stroke="#6c757d"
          style={{ fontSize: "12px" }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
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
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(46, 204, 113, 0.1)" }}
        />
        <Bar
          dataKey="amount"
          fill={BAR_COLOR}
          radius={[6, 6, 0, 0]}
          barSize={40}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={BAR_COLOR}
              fillOpacity={Math.max(0.3, 1 - index * 0.08)} // Slight gradient effect by rank, capped at 0.3 opacity
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default InflowCategoryBarChart;
