@echo off
chcp 65001 >nul

:: 创建日志文件
set "LOG_FILE=%USERPROFILE%\jetton-monitor-build\build.log"
set "INSTALL_DIR=%USERPROFILE%\jetton-monitor-build"

:: 确保目录存在
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: 开始记录日志
echo =========================================== > "%LOG_FILE%"
echo   Jetton Monitor 构建日志 - %date% %time% >> "%LOG_FILE%"
echo =========================================== >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

echo.
echo ===========================================
echo   Jetton Monitor 一键构建工具
echo ===========================================
echo.
echo 详细日志会保存在：%LOG_FILE%
echo.

:: 检查管理员权限
echo [步骤 1/8] 检查管理员权限... 
echo [步骤 1/8] 检查管理员权限... >> "%LOG_FILE%"
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 需要管理员权限！
    echo [错误] 需要管理员权限！ >> "%LOG_FILE%"
    echo.
    echo 请按照以下步骤操作：
    echo 1. 找到这个 bat 文件
    echo 2. 鼠标右键点击它
    echo 3. 选择"以管理员身份运行"
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)
echo [成功] 已获取管理员权限
echo [成功] 已获取管理员权限 >> "%LOG_FILE%"
echo.

set "NODE_VERSION=20.11.0"

echo [步骤 2/8] 检查系统要求...
echo [步骤 2/8] 检查系统要求... >> "%LOG_FILE%"

:: 检查磁盘空间
for /f "tokens=3" %%a in ('dir /-c %SystemDrive%\ ^| findstr "可用"') do set "FREE_SPACE=%%a"
echo [信息] 可用磁盘空间: %FREE_SPACE% 字节
echo [信息] 可用磁盘空间: %FREE_SPACE% 字节 >> "%LOG_FILE%"

:: 检查网络连接
echo [步骤 3/8] 检查网络连接...
echo [步骤 3/8] 检查网络连接... >> "%LOG_FILE%"
ping -n 1 github.com >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 无法连接到 GitHub，请检查网络连接
echo [错误] 无法连接到 GitHub，请检查网络连接 >> "%LOG_FILE%"
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)
echo [成功] 网络连接正常
echo [成功] 网络连接正常 >> "%LOG_FILE%"
echo.

echo [步骤 4/8] 安装/检查 Node.js...
echo [步骤 4/8] 安装/检查 Node.js... >> "%LOG_FILE%"
where node >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%a in ('node --version') do set "NODE_CURRENT=%%a"
    echo [成功] Node.js 已安装: %NODE_CURRENT%
    echo [成功] Node.js 已安装: %NODE_CURRENT% >> "%LOG_FILE%"
) else (
    echo [*] 正在下载 Node.js %NODE_VERSION%...
    echo [*] 正在下载 Node.js %NODE_VERSION%... >> "%LOG_FILE%"
    
    curl -L -o "%TEMP%\node-installer.msi" "https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-x64.msi" >> "%LOG_FILE%" 2>&1
    
    if %errorLevel% neq 0 (
        echo [错误] 下载 Node.js 失败
        echo [错误] 下载 Node.js 失败 >> "%LOG_FILE%"
        echo 请检查网络连接
        pause
        exit /b 1
    )
    
    echo [*] 正在安装 Node.js（可能需要几分钟）...
    echo [*] 正在安装 Node.js（可能需要几分钟）... >> "%LOG_FILE%"
    msiexec /i "%TEMP%\node-installer.msi" /quiet /norestart >> "%LOG_FILE%" 2>&1
    
    :: 等待安装完成
    timeout /t 5 /nobreak >nul
    
    :: 刷新环境变量
    call refreshenv.cmd 2>nul || set "PATH=%PATH%;C:\Program Files\nodejs"
    
    :: 验证安装
    where node >nul 2>&1
    if %errorLevel% equ 0 (
        echo [成功] Node.js 安装完成
        echo [成功] Node.js 安装完成 >> "%LOG_FILE%"
    ) else (
        echo [错误] Node.js 安装可能失败，请手动安装后重试
        echo [错误] Node.js 安装可能失败 >> "%LOG_FILE%"
        echo 下载地址: https://nodejs.org/
        pause
        exit /b 1
    )
)
echo.

echo [步骤 5/8] 安装/检查 Rust...
echo [步骤 5/8] 安装/检查 Rust... >> "%LOG_FILE%"
where rustc >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%a in ('rustc --version') do set "RUST_CURRENT=%%a"
    echo [成功] Rust 已安装: %RUST_CURRENT%
    echo [成功] Rust 已安装: %RUST_CURRENT% >> "%LOG_FILE%"
) else (
    echo [*] 正在下载 Rust 安装器...
    echo [*] 正在下载 Rust 安装器... >> "%LOG_FILE%"
    curl -L -o "%TEMP%\rustup-init.exe" "https://win.rustup.rs/x86_64" >> "%LOG_FILE%" 2>&1
    
    if %errorLevel% neq 0 (
        echo [错误] 下载 Rust 失败
        echo [错误] 下载 Rust 失败 >> "%LOG_FILE%"
        pause
        exit /b 1
    )
    
    echo [*] 正在安装 Rust（默认配置，无弹窗）...
    echo [*] 正在安装 Rust... >> "%LOG_FILE%"
    "%TEMP%\rustup-init.exe" -y --default-toolchain stable >> "%LOG_FILE%" 2>&1
    
    :: 设置环境变量
    set "PATH=%PATH%;%USERPROFILE%\.cargo\bin"
    
    echo [成功] Rust 安装完成
    echo [成功] Rust 安装完成 >> "%LOG_FILE%"
)
echo.

