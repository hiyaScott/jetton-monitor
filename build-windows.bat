@echo off
chcp 65001 >nul
echo ========================================
echo   Jetton Monitor 一键构建工具
echo ========================================
echo.

set "INSTALL_DIR=%USERPROFILE%\jetton-monitor-build"
set "NODE_VERSION=20.11.0"

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 需要管理员权限！请右键点击此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo [1/6] 检查系统要求...

:: 检查系统架构
wmic computersystem get TotalPhysicalMemory | findstr /r "[0-9]" >nul
if %errorLevel% neq 0 (
    echo [警告] 无法检测内存，建议至少 4GB 内存
)

echo [2/6] 安装 Node.js...
where node >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%a in ('node --version') do set "NODE_CURRENT=%%a"
    echo [✓] Node.js 已安装: %NODE_CURRENT%
) else (
    echo [*] 正在下载 Node.js %NODE_VERSION%...
    curl -L -o "%TEMP%\node-installer.msi" "https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-x64.msi"
    
    echo [*] 正在安装 Node.js（可能需要几分钟）...
    msiexec /i "%TEMP%\node-installer.msi" /quiet /norestart
    
    :: 刷新环境变量
    call refreshenv.cmd 2>nul || set "PATH=%PATH%;C:\Program Files\nodejs"
    
    echo [✓] Node.js 安装完成
)

echo [3/6] 安装 Rust...
where rustc >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%a in ('rustc --version') do set "RUST_CURRENT=%%a"
    echo [✓] Rust 已安装: %RUST_CURRENT%
) else (
    echo [*] 正在下载 Rust 安装器...
    curl -L -o "%TEMP%\rustup-init.exe" "https://win.rustup.rs/x86_64"
    
    echo [*] 正在安装 Rust（默认配置）...
    "%TEMP%\rustup-init.exe" -y --default-toolchain stable
    
    :: 设置环境变量
    set "PATH=%PATH%;%USERPROFILE%\.cargo\bin"
    
    echo [✓] Rust 安装完成
)

echo [4/6] 安装 WebView2 运行时...
reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] WebView2 已安装
) else (
    echo [*] 正在安装 WebView2...
    curl -L -o "%TEMP%\webview2.exe" "https://go.microsoft.com/fwlink/p/?LinkId=2124703"
    "%TEMP%\webview2.exe" /silent /install
    echo [✓] WebView2 安装完成
)

echo [5/6] 下载并构建 Jetton Monitor...

:: 清理旧目录
if exist "%INSTALL_DIR%" (
    echo [*] 清理旧版本...
    rmdir /s /q "%INSTALL_DIR%"
)

:: 创建目录
mkdir "%INSTALL_DIR%"
cd /d "%INSTALL_DIR%"

:: 克隆仓库
echo [*] 正在下载源码...
git clone https://github.com/hiyaScott/jetton-monitor.git . 2>nul
if %errorLevel% neq 0 (
    echo [*] 使用 curl 下载源码...
    curl -L -o master.zip "https://github.com/hiyaScott/jetton-monitor/archive/refs/heads/master.zip"
    tar -xf master.zip --strip-components=1
)

:: 安装依赖
echo [*] 正在安装项目依赖...
call npm install

:: 构建
echo [*] 正在构建（这可能需要 10-20 分钟，请耐心等待）...
call npm run tauri build

:: 检查构建结果
if exist "src-tauri\target\release\bundle\msi\*.msi" (
    echo.
    echo ========================================
    echo   [✓] 构建成功！
    echo ========================================
    echo.
    echo 输出文件位置:
    for %%f in ("src-tauri\target\release\bundle\msi\*.msi") do (
        echo   - MSI 安装包: %%~dpnxf
        copy "%%f" "%USERPROFILE%\Desktop\Jetton-Monitor-Setup.msi" >nul
        echo   - 已复制到桌面: Jetton-Monitor-Setup.msi
    )
    for %%f in ("src-tauri\target\release\bundle\nsis\*.exe") do (
        echo   - 单文件版: %%~dpnxf
        copy "%%f" "%USERPROFILE%\Desktop\Jetton-Monitor.exe" >nul
        echo   - 已复制到桌面: Jetton-Monitor.exe
    )
    echo.
    echo 安装说明:
    echo   1. 双击 Jetton-Monitor-Setup.msi 安装
    echo   2. 或双击 Jetton-Monitor.exe 直接运行（免安装）
    echo.
    echo 首次使用:
    echo   - 启动后填写"数据 URL"
    echo   - 其他全部自动配置
    echo.
    echo ========================================
    
    :: 打开输出目录
    start "" "src-tauri\target\release\bundle"
) else (
    echo.
    echo [✗] 构建可能失败，请检查上面的错误信息
    pause
    exit /b 1
)

echo.
echo 按任意键退出...
pause >nul
