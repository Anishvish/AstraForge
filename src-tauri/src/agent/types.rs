use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum AgentType {
    Architect,
    Frontend,
    Backend,
    Database,
    QA,
    Security,
    DevOps,
    Documentation,
    Reviewer,
    Orchestrator,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum AgentStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgentTask {
    pub id: String,
    pub conversation_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub agent_type: String,
    pub result: Option<String>,
    pub error: Option<String>,
    pub started_at: Option<String>,
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgentAction {
    pub id: String,
    pub task_id: String,
    pub action_type: String,
    pub tool_name: Option<String>,
    pub input: Option<String>,
    pub output: Option<String>,
    pub status: String,
    pub duration_ms: Option<i64>,
}
