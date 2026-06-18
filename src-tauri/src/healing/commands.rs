use tauri::State;
use crate::error::AppResult;
use crate::state::AppState;
use super::engine::{SelfHealingEngine, HealingResult};

#[tauri::command]
pub async fn run_self_healing_build(
    state: State<'_, AppState>,
    command: String,
    args: Vec<String>,
) -> AppResult<HealingResult> {
    let cwd = state
        .get_project_path()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| ".".to_string());
        
    SelfHealingEngine::attempt_heal(&cwd, &command, args).await
}
