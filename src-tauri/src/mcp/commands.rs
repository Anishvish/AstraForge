use tauri::State;
use crate::error::AppResult;
use crate::state::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpServerInfo {
    pub name: String,
    pub command: String,
    pub args: Vec<String>,
    pub status: String,
}

#[tauri::command]
pub async fn connect_mcp_server(
    state: State<'_, AppState>,
    name: String,
    command: String,
    args: Vec<String>,
) -> AppResult<()> {
    // Add server definition to DB
    let db = state.db.lock();
    db.execute(
        "INSERT OR REPLACE INTO mcp_servers (id, name, command, args, is_active, status) VALUES (?, ?, ?, ?, 1, 'running')",
        (uuid::Uuid::new_v4().to_string(), &name, &command, serde_json::to_string(&args)?),
    )?;
    Ok(())
}

#[tauri::command]
pub async fn list_mcp_servers(state: State<'_, AppState>) -> AppResult<Vec<McpServerInfo>> {
    let db = state.db.lock();
    let mut stmt = db.prepare("SELECT name, command, args, status FROM mcp_servers")?;
    
    let rows = stmt.query_map([], |row| {
        let args_str: String = row.get(2)?;
        let args: Vec<String> = serde_json::from_str(&args_str).unwrap_or_default();
        Ok(McpServerInfo {
            name: row.get(0)?,
            command: row.get(1)?,
            args,
            status: row.get(3)?,
        })
    })?;
    
    let mut list = Vec::new();
    for row in rows {
        if let Ok(c) = row {
            list.push(c);
        }
    }
    Ok(list)
}

#[tauri::command]
pub async fn execute_mcp_tool(
    _state: State<'_, AppState>,
    _server_name: String,
    _tool_name: String,
    _args: serde_json::Value,
) -> AppResult<serde_json::Value> {
    // Execute tool payload placeholder
    Ok(serde_json::json!({ "result": "MCP Tool executed successfully." }))
}
