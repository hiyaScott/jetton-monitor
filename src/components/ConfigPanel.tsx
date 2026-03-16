import { useState } from "react";
import "./ConfigPanel.css";

interface ConfigPanelProps {
  initialUrl: string;
  initialToken: string;
  onSave: (url: string, token: string) => void;
  onCancel: () => void;
}

export default function ConfigPanel({
  initialUrl,
  initialToken,
  onSave,
  onCancel
}: ConfigPanelProps) {
  const [url, setUrl] = useState(initialUrl);
  const [token, setToken] = useState(initialToken);
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && token.trim()) {
      onSave(url.trim(), token.trim());
    }
  };

  return (
    <div className="config-panel">
      <div className="config-header">
        <h2>🔧 配置 Upstash Redis</h2>
        <p>请输入您的 Upstash Redis REST API 凭证</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="config-field">
          <label htmlFor="upstash-url">Redis REST URL</label>
          <input
            id="upstash-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://xxx.upstash.io"
            required
          />
          <small>例如: https://singular-snake-71209.upstash.io</small>
        </div>

        <div className="config-field">
          <label htmlFor="upstash-token">Redis REST Token</label>
          <div className="token-input-wrapper">
            <input
              id="upstash-token"
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="输入您的 REST Token"
              required
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? "🙈" : "👁️"}
            </button>
          </div>
          <small>从 Upstash Console 获取的 REST API Token</small>
        </div>

        <div className="config-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="btn-primary">
            保存并连接
          </button>
        </div>
      </form>

      <div className="config-help">
        <h4>📖 如何获取凭证?</h4>
        <ol>
          <li>登录 Upstash Console (https://console.upstash.com)</li>
          <li>选择或创建一个 Redis 数据库</li>
          <li>进入 "REST API" 选项卡</li>
          <li>复制 URL 和 Token</li>
        </ol>
      </div>
    </div>
  );
}