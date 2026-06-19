use std::process::Stdio;
use tokio::process::{Command, Child};
use crate::error::{AppError, AppResult};

pub struct McpClient {
    pub name: String,
    pub command: String,
    pub args: Vec<String>,
    _child: Option<Child>,
}

impl McpClient {
    pub fn new(name: String, command: String, args: Vec<String>) -> Self {
        Self {
            name,
            command,
            args,
            _child: None,
        }
    }

    pub async fn spawn(&mut self) -> AppResult<()> {
        let child = Command::new(&self.command)
            .args(&self.args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| AppError::Internal(format!("Failed to start MCP server process: {}", e)))?;

        // Simple communication loop can be set up here
        self._child = Some(child);
        Ok(())
    }
}
