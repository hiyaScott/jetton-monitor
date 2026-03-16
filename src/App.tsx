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
  const [dataUrl, setDataUrl] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [latency, setLatency] = useState(0);

  // 获取保存的配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedUrl = await invoke<string>("get_data_url");
        if (savedUrl) {
          setDataUrl(savedUrl);
        } else {
          // 尝试从 localStorage 读取
          const localUrl = localStorage.getItem("jetton_data_url") || "";
          if (localUrl) {
            setDataUrl(localUrl);
            await invoke("save_data_url", { url: localUrl });
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
    if (!dataUrl) return;

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const result = await invoke<CognitiveData>("fetch_cognitive_data", {
        url: dataUrl,
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
  }, [dataUrl]);

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
    if (!dataUrl) return;

    fetchData();
    const interval = setInterval(fetchData, 30000); // 30秒刷新
    return () => clearInterval(interval);
  }, [dataUrl, fetchData]);

  // 保存配置
  const handleSaveConfig = async (url: string) => {
    localStorage.setItem("jetton_data_url", url);
    setDataUrl(url);
    setShowConfig(false);
    await invoke("save_data_url", { url });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">📻</div>
          <div className="title">
            <h1>Jetton Monitor</h1>
            <p>认知负载监控</p>
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
            initialUrl={dataUrl}
            onSave={handleSaveConfig}
            onCancel={dataUrl ? () => setShowConfig(false) : undefined}
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
            </div>

            <TaskQueue tasks={data?.task_queue || []} />

            {lastUpdate && (
              <div className="footer">
                💓 最后更新: {lastUpdate.toLocaleTimeString("zh-CN")} 
                {" · "}
                延迟: {latency}ms
                {data && (
                  <>
                    {" · "}
                    评分: {data.cognitive_score}%
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

export default App;
