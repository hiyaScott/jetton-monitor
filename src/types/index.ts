export interface TaskInfo {
  label: string;
  name: string;
  status: string;
  tokens: number;
  last_role: string;
}

export interface HistoryPoint {
  timestamp: string;
  score: number;
  pending: number;
  processing: number;
  tokens: number;
}

export interface ScoreBreakdown {
  wait_score: number;
  token_score: number;
  base_score: number;
  active_sessions: number;
  recent_active: number;
  tool_calls: number;
  pending: number;
  processing: number;
  estimated_response: number;
}

export interface CognitiveData {
  timestamp: string;
  cognitive_score: number;
  score_breakdown?: ScoreBreakdown;
  status_code: string;
  status_text: string;
  suggestion: string;
  active_sessions: number;
  recent_active_count: number;
  total_tool_calls: number;
  pending_count: number;
  processing_count: number;
  total_tokens: number;
  total_tokens_formatted: string;
  estimated_response: number;
  estimated_response_formatted: string;
  task_queue: TaskInfo[];
  cpu_percent: number;
  memory_percent: number;
  monitor_uptime: number;
  monitor_cycles: number;
  algorithm_version: string;
  algorithm_name: string;
  history_5m: HistoryPoint[];
  history_15m: HistoryPoint[];
  history_1h: HistoryPoint[];
}