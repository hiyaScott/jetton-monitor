# Jetton Monitor 开发指南

## 快速开始

### 前置要求
- Node.js v18+
- Rust (通过 rustup 安装)
- Linux: 安装 webkit2gtk 依赖

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

## 项目结构

```
src/                    # React 前端代码
├── components/         # UI 组件
├── types/             # TypeScript 类型
├── App.tsx            # 主应用
└── main.tsx           # 入口

src-tauri/             # Rust 后端代码
├── src/
│   ├── lib.rs         # 主库 (系统托盘、数据获取)
│   └── main.rs        # 程序入口
├── capabilities/      # 权限配置
└── Cargo.toml         # Rust 依赖
```

## 关键技术点

### Tauri Commands
前端通过 `invoke` 调用 Rust 函数：
```typescript
import { invoke } from "@tauri-apps/api/core";

const data = await invoke<CognitiveData>("fetch_cognitive_data", {
  url: config.url,
  token: config.token
});
```

### 系统托盘
- 左键点击: 显示/隐藏窗口
- 右键菜单: 显示、隐藏、刷新、退出
- 关闭按钮: 最小化到托盘

### 数据流
1. cognitive_monitor.py (Python) → Upstash Redis
2. Jetton Monitor (Rust) ← HTTP GET /get/cognitive.json
3. React UI ← Tauri invoke

## 开发注意事项

1. **Capability 权限**: 修改 `capabilities/default.json` 添加新权限
2. **类型安全**: 前后端共享类型定义在 `src/types/`
3. **自动刷新**: 前端每 5 秒自动获取数据
4. **配置持久化**: 使用 localStorage 保存配置

## 故障排除

### 构建错误
```bash
# 清除缓存
rm -rf node_modules dist src-tauri/target
npm install
```

### Rust 编译错误
```bash
cd src-tauri
cargo clean
cargo build
```

## 发布流程

1. 更新 `src-tauri/tauri.conf.json` 中的版本号
2. 运行 `npm run tauri build`
3. 找到构建产物在 `src-tauri/target/release/bundle/`
4. 创建 GitHub Release 并上传