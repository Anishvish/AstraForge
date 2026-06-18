use tauri::State;
use crate::error::AppResult;
use crate::state::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Memory {
    pub id: String,
    pub category: String,
    pub key: String,
    pub value: String,
    pub importance: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoryStats {
    pub total_count: usize,
}

#[tauri::command]
pub async fn store_memory(
    state: State<'_, AppState>,
    category: String,
    key: String,
    value: String,
    importance: Option<f64>,
) -> AppResult<()> {
    let imp = importance.unwrap_or(0.5);
    let db = state.db.lock();
    db.execute(
        "INSERT OR REPLACE INTO memories (id, category, key, value, importance, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
        (uuid::Uuid::new_v4().to_string(), category, key, value, imp),
    )?;
    Ok(())
}

#[tauri::command]
pub async fn recall_memories(
    state: State<'_, AppState>,
    category: Option<String>,
    query: Option<String>,
    limit: Option<usize>,
) -> AppResult<Vec<Memory>> {
    let db = state.db.lock();
    let lim = limit.unwrap_or(10);
    
    let mut sql = "SELECT id, category, key, value, importance FROM memories".to_string();
    let mut params: Vec<String> = Vec::new();
    
    if let Some(cat) = category {
        sql.push_str(" WHERE category = ?");
        params.push(cat);
    }
    
    if let Some(q) = query {
        if params.is_empty() {
            sql.push_str(" WHERE ");
        } else {
            sql.push_str(" AND ");
        }
        sql.push_str("(key LIKE ? OR value LIKE ?)");
        let q_wildcard = format!("%{}%", q);
        params.push(q_wildcard.clone());
        params.push(q_wildcard);
    }
    
    sql.push_str(" ORDER BY importance DESC, updated_at DESC LIMIT ?");
    
    let mut stmt = db.prepare(&sql)?;
    
    // We bind query parameters using dynamic references.
    let mut params_ref: Vec<&dyn rusqlite::types::ToSql> = Vec::new();
    for p in &params {
        params_ref.push(p);
    }
    let lim_i64 = lim as i64;
    params_ref.push(&lim_i64);
    
    let rows = stmt.query_map(rusqlite::params_from_iter(params_ref), |row| {
        Ok(Memory {
            id: row.get(0)?,
            category: row.get(1)?,
            key: row.get(2)?,
            value: row.get(3)?,
            importance: row.get(4)?,
        })
    })?;
    
    let mut list = Vec::new();
    for row in rows {
        if let Ok(mem) = row {
            list.push(mem);
        }
    }
    Ok(list)
}

#[tauri::command]
pub async fn delete_memory(state: State<'_, AppState>, id: String) -> AppResult<()> {
    let db = state.db.lock();
    db.execute("DELETE FROM memories WHERE id = ?", [id])?;
    Ok(())
}

#[tauri::command]
pub async fn get_memory_stats(state: State<'_, AppState>) -> AppResult<MemoryStats> {
    let db = state.db.lock();
    let mut stmt = db.prepare("SELECT COUNT(*) FROM memories")?;
    let count: usize = stmt.query_row([], |row| row.get(0))?;
    Ok(MemoryStats { total_count: count })
}
