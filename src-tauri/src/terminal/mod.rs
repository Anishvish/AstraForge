pub mod commands;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommandOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
    pub success: bool,
}

/// Represents an active terminal session.
/// Stores session metadata and process state.
pub struct TerminalSession {
    pub id: String,
    pub cwd: String,
    pub is_active: bool,
}

impl TerminalSession {
    pub fn new(id: String, cwd: String) -> Self {
        Self {
            id,
            cwd,
            is_active: true,
        }
    }
}
