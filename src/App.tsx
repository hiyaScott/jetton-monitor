import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import StatusCard from "./components/StatusCard";
import TaskQueue from "./components/TaskQueue";
import HistoryChart from "./components/HistoryChart";
import ConfigPanel from "./components/ConfigPanel";
import MetricsGrid from "./components/MetricsGrid";
import type { CognitiveData } from "./types";
import "./App.css";

function App() {
  const [data, setData] = useState<CognitiveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState({ url: "", token: "" });
  const [showConfig, setShowConfig] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [latency, setLatency] = useState(0);

  // 获取保存的配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await invoke<{ url: string; token: string }>("get_config");
        if (savedConfig.url && savedConfig.token) {
          setConfig(savedConfig);
        } else {
          // 尝试从 localStorage 读取
          const localUrl = localStorage.getItem("upstash_url") || "";
          const localToken = localStorage.getItem("upstash_token") || "";
          if (localUrl && localToken) {
            setConfig({ url: localUrl, token: localToken });
            await invoke("save_config", { url: localUrl, token: localToken });
          } else {
            setShowConfig(true);
          }
        }
      } catch (e) {
        console.error("Failed to load config:", e);
        setShowConfig(true);
      }
    };
    loadConfig();
  }, []);

  // 获取数据
  const fetchData = useCallback(async () => {
    if (!config.url || !config.token) return;

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const result = await invoke<CognitiveData>("fetch_cognitive_data", {
        url: config.url,
        token: config.token,
      });
      setData(result);
      setLastUpdate(new Date());
      setLatency(Math.round(performance.now() - startTime));
    } catch (e) {
      console.error("Failed to fetch data:", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [config]);

  // 监听托盘刷新事件
  useEffect(() => {
    const unlisten = listen("tray-refresh", () => {
      fetchData();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [fetchData]);

  // 定期刷新数据
  useEffect(() => {
    if (!config.url || !config.token) return;

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [config, fetchData]);

  // 保存配置
  const handleSaveConfig = async (url: string, token: string) => {
    localStorage.setItem("upstash_url", url);
    localStorage.setItem("upstash_token", token);
    setConfig({ url, token });
    setShowConfig(false);
    await invoke("save_config", { url, token });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">❤️‍🔥</div>
          <div className="title">
            <h1>Jetton Monitor</h1>
            <p>认知负载监控系统</p>
          </div>
        </div>
        <div className="header-right">
          <button
            className="btn-icon"
            onClick={() => setShowConfig(!showConfig)}
            title="配置"
          >
            ⚙️
          </button>
          <button
            className="btn-icon"
            onClick={fetchData}
            disabled={loading}
            title="刷新"
          >
            {loading ? "⏳" : "🔄"}
          </button>
        </div>
      </header>

      <main className="main">
        {showConfig ? (
          <ConfigPanel
            initialUrl={config.url}
            initialToken={config.token}
            onSave={handleSaveConfig}
            onCancel={() => setShowConfig(false)}
          />
        ) : (
          <>
            {error && (
              <div className="error-banner">
                ⚠️ {error}
                <button onClick={fetchData}>重试</button>
              </div>
            )}

            <StatusCard
              data={data}
              loading={loading}
              latency={latency}
            />

            <MetricsGrid data={data} />

            <div className="charts-section">
              <HistoryChart
                data={data?.history_5m || []}
                title="5分钟趋势"
                color="#22c55e"
              />
              <HistoryChart
                data={data?.history_15m || []}
                title="15分钟趋势"
                color="#3b82f6"
              />
            </div>

            <TaskQueue tasks={data?.task_queue || []} />

            {lastUpdate && (
              <div className="footer">
                最后更新: {lastUpdate.toLocaleTimeString("zh-CN")} | 延迟: {latency}ms
                {data && (
                  <>
                    {" "}| 监控运行: {formatDuration(data.monitor_uptime)}
                    {" "}| 算法: {data.algorithm_name} v{data.algorithm_version}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export default App;