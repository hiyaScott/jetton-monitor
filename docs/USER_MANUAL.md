# Jetton Monitor 使用说明书

## 快速开始

### 1. 启动应用

双击 `jetton-monitor_0.1.0_amd64.AppImage` 运行。

如果是首次运行，可能需要赋予执行权限：
```bash
chmod +x jetton-monitor_0.1.0_amd64.AppImage
./jetton-monitor_0.1.0_amd64.AppImage
```

### 2. 首次配置（仅需一步）

启动后会看到配置界面：

```
┌────────────────────────────────────┐
│         📻 Jetton Monitor          │
│  像查看 CPU 一样了解你的 AI 助手    │
│                                    │
│  数据 URL                          │
│  ┌────────────────────────────┐    │
│  │ https://your-site.com/...  │    │
│  └────────────────────────────┘    │
│                                    │
│  [      🚀  开始监控      ]        │
│                                    │
└────────────────────────────────────┘
```

**唯一需要填写的配置项：**

| 配置项 | 说明 | 示例 |
|--------|------|------|
| **数据 URL** | 你的监控数据 JSON 地址 | `https://hiyascott.github.io/scott-portfolio/status-monitor/cognitive-data.json` |

其他所有设置都使用智能默认值，无需手动配置。

---

## 配置详解

### 数据 URL 获取方式

#### 方式一：GitHub Pages（推荐）

1. 创建一个定时脚本，将你的监控数据推送到 GitHub 仓库
2. 启用 GitHub Pages
3. 获得类似这样的 URL：
   ```
   https://你的用户名.github.io/仓库名/status-data.json
   ```

#### 方式二：本地 HTTP 服务器

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .

# 然后使用本地地址
http://localhost:8080/status-data.json
```

#### 方式三：自建服务器

任何能返回 JSON 的 HTTP 端点都可以。

### 数据源格式

Jetton Monitor 期望的数据格式：

```json
{
  "cognitive_score": 35,
  "status_code": "idle",
  "status_text": "空闲",
  "suggestion": "可立即响应",
  "active_sessions": 3,
  "pending_count": 1,
  "processing_count": 1,
  "total_tokens": 12500,
  "total_tokens_formatted": "12.5k",
  "estimated_response": 45,
  "estimated_response_formatted": "45s",
  "cpu_percent": 25,
  "memory_percent": 40,
  "task_queue": [
    {
      "label": "SRPG: 计策系统设计",
      "name": "srpg_analysis",
      "status": "processing",
      "tokens": 12500,
      "last_role": "assistant"
    }
  ],
  "history_5m": [
    {"timestamp": "08:20", "score": 30, "pending": 1, "processing": 1, "tokens": 10000},
    {"timestamp": "08:21", "score": 35, "pending": 1, "processing": 1, "tokens": 12500}
  ]
}
```

---

## 功能说明

### 主界面

```
┌────────────────────────────────────────┐
│ 📻 Jetton Monitor        💻 ⚙️ 🔄      │
├────────────────────────────────────────┤
│                                        │
│  [仪表盘区域 - 收音机/数字模式]         │
│                                        │
│  ┌──────┬──────┬──────┬──────┐         │
│  │Sessions│Pending│Processing│Tokens   │
│  │   3    │   1   │    1    │ 12.5k   │
│  └──────┴──────┴──────┴──────┘         │
│                                        │
│  [趋势图区域]                           │
│                                        │
│  📋 当前任务队列                        │
│  💭 SRPG分析      🔄 处理中            │
│                                        │
│  💓 最后更新: 09:05:23 · 延迟: 45ms    │
└────────────────────────────────────────┘
```

### 视图切换

点击顶部的 💻 或 📻 按钮切换两种模式：

| 模式 | 图标 | 特点 |
|------|------|------|
| **收音机** | 📻 | 拟物化仪表盘，指针+刻度 |
| **数字** | 💻 | 极简数字显示，类似CPU-Z |

### 系统托盘

关闭窗口后应用会最小化到系统托盘：

```
🟢 绿色 → 空闲 (0-25%)
🔵 蓝色 → 轻载 (25-45%)
🟡 黄色 → 中等 (45-65%)
🔴 红色 → 高载 (65%+)
⚫ 灰色 → 离线/异常
```

**右键托盘图标菜单：**
- 🖥️ 显示窗口
- 🔄 立即刷新
- ❌ 退出

---

## 智能默认值

首次配置后，以下设置自动生效：

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| 刷新间隔 | 30秒 | 自动获取最新数据 |
| 关闭行为 | 最小化到托盘 | 不占用任务栏 |
| 主题 | 深色 (DeepSpace) | 护眼深色界面 |
| 开机自启 | 关闭 | 需手动开启 |
| 视图模式 | 收音机 | 可切换为数字 |

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + R` | 立即刷新数据 |
| `Ctrl + T` | 切换视图模式 |
| `Ctrl + ,` | 打开设置 |
| `Esc` | 关闭设置/返回主界面 |

---

## 常见问题

### Q: 显示"连接失败"？
A: 检查数据 URL 是否正确，确保能通过浏览器直接访问该地址并返回 JSON。

### Q: 如何修改配置？
A: 点击主界面右上角的 ⚙️ 按钮，重新输入数据 URL。

### Q: 托盘图标不显示？
A: Linux 桌面环境可能需要安装 libappindicator 库：
```bash
sudo apt install libappindicator3-1
```

### Q: 如何彻底退出应用？
A: 右键托盘图标 → 退出，或在设置中取消勾选"关闭时最小化到托盘"。

---

## 技术信息

- **版本**: v0.1.0 MVP
- **体积**: ~8MB
- **框架**: Tauri (Rust) + React
- **更新**: 自动每30秒刷新

---

**Jetton Monitor — 让你的 AI 助手状态一目了然。**
