# Jetton Monitor

Jetton Monitor 是一个基于 Tauri + React 的桌面应用程序，用于监控 Kimi Claw 的认知负载状态。

## 功能特性

- 📊 **实时监控**: 显示当前认知负载评分、状态和建议
- 📈 **历史趋势**: 5分钟、15分钟、1小时的历史数据图表
- 📋 **任务队列**: 显示活跃会话和任务详情
- 🖥️ **系统托盘**: 支持最小化到系统托盘，点击托盘图标显示窗口
- ⚙️ **配置管理**: 支持配置 Upstash Redis 连接信息
- 🎨 **深色主题**: 现代化的深色 UI 设计

## 技术栈

- **Frontend**: React 19 + TypeScript + Vite
- **Desktop**: Tauri v2 (Rust)
- **图表**: Recharts
- **HTTP**: Tauri HTTP Plugin
- **通知**: Tauri Notification Plugin

## 开发环境

### 前提条件

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- Linux 系统依赖:
  ```bash
  sudo apt-get install libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev librsvg2-dev libgtk-3-dev libsoup-3.0-dev libappindicator3-dev
  ```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建

```bash
npm run tauri build
```

构建后的应用位于 `src-tauri/target/release/` 目录。

## 配置

首次运行时需要配置 Upstash Redis REST API:

1. 登录 [Upstash Console](https://console.upstash.com)
2. 选择或创建一个 Redis 数据库
3. 进入 "REST API" 选项卡
4. 复制 URL 和 Token 到应用配置中

## 项目结构

```
jetton-monitor/
├── src/                    # React 前端代码
│   ├── components/         # React 组件
│   │   ├── ConfigPanel.tsx # 配置面板
│   │   ├── HistoryChart.tsx# 历史图表
│   │   ├── MetricsGrid.tsx # 指标网格
│   │   ├── StatusCard.tsx  # 状态卡片
│   │   └── TaskQueue.tsx   # 任务队列
│   ├── types/              # TypeScript 类型定义
│   ├── App.tsx             # 主应用组件
│   ├── App.css             # 全局样式
│   └── main.tsx            # 入口文件
├── src-tauri/              # Tauri/Rust 后端代码
│   ├── src/
│   │   └── lib.rs          # Rust 主库
│   ├── capabilities/       # 权限配置
│   ├── icons/              # 应用图标
│   └── Cargo.toml          # Rust 依赖
└── package.json            # Node.js 依赖
```

## 系统托盘功能

- **左键点击托盘图标**: 显示/隐藏主窗口
- **显示窗口**: 从托盘菜单显示主窗口
- **隐藏窗口**: 将窗口最小化到托盘
- **刷新数据**: 立即刷新监控数据
- **退出**: 完全退出应用程序

点击窗口关闭按钮会将应用最小化到系统托盘，而不是完全退出。

## 数据来源

应用从 Upstash Redis 获取认知监控数据，数据由 `cognitive_monitor.py` 服务定期更新。

## 许可证

MIT

## 作者

hiyaScott