echo [步骤 6/8] 安装 WebView2 运行时...
echo [步骤 6/8] 安装 WebView2 运行时... >> "%LOG_FILE%"
reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" >nul 2>&1
if %errorLevel% equ 0 (
    echo [成功] WebView2 已安装
    echo [成功] WebView2 已安装 >> "%LOG_FILE%"
) else (
    echo [*] 正在安装 WebView2...
    echo [*] 正在安装 WebView2... >> "%LOG_FILE%"
    curl -L -o "%TEMP%\webview2.exe" "https://go.microsoft.com/fwlink/p/?LinkId=2124703" >> "%LOG_FILE%" 2>&1
    "%TEMP%\webview2.exe" /silent /install >> "%LOG_FILE%" 2>&1
    echo [成功] WebView2 安装完成
    echo [成功] WebView2 安装完成 >> "%LOG_FILE%"
)
echo.

echo [步骤 7/8] 下载并构建 Jetton Monitor...
echo [步骤 7/8] 下载并构建 Jetton Monitor... >> "%LOG_FILE%"

:: 清理旧目录
if exist "%INSTALL_DIR%\jetton-monitor" (
    echo [*] 清理旧版本...
    echo [*] 清理旧版本... >> "%LOG_FILE%"
    rmdir /s /q "%INSTALL_DIR%\jetton-monitor"
)

:: 创建目录
mkdir "%INSTALL_DIR%\jetton-monitor" 2>nul
cd /d "%INSTALL_DIR%\jetton-monitor"

:: 克隆仓库
echo [*] 正在下载源码...
echo [*] 正在下载源码... >> "%LOG_FILE%"
git clone https://github.com/hiyaScott/jetton-monitor.git . >> "%LOG_FILE%" 2>&1

if %errorLevel% neq 0 (
    echo [*] Git 不可用，使用 curl 下载源码...
    echo [*] Git 不可用，使用 curl 下载... >> "%LOG_FILE%"
    curl -L -o master.zip "https://github.com/hiyaScott/jetton-monitor/archive/refs/heads/master.zip" >> "%LOG_FILE%" 2>&1
    
    :: 解压（使用 PowerShell）
    powershell -Command "Expand-Archive -Path 'master.zip' -DestinationPath '.' -Force" >> "%LOG_FILE%" 2>&1
    xcopy /E /I /Y "jetton-monitor-master\*" "." >> "%LOG_FILE%" 2>&1
    rmdir /s /q "jetton-monitor-master" 2>nul
    del master.zip 2>nul
)

echo [*] 正在安装项目依赖（约 2-5 分钟）...
echo [*] 正在安装项目依赖... >> "%LOG_FILE%"
call npm install >> "%LOG_FILE%" 2>&1

if %errorLevel% neq 0 (
    echo [错误] 安装依赖失败
    echo [错误] 安装依赖失败 >> "%LOG_FILE%"
    echo 请检查日志: %LOG_FILE%
    pause
    exit /b 1
)

echo [*] 正在构建（这将需要 10-20 分钟，请耐心等待）...
echo [*] 正在构建（这将需要 10-20 分钟）... >> "%LOG_FILE%"
echo [*] 构建过程中窗口可能没有响应，这是正常的
echo.
echo 进度提示：
echo - Rust 编译第一次会比较慢（下载依赖 + 编译）
echo - 请保持网络连接
echo - 不要关闭此窗口
echo.

call npm run tauri build >> "%LOG_FILE%" 2>&1

:: 检查构建结果
echo.
echo [步骤 8/8] 检查构建结果...
echo [步骤 8/8] 检查构建结果... >> "%LOG_FILE%"

if exist "src-tauri\target\release\bundle\msi\*.msi" (
    echo.
    echo ===========================================
    echo    [成功] 构建完成！
    echo ===========================================
    echo.
    echo 输出文件:
    
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
    echo 日志文件位置: %LOG_FILE%
    echo.
    echo ===========================================
    
    :: 打开输出目录
    start "" "src-tauri\target\release\bundle"
    
    echo.
    echo 安装说明:
    echo   1. 双击桌面的 Jetton-Monitor-Setup.msi 安装
    echo   2. 或双击 Jetton-Monitor.exe 直接运行
    echo.
    echo 首次使用:
    echo   - 启动后填写"数据 URL"
    echo   - 其他全部自动配置
    echo.
    echo ===========================================
    
) else (
    echo.
    echo [错误] 构建失败！
    echo.
    echo 可能的原因:
    echo   1. 网络连接中断
    echo   2. 磁盘空间不足（需要 10GB+）
    echo   3. 杀毒软件阻止了某些操作
    echo.
    echo 请查看日志文件了解详情:
    echo   %LOG_FILE%
    echo.
    echo 建议:
    echo   1. 关闭杀毒软件后重试
    echo   2. 确保网络稳定
    echo   3. 检查磁盘空间
    echo.
    pause
    exit /b 1
)

echo.
echo 按任意键退出...
pause >nul
