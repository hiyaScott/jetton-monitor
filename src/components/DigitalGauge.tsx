import { useMemo } from "react";
import type { CognitiveData } from "../types";
import "./DigitalGauge.css";

interface DigitalGaugeProps {
  data: CognitiveData | null;
  loading: boolean;
}

export default function DigitalGauge({ data, loading }: DigitalGaugeProps) {
  const { score, statusText, statusClass } = useMemo(() => {
    if (!data) {
      return {
        score: 0,
        statusText: "--",
        statusClass: "offline",
      };
    }

    const score = data.cognitive_score;
    let statusText = "空闲";
    let statusClass = "idle";

    if (score >= 65) {
      statusText = "高负载";
      statusClass = "high";
    } else if (score >= 45) {
      statusText = "中等";
      statusClass = "medium";
    } else if (score >= 25) {
      statusText = "轻载";
      statusClass = "low";
    }

    return { score, statusText, statusClass };
  }, [data]);

  const connectionStatus = useMemo(() => {
    if (loading) return { text: "连接中...", className: "connecting" };
    if (!data) return { text: "离线", className: "offline" };
    return { text: "在线", className: "online" };
  }, [data, loading]);

  return (
    <div className={`digital-gauge ${statusClass}`}>
      <div className="digital-header">
        <span className="digital-icon">💻</span>
        <span className="digital-title">数字监控</span>
        <span className={`digital-connection ${connectionStatus.className}`}>
          {connectionStatus.text}
        </span>
      </div>

      <div className="digital-main">
        <div className={`digital-score ${statusClass}`}>
          <span className="digital-number">{loading ? "--" : score}</span>
          <span className="digital-percent">%</span>
        </div>
        <div className={`digital-status ${statusClass}`}>{statusText}</div>
      </div>

      {data && (
        <div className="digital-suggestion">
          💡 {data.suggestion}
        </div>
      )}
    </div>
  );
}
