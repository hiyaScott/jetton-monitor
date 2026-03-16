import type { CognitiveData } from "../types";
import "./StatusCard.css";

interface StatusCardProps {
  data: CognitiveData | null;
  loading: boolean;
  latency: number;
}

export default function StatusCard({ data, loading, latency }: StatusCardProps) {
  const getStatusConfig = (score: number) => {
    if (score >= 65) return {
      emoji: "🔴",
      text: "高负载",
      className: "status-high",
      color: "#ef4444",
      suggestion: "建议等待"
    };
    if (score >= 45) return {
      emoji: "🟡",
      text: "中等负载",
      className: "status-medium",
      color: "#eab308",
      suggestion: "建议简单任务"
    };
    if (score >= 25) return {
      emoji: "🔵",
      text: "轻负载",
      className: "status-low",
      color: "#3b82f6",
      suggestion: "30秒内响应"
    };
    return {
      emoji: "🟢",
      text: "空闲",
      className: "status-idle",
      color: "#22c55e",
      suggestion: "立即响应"
    };
  };

  const score = data?.cognitive_score ?? 0;
  const config = getStatusConfig(score);

  return (
    <div className="status-card">
      <div className={`status-indicator ${config.className} ${loading ? 'loading' : ''}`}>
        {loading ? "⏳" : config.emoji}
      </div>

      <div className="status-content">
        <div className="status-main">
          <div className="status-text" style={{ color: config.color }}>
            {data ? `${config.text} (${score}%)` : "等待数据..."}
          </div>
          <div className="status-suggestion">
            {data?.suggestion || config.suggestion}
          </div>
        </div>

        <div className="latency-bar">
          <div
            className="latency-fill"
            style={{
              width: `${Math.min(latency / 500 * 100, 100)}%`,
              background: latency < 100 ? '#22c55e' : latency < 300 ? '#eab308' : '#ef4444'
            }}
          />
        </div>
        <div className="latency-text">
          <span>延迟</span>
          <span>{latency} ms</span>
        </div>
      </div>

      {data?.score_breakdown && (
        <div className="score-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">等待评分</span>
            <span className="breakdown-value">{data.score_breakdown.wait_score}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Token评分</span>
            <span className="breakdown-value">{data.score_breakdown.token_score}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">基础评分</span>
            <span className="breakdown-value">{data.score_breakdown.base_score}</span>
          </div>
        </div>
      )}
    </div>
  );
}