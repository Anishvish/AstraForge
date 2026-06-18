pub const CREATE_CONVERSATIONS: &str = r#"
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    agent_type TEXT,
    model TEXT,
    provider_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    is_archived INTEGER NOT NULL DEFAULT 0,
    metadata TEXT DEFAULT '{}'
);
"#;

pub const CREATE_MESSAGES: &str = r#"
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY NOT NULL,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('system', 'user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    model TEXT,
    provider_id TEXT,
    token_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT DEFAULT '{}',
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
"#;

pub const CREATE_AGENT_TASKS: &str = r#"
CREATE TABLE IF NOT EXISTS agent_tasks (
    id TEXT PRIMARY KEY NOT NULL,
    conversation_id TEXT,
    agent_type TEXT NOT NULL,
    task_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    result TEXT,
    error TEXT,
    started_at TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT DEFAULT '{}',
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
);
"#;

pub const CREATE_AGENT_ACTIONS: &str = r#"
CREATE TABLE IF NOT EXISTS agent_actions (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    tool_name TEXT,
    input TEXT,
    output TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'failed')),
    error TEXT,
    duration_ms INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (task_id) REFERENCES agent_tasks(id) ON DELETE CASCADE
);
"#;

pub const CREATE_MEMORIES: &str = r#"
CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY NOT NULL,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    importance REAL NOT NULL DEFAULT 0.5,
    access_count INTEGER NOT NULL DEFAULT 0,
    last_accessed TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"#;

pub const CREATE_CHECKPOINTS: &str = r#"
CREATE TABLE IF NOT EXISTS checkpoints (
    id TEXT PRIMARY KEY NOT NULL,
    project_path TEXT NOT NULL,
    description TEXT DEFAULT '',
    commit_hash TEXT,
    files_snapshot TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"#;

pub const CREATE_PROVIDER_CONFIGS: &str = r#"
CREATE TABLE IF NOT EXISTS provider_configs (
    id TEXT PRIMARY KEY NOT NULL,
    provider_type TEXT NOT NULL,
    name TEXT NOT NULL,
    base_url TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT DEFAULT '{}'
);
"#;

pub const CREATE_MODEL_CONFIGS: &str = r#"
CREATE TABLE IF NOT EXISTS model_configs (
    id TEXT PRIMARY KEY NOT NULL,
    provider_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    context_length INTEGER DEFAULT 4096,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT DEFAULT '{}',
    FOREIGN KEY (provider_id) REFERENCES provider_configs(id) ON DELETE CASCADE
);
"#;

pub const CREATE_USAGE_LOGS: &str = r#"
CREATE TABLE IF NOT EXISTS usage_logs (
    id TEXT PRIMARY KEY NOT NULL,
    provider_id TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    cost_estimate REAL DEFAULT 0.0,
    request_type TEXT DEFAULT 'chat',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"#;

pub const CREATE_MCP_SERVERS: &str = r#"
CREATE TABLE IF NOT EXISTS mcp_servers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    command TEXT NOT NULL,
    args TEXT DEFAULT '[]',
    env TEXT DEFAULT '{}',
    is_active INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'stopped' CHECK(status IN ('stopped', 'starting', 'running', 'error')),
    last_error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"#;

pub const CREATE_SETTINGS: &str = r#"
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"#;

pub const ALL_SCHEMAS: &[&str] = &[
    CREATE_CONVERSATIONS,
    CREATE_MESSAGES,
    CREATE_AGENT_TASKS,
    CREATE_AGENT_ACTIONS,
    CREATE_MEMORIES,
    CREATE_CHECKPOINTS,
    CREATE_PROVIDER_CONFIGS,
    CREATE_MODEL_CONFIGS,
    CREATE_USAGE_LOGS,
    CREATE_MCP_SERVERS,
    CREATE_SETTINGS,
];
