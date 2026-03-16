import type { CognitiveData } from "../types";
import "./MetricsGrid.css";

interface MetricsGridProps {
  data: CognitiveData | null;
}

export default function MetricsGrid({ data }: MetricsGridProps) {
  const metrics = [
    {
      label: "活跃会话",
      value: data?.active_sessions ?? "--",
      subtext: `${data?.recent_active_count ?? 0} 个活跃中`
    },
    {
      label: "等待中",
      value: data?.pending_count ?? "--",
      subtext: "待处理任务"
    },
    {
      label: "处理中",
      value: data?.processing_count ?? "--",
      subtext: "正在执行"
    },
    {
      label: "工具调用",
      value: data?.total_tool_calls ?? "--",
      subtext: "总调用数"
    },
    {
      label: "Token数",
      value: data?.total_tokens_formatted ?? "--",
      subtext: "处理中任务"
    },
    {
      label: "预计响应",
      value: data?.estimated_response_formatted ?? "--",
      subtext: "等待时间"
    },
    {
      label: "CPU使用率",
      value: data ? `${data.cpu_percent.toFixed(1)}%` : "--",
      subtext: "系统负载"
    },
    {
      label: "内存使用率",
      value: data ? `${data.memory_percent.toFixed(1)}%` : "--",
      subtext: "系统内存"
    }
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((metric, index) => (
        <div key={index} className="metric-card">
          <div className="metric-label">{metric.label}</div>
          <div className="metric-value">{metric.value}</div>
          <div className="metric-subtext">{metric.subtext}</div>
        </div>
      ))}
    </div>
  );
}