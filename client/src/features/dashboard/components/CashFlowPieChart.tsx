import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CashFlowSummary } from "../types";

interface CashFlowPieChartProps {
  data: CashFlowSummary | undefined;
  isLoading: boolean;
}

const CashFlowPieChart: React.FC<CashFlowPieChartProps> = ({
  data,
  isLoading,
}) => {
  // Theme colors
  const COLORS = {
    inflow: "#2ecc71", // Green for cash in (accent-secondary)
    outflow: "#9b59b6", // Purple for cash out (accent-primary)
  };

  if (isLoading) {
    return (
      <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-xs text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!data || (data.inflow === 0 && data.outflow === 0)) {
    return (
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
        <div className="text-xs text-gray-400 text-center px-2">No data</div>
      </div>
    );
  }


  const chartData = [
    { name: "Cash In", value: data.inflow, color: COLORS.inflow },
    { name: "Cash Out", value: data.outflow, color: COLORS.outflow },
  ].filter((item) => item.value > 0); // Only show segments with value

  // Custom tooltip to format amounts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(value);

      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm font-semibold text-accent-primary">
            {formattedValue}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-24 h-24">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius="100%"
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowPieChart;
