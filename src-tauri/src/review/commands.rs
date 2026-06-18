use tauri::State;
use crate::error::AppResult;
use crate::state::AppState;
use super::analyzer::{CodeAnalyzer, ReviewFinding};

#[tauri::command]
pub async fn review_code(
    _state: State<'_, AppState>,
    code: String,
    file_name: String,
) -> AppResult<Vec<ReviewFinding>> {
    CodeAnalyzer::analyze_code(&code, &file_name).await
}
