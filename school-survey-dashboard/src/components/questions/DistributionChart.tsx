import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DistributionItem } from "../../types/survey";
import { getLikertColor } from "../../utils/colors";

interface DistributionChartProps {
  data: DistributionItem[];
}

export function DistributionChart({ data }: DistributionChartProps) {
  const chartData = data.filter((d) => d.count > 0 || ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다"].includes(d.label));

  return (
    <div style={{ width: "100%", height: chartData.length * 36 + 20 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#6a6a6a" }} />
          <YAxis
            type="category"
            dataKey="label"
            width={90}
            tick={{ fontSize: 12, fill: "#3a3a3a" }}
          />
          <Tooltip
            formatter={(value, _name, props) => {
              const p = props as { payload?: DistributionItem };
              return [`${value}건 (${p.payload?.percentage ?? 0}%)`, "응답"];
            }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e5e5",
              fontSize: 13,
            }}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={24}>
            {chartData.map((entry, i) => (
              <Cell key={entry.label} fill={getLikertColor(entry.label, i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
