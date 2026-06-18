use rusqlite::Connection;
use std::path::Path;
use tracing::info;

use crate::error::AppResult;

use super::schema;

pub fn init_database(path: &Path) -> AppResult<Connection> {
    let db_path = path.join("astraforge.db");

    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    info!("Initializing database at: {}", db_path.display());

    let conn = Connection::open(&db_path)?;

    // Enable WAL mode for better concurrent read performance
    conn.pragma_update(None, "journal_mode", "WAL")?;
    conn.pragma_update(None, "foreign_keys", "ON")?;
    conn.pragma_update(None, "busy_timeout", 5000)?;
    conn.pragma_update(None, "synchronous", "NORMAL")?;

    // Create all tables
    for sql in schema::ALL_SCHEMAS {
        conn.execute_batch(sql)?;
    }

    // Create indices for common queries
    conn.execute_batch(
        r#"
        CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
        CREATE INDEX IF NOT EXISTS idx_agent_actions_task ON agent_actions(task_id);
        CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
        CREATE INDEX IF NOT EXISTS idx_memories_key ON memories(key);
        CREATE INDEX IF NOT EXISTS idx_checkpoints_project ON checkpoints(project_path);
        CREATE INDEX IF NOT EXISTS idx_usage_logs_provider ON usage_logs(provider_id);
        CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at);
        "#,
    )?;

    info!("Database initialized successfully");
    Ok(conn)
}
