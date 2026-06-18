use tauri::State;
use crate::error::AppResult;
use crate::state::AppState;
use super::retriever::{CodeRetriever, RAGSearchResult};

#[tauri::command]
pub async fn semantic_search(
    state: State<'_, AppState>,
    query: String,
    limit: Option<usize>,
) -> AppResult<Vec<RAGSearchResult>> {
    let lim = limit.unwrap_or(5);
    let path = state
        .get_project_path()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| ".".to_string());
        
    CodeRetriever::retrieve(&path, &query, lim).await
}
