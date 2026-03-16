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
            placeholder="https://your-site.com/status-data.json"
            required
          />
          <small>
            你的监控数据 JSON 端点地址
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
        <h4>📖 如何获取数据 URL?</h4>
        <div className="help-options">
          <div className="help-option">
            <strong>GitHub Pages</strong>
            <p>定时脚本推送 JSON 到 GitHub Pages</p>
          </div>
          <div className="help-option">
            <strong>本地服务器</strong>
            <p>python -m http.server 8080</p>
          </div>
          <div className="help-option">
            <strong>OpenClaw 插件</strong>
            <p>内置状态 API 端点（未来支持）</p>
          </div>
        </div>
      </div>
    </div>
  );
}
