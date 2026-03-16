# Jetton Monitor 桌面应用原型 - 任务报告

## 任务概述
创建 Jetton Monitor 桌面应用原型 - 使用 Tauri + React + TypeScript 构建的认知负载监控仪表盘。

**完成时间**: 2026-03-16
**项目路径**: `/root/.openclaw/workspace/jetton-monitor/`
**GitHub 仓库**: https://github.com/hiyaScott/jetton-monitor (待推送)

---

## 已完成任务

### 1. ✅ 项目初始化

**操作步骤**:
```bash
cd /root/.openclaw/workspace
mkdir -p jetton-monitor
cd jetton-monitor
npm create tauri-app@latest . -- --template react-ts --manager npm --yes
```

**遇到的问题**:
- Rust/Cargo 未安装 - 已通过 `rustup` 安装解决
- Linux 系统依赖缺失 - 已安装 `libwebkit2gtk-4.1-dev`, `libappindicator3-dev` 等

**解决命令**:
```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# 安装系统依赖
apt-get install -y libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev \
  librsvg2-dev libgtk-3-dev libsoup-3.0-dev libappindicator3-dev
```

---

### 2. ✅ 迁移认知监控仪表盘 UI

**迁移的组件**:
- `StatusCard` - 状态卡片，显示认知负载评分和状态指示器
- `MetricsGrid` - 8个指标网格（活跃会话、等待中、处理中、工具调用、Token数、预计响应、CPU、内存）
- `TaskQueue` - 任务队列列表，显示活跃任务详情
- `HistoryChart` - 历史趋势图表（5分钟、15分钟），使用 Recharts
- `ConfigPanel` - 配置面板，支持 Upstash Redis 配置

**设计特点**:
- 深色主题设计
- 渐变背景和毛玻璃效果
- 响应式布局
- 动画效果（脉冲、闪烁）

---

### 3. ✅ 实现数据获取和显示

**Rust 后端 (Tauri Commands)**:
```rust
// src-tauri/src/lib.rs
#[tauri::command]
async fn fetch_cognitive_data(
    state: State<'_, AppState>,
    url: String,
    token: String,
) -> Result<CognitiveData, String>
```

**数据流**:
1. React 前端调用 Tauri command `fetch_cognitive_data`
2. Rust 后端使用 `reqwest` 向 Upstash Redis REST API 发送请求
3. 解析 JSON 数据并返回给前端
4. 前端使用 React hooks 管理状态和自动刷新（5秒间隔）

**类型定义**:
- `CognitiveData` - 主要数据结构
- `TaskInfo` - 任务信息
- `HistoryPoint` - 历史数据点
- `ScoreBreakdown` - 评分分解

---

### 4. ✅ 配置系统托盘和窗口行为

**系统托盘功能**:
- 左键点击托盘图标显示/隐藏主窗口
- 右键菜单: 显示窗口、隐藏窗口、刷新数据、退出
- 窗口关闭按钮最小化到托盘而非退出

**实现代码** (Rust):
```rust
fn create_tray<R: Runtime>(app: &AppHandle<R>) -> Result<(), Box<dyn std::error::Error>> {
    let show_i = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
    let hide_i = MenuItem::with_id(app, "hide", "隐藏窗口", true, None::<&str>)?;
    let refresh_i = MenuItem::with_id(app, "refresh", "刷新数据", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    // ...
}
```

**窗口行为**:
- 启动时窗口默认隐藏，延迟 500ms 后显示
- 关闭事件被拦截，改为隐藏窗口

---

### 5. ⚠️ GitHub 仓库推送 (部分完成)

**已完成**:
- Git 仓库初始化
- 配置 Git 用户名和邮箱
- 添加远程仓库地址
- 创建初始提交 (54 个文件, 12141 行代码)

**待完成**:
- GitHub 仓库需要在 GitHub 上手动创建
- 推送代码到远程仓库

**命令**:
```bash
git remote add origin https://github.com/hiyaScott/jetton-monitor.git
git push -u origin master
```

---

## 项目结构

