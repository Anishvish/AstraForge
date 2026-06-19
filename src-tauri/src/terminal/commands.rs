use std::process::Stdio;
use tauri::State;
use tokio::process::Command;
use tracing::{error, info};

use crate::error::{AppError, AppResult};
use crate::state::AppState;

use super::{CommandOutput, TerminalSession};

#[tauri::command]
pub async fn create_terminal_session(
    state: State<'_, AppState>,
    id: String,
    cwd: Option<String>,
) -> AppResult<()> {
    let working_dir = cwd.unwrap_or_else(|| {
        state
            .get_project_path()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|| ".".to_string())
    });

    let session = TerminalSession::new(id.clone(), working_dir);
    let mut sessions = state.terminal_sessions.lock();
    sessions.insert(id.clone(), session);

    info!("Created terminal session: {}", id);
    Ok(())
}

#[tauri::command]
pub async fn write_to_terminal(
    state: State<'_, AppState>,
    id: String,
    data: String,
) -> AppResult<()> {
    let cwd = {
        let sessions = state.terminal_sessions.lock();
        let session = sessions
            .get(&id)
            .ok_or_else(|| AppError::NotFound(format!("Terminal session not found: {}", id)))?;
        session.cwd.clone()
    };

    // Parse the data as a command and execute it
    let parts: Vec<&str> = data.split_whitespace().collect();
    if parts.is_empty() {
        return Ok(());
    }

    let program = parts[0];
    let args = &parts[1..];

    let shell = if cfg!(target_os = "windows") {
        "cmd"
    } else {
        "sh"
    };
    let shell_arg = if cfg!(target_os = "windows") {
        "/C"
    } else {
        "-c"
    };

    let _output = Command::new(shell)
        .arg(shell_arg)
        .arg(&data)
        .current_dir(&cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await
        .map_err(|e| AppError::Terminal(e.to_string()))?;

    info!(
        "Terminal {} executed command: {} {:?}",
        id, program, args
    );

    Ok(())
}

#[tauri::command]
pub async fn close_terminal(state: State<'_, AppState>, id: String) -> AppResult<()> {
    let mut sessions = state.terminal_sessions.lock();
    sessions.remove(&id);
    info!("Closed terminal session: {}", id);
    Ok(())
}

#[tauri::command]
pub async fn run_command(
    cwd: String,
    command: String,
    args: Vec<String>,
) -> AppResult<CommandOutput> {
    let shell = if cfg!(target_os = "windows") {
        "cmd"
    } else {
        "sh"
    };
    let shell_arg = if cfg!(target_os = "windows") {
        "/C"
    } else {
        "-c"
    };

    // Build the full command string
    let full_command = if args.is_empty() {
        command.clone()
    } else {
        format!("{} {}", command, args.join(" "))
    };

    let output = Command::new(shell)
        .arg(shell_arg)
        .arg(&full_command)
        .current_dir(&cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await
        .map_err(|e| AppError::Terminal(e.to_string()))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let exit_code = output.status.code();
    let success = output.status.success();

    if !success {
        error!(
            "Command failed: {} (exit code: {:?})",
            full_command, exit_code
        );
    }

    Ok(CommandOutput {
        stdout,
        stderr,
        exit_code,
        success,
    })
}
