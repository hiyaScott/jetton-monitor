import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import type { HistoryPoint } from "../types";
import "./HistoryChart.css";

interface HistoryChartProps {
  data: HistoryPoint[];
  title: string;
  color: string;
}

export default function HistoryChart({ data, title, color }: HistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="history-chart">
        <div className="chart-header">{title}</div>
        <div className="chart-empty">暂无数据</div>
      </div>
    );
  }

  // 简化时间戳显示
  const formattedData = data.map((point) => ({
    ...point,
    time: point.timestamp.slice(0, 5) // 只显示 HH:MM
  }));

  return (
    <div className="history-chart">
      <div className="chart-header">{title}</div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#666", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              tick={{ fill: "#666", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px"
              }}
              labelStyle={{ color: "#888" }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  score: "评分",
                  pending: "等待中",
                  processing: "处理中",
                  tokens: "Token数"
                };
                return [value, labels[name] || name];
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${title})`}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}