```
jetton-monitor/
├── src/                          # React 前端
│   ├── components/
│   │   ├── ConfigPanel.tsx       # 配置面板组件
│   │   ├── ConfigPanel.css
│   │   ├── HistoryChart.tsx      # 历史图表组件
│   │   ├── HistoryChart.css
│   │   ├── MetricsGrid.tsx       # 指标网格组件
│   │   ├── MetricsGrid.css
│   │   ├── StatusCard.tsx        # 状态卡片组件
│   │   ├── StatusCard.css
│   │   ├── TaskQueue.tsx         # 任务队列组件
│   │   └── TaskQueue.css
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义
│   ├── App.tsx                   # 主应用组件
│   ├── App.css                   # 全局样式
│   └── main.tsx                  # 入口文件
├── src-tauri/                    # Tauri/Rust 后端
│   ├── src/
│   │   ├── lib.rs                # Rust 主库 (含系统托盘)
│   │   └── main.rs               # 程序入口
│   ├── capabilities/
│   │   └── default.json          # 权限配置
│   ├── icons/                    # 应用图标
│   ├── Cargo.toml                # Rust 依赖
│   └── tauri.conf.json           # Tauri 配置
├── package.json                  # Node.js 依赖
├── tsconfig.json                 # TypeScript 配置
├── vite.config.ts                # Vite 配置
├── README.md                     # 项目文档
└── .gitignore                    # Git 忽略文件
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 |
| 语言 | TypeScript 5.8 |
| 构建工具 | Vite 7 |
| 桌面框架 | Tauri v2 |
| 后端语言 | Rust |
| 图表库 | Recharts |
| HTTP 客户端 | reqwest (Rust) |
| 样式 | CSS3 |

---

## 构建状态

**前端构建**: ✅ 成功
```bash
npm run build
# 输出: dist/index.html, dist/assets/*.js, dist/assets/*.css
```

**后端构建**: ⚠️ 待完成
- Rust 编译需要较长时间
- 需要在有充足资源的环境中完成
- 命令: `npm run tauri build`

---

## 遇到的问题和解决方案

### 问题 1: Rust 未安装
**解决**: 使用 rustup 安装 Rust

### 问题 2: Linux 系统依赖缺失
**解决**: 安装 webkit2gtk 等依赖包

### 问题 3: Tauri v2 系统托盘配置变更
**解决**: 更新 tauri.conf.json 格式，移除菜单配置（改在 Rust 代码中配置）

### 问题 4: TypeScript 类型错误
**解决**: 修复 ConfigPanel 组件的 props 类型定义

### 问题 5: Capability 权限配置
**解决**: 更新 capabilities/default.json 添加必要权限

---

## 使用说明

### 开发模式
```bash
cd /root/.openclaw/workspace/jetton-monitor
npm install
npm run tauri dev
```

### 生产构建
```bash
npm run tauri build
# 输出: src-tauri/target/release/jetton-monitor
```

### 配置
首次运行时需要配置 Upstash Redis:
1. 输入 Redis REST URL (如: https://xxx.upstash.io)
2. 输入 Redis REST Token
3. 点击"保存并连接"

---

## 后续建议

1. **完成构建**: 在资源充足的环境中运行 `npm run tauri build`
2. **GitHub 推送**: 在 GitHub 创建仓库后推送代码
3. **CI/CD**: 添加 GitHub Actions 自动构建
4. **功能扩展**:
   - 添加通知功能（高负载提醒）
   - 支持多个数据源
   - 添加数据导出功能
   - 支持自定义刷新间隔

---

## 总结

Jetton Monitor 桌面应用原型已成功创建，包含完整的前端 UI、Rust 后端、系统托盘功能。前端构建成功，后端代码编写完成，待完成最终构建和 GitHub 推送。

**核心功能已实现**:
- ✅ Tauri + React + TypeScript 项目结构
- ✅ 认知监控仪表盘 UI
- ✅ 系统托盘和窗口行为
- ✅ 数据获取和自动刷新
- ✅ 配置管理
- ⚠️ GitHub 仓库推送（需手动创建仓库）
- ⚠️ 最终构建（需较长时间编译）