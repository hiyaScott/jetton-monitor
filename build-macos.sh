#!/bin/bash

# Jetton Monitor 一键构建工具 (macOS)
# 使用方法: 打开终端，运行: bash build-macos.sh

set -e  # 遇到错误立即退出

echo "========================================"
echo "   Jetton Monitor 一键构建工具"
echo "========================================"
echo ""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 安装目录
INSTALL_DIR="$HOME/jetton-monitor-build"

# 检查是否为 Apple Silicon 或 Intel
ARCH=$(uname -m)
echo "[1/6] 检测系统架构: $ARCH"

if [[ "$ARCH" == "arm64" ]]; then
    echo "   [✓] Apple Silicon (M1/M2/M3)"
    RUST_TARGET="aarch64-apple-darwin"
elif [[ "$ARCH" == "x86_64" ]]; then
    echo "   [✓] Intel Mac"
    RUST_TARGET="x86_64-apple-darwin"
else
    echo -e "${RED}[错误] 不支持的架构: $ARCH${NC}"
    exit 1
fi

# 检查 Xcode Command Line Tools
echo "[2/6] 检查 Xcode Command Line Tools..."
if ! xcode-select -p > /dev/null 2>&1; then
    echo -e "${YELLOW}[*] 需要安装 Xcode Command Line Tools${NC}"
    echo "   正在安装，请按提示操作..."
    xcode-select --install
    echo -e "${RED}[错误] 请先完成 Xcode Command Line Tools 安装，然后重新运行此脚本${NC}"
    exit 1
else
    echo "   [✓] Xcode Command Line Tools 已安装"
fi

# 检查/安装 Homebrew
echo "[3/6] 检查 Homebrew..."
if ! command -v brew > /dev/null 2>&1; then
    echo -e "${YELLOW}[*] 正在安装 Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # 添加 Homebrew 到 PATH
    if [[ "$ARCH" == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    else
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.bash_profile
        eval "$(/usr/local/bin/brew shellenv)"
    fi
    echo "   [✓] Homebrew 安装完成"
else
    echo "   [✓] Homebrew 已安装"
fi

# 检查/安装 Node.js
echo "[4/6] 检查 Node.js..."
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "   [✓] Node.js 已安装: $NODE_VERSION"
else
    echo -e "${YELLOW}[*] 正在安装 Node.js...${NC}"
    brew install node
    echo "   [✓] Node.js 安装完成"
fi

# 检查/安装 Rust
echo "[5/6] 检查 Rust..."
if command -v rustc > /dev/null 2>&1; then
    RUST_VERSION=$(rustc --version)
    echo "   [✓] Rust 已安装: $RUST_VERSION"
else
    echo -e "${YELLOW}[*] 正在安装 Rust...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    echo "   [✓] Rust 安装完成"
fi

# 下载并构建
echo "[6/6] 下载并构建 Jetton Monitor..."

# 清理旧目录
if [ -d "$INSTALL_DIR" ]; then
    echo "   [*] 清理旧版本..."
    rm -rf "$INSTALL_DIR"
fi

# 创建目录
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# 克隆仓库
echo "   [*] 正在下载源码..."
if command -v git > /dev/null 2>&1; then
    git clone https://github.com/hiyaScott/jetton-monitor.git . --depth=1
else
    curl -L -o master.zip "https://github.com/hiyaScott/jetton-monitor/archive/refs/heads/master.zip"
    unzip -q master.zip
    mv jetton-monitor-master/* .
    rm -rf jetton-monitor-master master.zip
fi

# 安装依赖
echo "   [*] 正在安装项目依赖..."
npm install

# 构建
echo "   [*] 正在构建（这可能需要 10-20 分钟，请耐心等待）..."
npm run tauri build -- --target "$RUST_TARGET"

# 检查构建结果
DMG_PATH="src-tauri/target/release/bundle/dmg/*.dmg"
if ls $DMG_PATH 1> /dev/null 2>&1; then
    echo ""
    echo "========================================"
    echo -e "   ${GREEN}[✓] 构建成功！${NC}"
    echo "========================================"
    echo ""
    
    for dmg in src-tauri/target/release/bundle/dmg/*.dmg; do
        echo "输出文件:"
        echo "  - DMG 镜像: $dmg"
        
        # 复制到桌面
        cp "$dmg" "$HOME/Desktop/Jetton-Monitor.dmg"
        echo "  - 已复制到桌面: ~/Desktop/Jetton-Monitor.dmg"
    done
    
    echo ""
    echo "安装说明:"
    echo "  1. 双击桌面上的 Jetton-Monitor.dmg"
    echo "  2. 将 Jetton Monitor 拖拽到 Applications 文件夹"
    echo ""
    echo "首次使用:"
    echo "  - 启动后填写\"数据 URL\""
    echo "  - 其他全部自动配置"
    echo ""
    echo "========================================"
    
    # 打开 Finder 显示文件
    open "$HOME/Desktop"
else
    echo -e "${RED}[✗] 构建可能失败，请检查上面的错误信息${NC}"
    exit 1
fi

echo ""
read -p "按回车键退出..."
