use tauri::State;
use crate::error::AppResult;
use crate::state::AppState;
use super::types::{AgentTask, AgentAction};

#[tauri::command]
pub async fn start_agent_task(
    state: State<'_, AppState>,
    task: String,
    agent_type: Option<String>,
) -> AppResult<String> {
    let id = uuid::Uuid::new_v4().to_string();
    let atype = agent_type.unwrap_or_else(|| "Orchestrator".to_string());
    
    let db = state.db.lock();
    db.execute(
        "INSERT INTO agent_tasks (id, agent_type, task_description, status, created_at) VALUES (?, ?, ?, 'running', datetime('now'))",
        (&id, &atype, &task),
    )?;
    Ok(id)
}

#[tauri::command]
pub async fn stop_agent_task(state: State<'_, AppState>, task_id: String) -> AppResult<()> {
    let db = state.db.lock();
    db.execute(
        "UPDATE agent_tasks SET status = 'cancelled', completed_at = datetime('now') WHERE id = ?",
        [task_id],
    )?;
    Ok(())
}

#[tauri::command]
pub async fn get_agent_status(state: State<'_, AppState>, task_id: String) -> AppResult<AgentTask> {
    let db = state.db.lock();
    let mut stmt = db.prepare("SELECT id, conversation_id, title, description, status, agent_type, result, error, started_at, completed_at FROM agent_tasks WHERE id = ?")?;
    let cp = stmt.query_row([task_id], |row| {
        Ok(AgentTask {
            id: row.get(0)?,
            conversation_id: row.get(1).ok(),
            title: row.get(2).unwrap_or_else(|_| "Agent Task".to_string()),
            description: row.get(3).ok(),
            status: row.get(4)?,
            agent_type: row.get(5)?,
            result: row.get(6).ok(),
            error: row.get(7).ok(),
            started_at: row.get(8).ok(),
            completed_at: row.get(9).ok(),
        })
    })?;
    Ok(cp)
}

#[tauri::command]
pub async fn get_agent_history(state: State<'_, AppState>, task_id: String) -> AppResult<Vec<AgentAction>> {
    let db = state.db.lock();
    let mut stmt = db.prepare("SELECT id, task_id, action_type, tool_name, input, output, status, duration_ms FROM agent_actions WHERE task_id = ? ORDER BY created_at ASC")?;
    
    let rows = stmt.query_map([task_id], |row| {
        Ok(AgentAction {
            id: row.get(0)?,
            task_id: row.get(1)?,
            action_type: row.get(2)?,
            tool_name: row.get(3).ok(),
            input: row.get(4).ok(),
            output: row.get(5).ok(),
            status: row.get(6)?,
            duration_ms: row.get(7).ok(),
        })
    })?;
    
    let mut list = Vec::new();
    for row in rows {
        if let Ok(act) = row {
            list.push(act);
        }
    }
    Ok(list)
}
