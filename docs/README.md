# Jetton Monitor 项目简报

## 一句话介绍
像查看 CPU 占用一样，实时了解你的 AI 助手工作状态。

---

## 解决的问题

| 痛点 | 场景 |
|------|------|
| ❓ 不知道AI是否在忙 | 发送消息后漫长等待，不确定是网络问题还是AI在处理 |
| ❓ 不知道要等多久 | 无法预估响应时间，影响工作安排 |
| ❓ 不知道在忙什么 | 多个任务并行时，不清楚当前优先级 |
| ❓ 跨平台状态分散 | 在飞书、Telegram、Discord之间切换，状态不统一 |

---

## 解决方案

Jetton Monitor = **常驻系统托盘** + **实时认知仪表盘**

### 核心特性

```
🟢 托盘图标颜色 = 实时状态
   绿色(0-25%)  → 立即响应
   蓝色(25-45%) → 30秒内回复  
   黄色(45-65%) → 建议简单任务
   红色(65%+)   → 建议等待

📊 仪表盘详情
   • 认知评分 (0-100%)
   • 活跃会话数
   • 待处理/处理中任务
   • Token负载
   • 预估响应时间
   • 任务队列详情
```

---

## 极简使用流程

### 1. 下载安装
下载对应平台的 `.exe` / `.dmg` / `.AppImage` 文件

### 2. 填入 URL（唯一一步）
```
数据 URL: https://your-site.com/status-data.json

[🚀 开始监控]
```
其他全部自动配置 ✅

### 3. 完成
托盘图标实时显示状态，点击打开仪表盘

---

## 架构说明

```
┌─────────────────┐      HTTP GET       ┌─────────────────┐
│  Jetton Monitor │  ───────────────►  │  网页仪表盘      │
│  (桌面客户端)    │  ◄───JSON数据────  │  (数据源/API)   │
│                 │                    │  保持现状不动   │
└─────────────────┘                    └─────────────────┘
```

**桌面应用 = 纯客户端**，只负责展示和交互  
**网页端 = 数据源**，暴露 JSON 端点即可

---

## 技术实现

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React + TypeScript | 仪表盘UI |
| 后端 | Tauri (Rust) | 系统托盘、窗口管理、配置存储 |
| 数据 | HTTP GET JSON | 支持任意数据源 |
| 打包 | Tauri Builder | 单文件可执行程序 |

### 体积对比

| 方案 | 体积 | 启动速度 |
|------|------|----------|
| Electron | ~150MB | 慢 |
| **Tauri** | **~8MB** | **快** |
| Flutter | ~20MB | 中等 |

---

## 使用方式

### 1. 下载安装
下载对应平台的 `.exe` / `.dmg` / `.AppImage` 文件

### 2. 配置数据源
```
名称: Scott's Jetton
URL: https://your-domain.com/status-data.json
刷新间隔: 30秒
```

### 3. 开始使用
- 托盘图标实时显示状态
- 点击打开仪表盘
- 右键访问设置

---

## 数据源支持

任何符合以下格式的 JSON 端点：

```json
{
  "cognitive_score": 35,
  "active_sessions": 3,
  "pending_count": 1,
  "processing_count": 1,
  "task_queue": [...],
  "history_5m": [...]
}
```

**支持方式：**
- ✅ GitHub Pages 定时推送（推荐）
- ✅ 本地 HTTP 服务器
- ✅ OpenClaw 内置 API（未来）

**需要的数据源格式：**
```json
{
  "cognitive_score": 35,
  "active_sessions": 3,
  "pending_count": 1,
  "processing_count": 1,
  "task_queue": [...]
}
```

---

## Roadmap

```
MVP (Week 1)
├── ✅ 实时监控仪表盘
├── ✅ 系统托盘常驻
├── ✅ 基础配置系统
└── ✅ Windows/Mac/Linux 打包

v1.1 (Week 2)
├── 多实例管理
├── 桌面通知
├── 全局快捷键
└── 主题切换

v1.2 (Week 3)
├── 数据导出
├── 窗口置顶
├── 自动更新
└── OpenClaw 插件
```

---

## 项目信息

| 属性 | 内容 |
|------|------|
| **仓库** | github.com/hiyaScott/jetton-monitor |
| **设计案** | /docs/DESIGN.md |
| **演示文稿** | /docs/pitch-deck.html |
| **许可证** | MIT |

---

**Jetton Monitor — 让你的 AI 助手状态一目了然。**
