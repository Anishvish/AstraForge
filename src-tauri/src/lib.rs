pub mod state;
pub mod error;
pub mod database;
pub mod fs;
pub mod git;
pub mod terminal;
pub mod ai;
pub mod agent;
pub mod memory;
pub mod checkpoint;
pub mod settings;
pub mod rag;
pub mod healing;
pub mod review;
pub mod mcp;

use std::path::PathBuf;
use tauri::Manager;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::state::AppState;
use crate::database::init_database;

pub fn run() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting AstraForge backend engine...");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            // Determine database location in app data directory
            let app_data_dir = app.path().app_data_dir().unwrap_or_else(|_| PathBuf::from("."));
            let conn = init_database(&app_data_dir)
                .expect("Failed to initialize SQLite database");

            let app_state = AppState::new(conn);
            app_state.set_app_handle(app.handle().clone());
            app.manage(app_state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // File operations
            crate::fs::commands::read_file_content,
            crate::fs::commands::write_file_content,
            crate::fs::commands::create_file,
            crate::fs::commands::create_directory,
            crate::fs::commands::delete_path,
            crate::fs::commands::rename_path,
            crate::fs::commands::list_directory,
            crate::fs::commands::get_file_tree,
            crate::fs::commands::search_files,

            // Git
            crate::git::commands::git_init,
            crate::git::commands::git_status,
            crate::git::commands::git_diff,
            crate::git::commands::git_stage,
            crate::git::commands::git_unstage,
            crate::git::commands::git_commit,
            crate::git::commands::git_log,
            crate::git::commands::git_branches,
            crate::git::commands::git_checkout,
            crate::git::commands::git_create_branch,
            crate::git::commands::git_current_branch,

            // Terminal
            crate::terminal::commands::create_terminal_session,
            crate::terminal::commands::write_to_terminal,
            crate::terminal::commands::close_terminal,
            crate::terminal::commands::run_command,

            // AI
            crate::ai::commands::ai_chat,
            crate::ai::commands::ai_stream_chat,
            crate::ai::commands::ai_list_models,
            crate::ai::commands::ai_test_connection,
            crate::ai::commands::save_provider_config,
            crate::ai::commands::get_provider_configs,
            crate::ai::commands::save_api_key,

            // Agent
            crate::agent::commands::start_agent_task,
            crate::agent::commands::stop_agent_task,
            crate::agent::commands::get_agent_status,
            crate::agent::commands::get_agent_history,

            // Memory
            crate::memory::commands::store_memory,
            crate::memory::commands::recall_memories,
            crate::memory::commands::delete_memory,
            crate::memory::commands::get_memory_stats,

            // Checkpoints
            crate::checkpoint::commands::create_checkpoint,
            crate::checkpoint::commands::list_checkpoints,
            crate::checkpoint::commands::restore_checkpoint,
            crate::checkpoint::commands::delete_checkpoint,

            // Settings
            crate::settings::commands::get_setting,
            crate::settings::commands::set_setting,
            crate::settings::commands::get_all_settings,

            // RAG Semantic Search
            crate::rag::commands::semantic_search,

            // Self-Healing
            crate::healing::commands::run_self_healing_build,

            // Code Review & Security Audit
            crate::review::commands::review_code,

            // MCP Server support
            crate::mcp::commands::connect_mcp_server,
            crate::mcp::commands::list_mcp_servers,
            crate::mcp::commands::execute_mcp_tool
        ])



        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

