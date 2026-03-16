use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, Runtime, State, Window, WindowEvent,
};

// 认知监控数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveData {
    pub timestamp: String,
    pub cognitive_score: i32,
    pub status_code: String,
    pub status_text: String,
    pub suggestion: String,
    pub active_sessions: i32,
    pub recent_active_count: i32,
    pub total_tool_calls: i32,
    pub pending_count: i32,
    pub processing_count: i32,
    pub total_tokens: i64,
    pub total_tokens_formatted: String,
    pub estimated_response: i32,
    pub estimated_response_formatted: String,
    pub cpu_percent: f64,
    pub memory_percent: f64,
    pub monitor_uptime: i64,
    pub monitor_cycles: i32,
    pub algorithm_version: String,
    pub algorithm_name: String,
    pub task_queue: Vec<TaskInfo>,
    pub history_5m: Vec<HistoryPoint>,
    pub history_15m: Vec<HistoryPoint>,
    pub history_1h: Vec<HistoryPoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskInfo {
    pub label: String,
    pub name: String,
    pub status: String,
    pub tokens: i32,
    pub last_role: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryPoint {
    pub timestamp: String,
    pub score: i32,
    pub pending: i32,
    pub processing: i32,
    pub tokens: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpstashConfig {
    pub url: String,
    pub token: String,
}

// 应用状态
pub struct AppState {
    pub config: Arc<Mutex<UpstashConfig>>,
    pub last_data: Arc<Mutex<Option<CognitiveData>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            config: Arc::new(Mutex::new(UpstashConfig {
                url: String::new(),
                token: String::new(),
            })),
            last_data: Arc::new(Mutex::new(None)),
        }
    }
}

// 获取认知数据
#[tauri::command]
async fn fetch_cognitive_data(
    state: State<'_, AppState>,
    url: String,
    token: String,
) -> Result<CognitiveData, String> {
    // 更新配置
    {
        let mut config = state.config.lock().map_err(|e| e.to_string())?;
        config.url = url.clone();
        config.token = token.clone();
    }

    // 构建请求
    let client = reqwest::Client::new();
    let request_url = format!("{}/get/cognitive.json", url);

    let response = client
        .get(&request_url)
        .header("Authorization", format!("Bearer {}", token))
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let data: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("JSON parse failed: {}", e))?;

    // 解析数据
    let result = data
        .get("result")
        .and_then(|r| r.as_str())
        .ok_or("No result field")?;

    let cognitive_data: CognitiveData =
        serde_json::from_str(result).map_err(|e| format!("Parse cognitive data failed: {}", e))?;

    // 保存数据
    {
        let mut last_data = state.last_data.lock().map_err(|e| e.to_string())?;
        *last_data = Some(cognitive_data.clone());
    }

    Ok(cognitive_data)
}

// 获取保存的配置
#[tauri::command]
fn get_config(state: State<'_, AppState>) -> Result<UpstashConfig, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    Ok(UpstashConfig {
        url: config.url.clone(),
        token: config.token.clone(),
    })
}

// 保存配置
#[tauri::command]
fn save_config(state: State<'_, AppState>, url: String, token: String) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    config.url = url;
    config.token = token;
    Ok(())
}

// 显示窗口
fn show_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

// 隐藏窗口
fn hide_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
}

// 创建系统托盘
fn create_tray<R: Runtime>(app: &AppHandle<R>) -> Result<(), Box<dyn std::error::Error>> {
    let show_i = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
    let hide_i = MenuItem::with_id(app, "hide", "隐藏窗口", true, None::<&str>)?;
    let refresh_i = MenuItem::with_id(app, "refresh", "刷新数据", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_i, &hide_i, &refresh_i, &quit_i])?;

    let tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => show_window(app),
            "hide" => hide_window(app),
            "refresh" => {
                let _ = app.emit("tray-refresh", ());
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                show_window(app);
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            fetch_cognitive_data,
            get_config,
            save_config
        ])
        .setup(|app| {
            // 创建系统托盘
            create_tray(app.app_handle())?;

            // 获取主窗口并设置关闭行为为隐藏
            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        // 阻止默认关闭行为，改为隐藏窗口
                        api.prevent_close();
                        let _ = window_clone.hide();
                    }
                });

                // 延迟显示窗口
                let window_clone2 = window.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(500));
                    let _ = window_clone2.show();
                    let _ = window_clone2.set_focus();
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}