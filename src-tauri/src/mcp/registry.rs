use std::collections::HashMap;
use std::sync::Arc;
use parking_lot::Mutex;
use crate::error::AppResult;
use super::client::McpClient;

pub struct McpRegistry {
    pub active_servers: Arc<Mutex<HashMap<String, McpClient>>>,
}

impl McpRegistry {
    pub fn new() -> Self {
        Self {
            active_servers: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn register_and_spawn(
        &self,
        name: &str,
        command: &str,
        args: Vec<String>,
    ) -> AppResult<()> {
        let mut client = McpClient::new(name.to_string(), command.to_string(), args);
        client.spawn().await?;
        
        let mut servers = self.active_servers.lock();
        servers.insert(name.to_string(), client);
        Ok(())
    }
}
