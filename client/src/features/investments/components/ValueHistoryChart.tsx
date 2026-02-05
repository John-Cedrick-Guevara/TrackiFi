import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import type { InvestmentValueHistory } from "../types";

interface ValueHistoryChartProps {
  history: InvestmentValueHistory[];
  principal: number;
}

export function ValueHistoryChart({
  history,
  principal,
}: ValueHistoryChartProps) {
  const data = history.map((h) => ({
    date: new Date(h.recorded_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    value: h.value,
    principal: principal,
  }));

  return (
    <div className="h-50 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--accent-primary)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--accent-primary)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
            minTickGap={30}
          />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--text-primary)",
            }}
            itemStyle={{ color: "var(--accent-primary)" }}
          />
          <ReferenceLine
            y={principal}
            stroke="var(--text-muted)"
            strokeDasharray="3 3"
            label={{
              value: "Principal",
              position: "insideBottomLeft",
              fill: "var(--text-muted)",
              fontSize: 10,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--accent-primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
