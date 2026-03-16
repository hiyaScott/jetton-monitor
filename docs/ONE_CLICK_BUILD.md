# Jetton Monitor 一键构建指南

## 使用说明

我们提供了两个一键脚本，自动完成所有环境安装和构建。

---

## Windows 用户

### 下载
[build-windows.bat](https://github.com/hiyaScott/jetton-monitor/raw/master/build-windows.bat)

### 使用方法
1. **右键点击** `build-windows.bat`
2. 选择 **"以管理员身份运行"**
3. 等待 15-30 分钟（自动安装 Node.js、Rust、下载源码、构建）
4. 构建完成后，安装包会自动复制到**桌面**

### 输出文件
- `Jetton-Monitor-Setup.msi` - 标准安装包（推荐）
- `Jetton-Monitor.exe` - 单文件版（免安装）

### 系统要求
- Windows 10/11 64位
- 至少 4GB 内存
- 10GB 磁盘空间
- 网络连接

---

## macOS 用户

### 下载
[build-macos.sh](https://github.com/hiyaScott/jetton-monitor/raw/master/build-macos.sh)

### 使用方法
1. 打开 **终端** (Terminal)
2. 输入以下命令：
   ```bash
   cd ~/Downloads
   curl -O https://github.com/hiyaScott/jetton-monitor/raw/master/build-macos.sh
   bash build-macos.sh
   ```
3. 如果是第一次运行，可能会提示安装 **Xcode Command Line Tools**，点击安装
4. 等待 15-30 分钟
5. 构建完成后，DMG 文件会自动复制到**桌面**

### 输出文件
- `Jetton-Monitor.dmg` - macOS 安装镜像

### 系统要求
- macOS 11+ (Big Sur 或更新)
- Apple Silicon (M1/M2/M3) 或 Intel Mac
- 至少 4GB 内存
- 10GB 磁盘空间
- 网络连接

---

## 常见问题

### Q: 构建需要多长时间？
A: 首次构建约 **15-30 分钟**，取决于网络速度和电脑性能。后续更新会快很多。

### Q: 可以重复运行吗？
A: 可以。脚本会自动清理旧版本并重新构建。

### Q: 构建失败怎么办？
A: 请检查：
1. 网络连接是否正常
2. 磁盘空间是否充足（需要 10GB+）
3. 关闭杀毒软件（可能误报）
4. 重新运行脚本

### Q: 如何更新到新版本？
A: 重新运行一键脚本即可获取最新版本。

---

## 备选方案：GitHub Actions

如果不方便本地构建，也可以使用 GitHub 自动构建：

1. Fork 仓库到你的 GitHub 账号
2. 在 GitHub 页面点击 **Actions** 标签
3. 启用 workflows
4. 每次推送代码会自动构建所有平台版本
5. 在 **Releases** 页面下载构建结果
