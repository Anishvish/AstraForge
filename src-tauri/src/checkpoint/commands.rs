use tauri::State;
use crate::error::AppResult;
use crate::state::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Checkpoint {
    pub id: String,
    pub project_path: String,
    pub description: String,
    pub commit_hash: Option<String>,
    pub created_at: String,
}

#[tauri::command]
pub async fn create_checkpoint(
    state: State<'_, AppState>,
    project_path: String,
    description: Option<String>,
) -> AppResult<String> {
    let id = uuid::Uuid::new_v4().to_string();
    let desc = description.unwrap_or_default();
    
    // We can run a git commit or copy files, let's keep it simple: store in db and link git if possible.
    let db = state.db.lock();
    db.execute(
        "INSERT INTO checkpoints (id, project_path, description, created_at) VALUES (?, ?, ?, datetime('now'))",
        (&id, &project_path, &desc),
    )?;
    Ok(id)
}

#[tauri::command]
pub async fn list_checkpoints(
    state: State<'_, AppState>,
    project_path: String,
) -> AppResult<Vec<Checkpoint>> {
    let db = state.db.lock();
    let mut stmt = db.prepare("SELECT id, project_path, description, commit_hash, created_at FROM checkpoints WHERE project_path = ? ORDER BY created_at DESC")?;
    
    let rows = stmt.query_map([project_path], |row| {
        Ok(Checkpoint {
            id: row.get(0)?,
            project_path: row.get(1)?,
            description: row.get(2)?,
            commit_hash: row.get(3)?,
            created_at: row.get(4)?,
        })
    })?;
    
    let mut list = Vec::new();
    for row in rows {
        if let Ok(cp) = row {
            list.push(cp);
        }
    }
    Ok(list)
}

#[tauri::command]
pub async fn restore_checkpoint(
    _state: State<'_, AppState>,
    _checkpoint_id: String,
) -> AppResult<()> {
    // A production checkpoint restore would restore files or perform a git checkout/reset.
    Ok(())
}

#[tauri::command]
pub async fn delete_checkpoint(state: State<'_, AppState>, checkpoint_id: String) -> AppResult<()> {
    let db = state.db.lock();
    db.execute("DELETE FROM checkpoints WHERE id = ?", [checkpoint_id])?;
    Ok(())
}
