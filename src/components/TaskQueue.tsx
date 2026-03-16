import type { TaskInfo } from "../types";
import "./TaskQueue.css";

interface TaskQueueProps {
  tasks: TaskInfo[];
}

export default function TaskQueue({ tasks }: TaskQueueProps) {
  if (tasks.length === 0) {
    return (
      <div className="task-queue">
        <div className="task-queue-header">
          <h3>📋 任务队列</h3>
          <span className="task-count">0</span>
        </div>
        <div className="task-empty">暂无活跃任务</div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status.includes("wait")) return "⏳";
    if (status.includes("processing")) return "🔄";
    if (status.includes("tool")) return "🔧";
    if (status.includes("active")) return "📝";
    return "✅";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "user": return "👤";
      case "assistant": return "🤖";
      case "tool": return "🔧";
      default: return "❓";
    }
  };

  return (
    <div className="task-queue">
      <div className="task-queue-header">
        <h3>📋 任务队列</h3>
        <span className="task-count">{tasks.length}</span>
      </div>

      <div className="task-list">
        {tasks.map((task, index) => (
          <div key={index} className="task-item">
            <div className="task-icon">
              {getStatusIcon(task.status)}
            </div>
            <div className="task-content">
              <div className="task-label">{task.label}</div>
              <div className="task-meta">
                <span className="task-name">{task.name}</span>
                <span className="task-status">{task.status}</span>
              </div>
            </div>
            <div className="task-right">
              <span className="task-role">{getRoleIcon(task.last_role)}</span>
              <span className="task-tokens">{formatTokens(task.tokens)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}