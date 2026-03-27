# Jetton Monitor v0.3.0

Jetton Monitor 是一个基于 Tauri + React 的桌面应用程序，用于监控 Kimi Claw 的认知负载状态。

## 🚀 快速开始（v0.3.0 新版）

v0.3.0 使用 GitHub Pages 数据源，无需配置服务器：

1. 下载 Windows 版本（MSI 安装包或 EXE 单文件版）
2. 双击运行，无需配置
3. 应用自动从 GitHub Pages 获取数据

**下载地址：** https://github.com/hiyaScott/jetton-monitor/releases

## 功能特性

- 📊 **实时监控**: 显示当前认知负载评分、状态和建议
- 📈 **历史趋势**: 5分钟、15分钟、1小时的历史数据图表
- 📋 **任务队列**: 显示活跃会话和任务详情
- 🖥️ **系统托盘**: 支持最小化到系统托盘，点击托盘图标显示窗口
- ⚙️ **零配置**: 开箱即用，无需服务器
- 🎨 **深色主题**: 现代化的深色 UI 设计

## v0.3.0 更新内容

- ✅ 改回 GitHub Pages 数据源（无需开端口）
- ✅ 移除对服务器端口 18080 的依赖
- ✅ 零成本部署，使用 GitHub Pages 托管

## v0.2.0 (已废弃)

v0.2.0 曾尝试使用自托管 API 服务器，但需要开放端口 18080，在无云服务器权限的环境下无法使用。v0.3.0 回退到更可靠的 GitHub Pages 方案。

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

## 自定义数据源（高级）

如需使用自定义数据源，点击应用左下角设置按钮修改 URL：

```
格式: https://your-domain.com/path/to/cognitive-data.json
示例: https://hiyascott.github.io/scott-portfolio/status-monitor/cognitive-data.json
```

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

应用通过 HTTP GET 获取认知监控数据：
- **v0.3.0+**: 默认从 GitHub Pages 获取 `https://hiyascott.github.io/scott-portfolio/status-monitor/cognitive-data.json`
- **延迟**: 约 30 秒到 2 分钟（取决于 GitHub Pages CDN 刷新时间）

## 许可证

MIT

## 作者

hiyaScott