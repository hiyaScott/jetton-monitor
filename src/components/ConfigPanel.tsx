import { useState } from "react";
import "./ConfigPanel.css";

interface ConfigPanelProps {
  initialUrl: string;
  onSave: (url: string) => void;
  onCancel?: () => void;
}

export default function ConfigPanel({
  initialUrl,
  onSave,
  onCancel
}: ConfigPanelProps) {
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSave(url.trim());
    }
  };

  // 从URL自动提取名称示例
  const getSuggestedName = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '').split('.')[0];
    } catch {
      return '';
    }
  };

  const suggestedName = getSuggestedName(url);

  return (
    <div className="config-panel">
      <div className="config-header">
        <div className="config-logo">📻</div>
        <h2>欢迎使用 Jetton Monitor</h2>
        <p>像查看 CPU 一样了解你的 AI 助手状态</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="config-field">
          <label htmlFor="data-url">数据 URL</label>
          <input
            id="data-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://101.126.54.134:18080/status?token=YOUR_TOKEN"
            required
          />
          <small>
            Jetton Monitor 服务器地址（已预填）
            {suggestedName && ` · 将显示为 "${suggestedName}"`}
          </small>
        </div>

        <div className="config-actions">
          <button type="submit" className="btn-primary btn-large">
            🚀 开始监控
          </button>
          {onCancel && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              取消
            </button>
          )}
        </div>
      </form>

      <div className="config-help">
        <h4>📖 配置说明</h4>
        <div className="help-options">
          <div className="help-option">
            <strong>✅ 已配置服务器</strong>
            <p>默认连接到 101.126.54.134:18080，无需额外配置</p>
          </div>
          <div className="help-option">
            <strong>🔧 自定义服务器</strong>
            <p>如果你有其他 Jetton Monitor 实例，可修改 URL</p>
          </div>
          <div className="help-option">
            <strong>🌐 本地部署</strong>
            <p>在本地运行 api_server_v2.py 并使用 localhost 地址</p>
          </div>
        </div>
      </div>
    </div>
  );
}
