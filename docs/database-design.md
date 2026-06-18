# AstraForge Database Design

## Overview

AstraForge uses SQLite as its primary database, stored locally in the application data directory. The database uses WAL (Write-Ahead Logging) mode for concurrent access and foreign keys for referential integrity.

## Database Location

```
Windows: %APPDATA%/com.astraforge.dev/astraforge.db
macOS:   ~/Library/Application Support/com.astraforge.dev/astraforge.db
Linux:   ~/.local/share/com.astraforge.dev/astraforge.db
```

## Schema

### conversations

Stores chat conversation metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| title | TEXT | Conversation title |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |
| project_path | TEXT | Associated project |
| model_id | TEXT | Model used |

### messages

Stores individual chat messages.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| conversation_id | TEXT FK | Parent conversation |
| role | TEXT | user/assistant/system/tool |
| content | TEXT | Message content |
| tool_calls | TEXT | JSON tool calls |
| tool_results | TEXT | JSON tool results |
| token_count | INTEGER | Token count |
| model_id | TEXT | Model used |
| created_at | DATETIME | Timestamp |

### agent_tasks

Stores agent task execution records.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| conversation_id | TEXT FK | Related conversation |
| parent_task_id | TEXT FK | Parent task (subtasks) |
| title | TEXT | Task title |
| description | TEXT | Task description |
| status | TEXT | pending/running/completed/failed/blocked |
| agent_type | TEXT | Type of agent |
| result | TEXT | Task result |
| error | TEXT | Error message |
| created_at | DATETIME | Creation time |
| started_at | DATETIME | Start time |
| completed_at | DATETIME | Completion time |

### agent_actions

Audit log of all agent tool executions.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| task_id | TEXT FK | Parent task |
| action_type | TEXT | Action category |
| tool_name | TEXT | Tool used |
| input | TEXT | JSON input |
| output | TEXT | JSON output |
| status | TEXT | success/error |
| duration_ms | INTEGER | Execution time |
| created_at | DATETIME | Timestamp |

### memories

Persistent storage for user preferences and patterns.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| category | TEXT | Memory category |
| key | TEXT | Memory key |
| value | TEXT | Memory value |
| importance | REAL | Importance score (0-1) |
| access_count | INTEGER | Times accessed |
| created_at | DATETIME | Creation time |
| updated_at | DATETIME | Last update |

### checkpoints

Workspace snapshot metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| project_path | TEXT | Project directory |
| description | TEXT | Checkpoint description |
| snapshot_path | TEXT | Snapshot storage path |
| created_at | DATETIME | Creation time |

### provider_configs

AI provider configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| provider_type | TEXT | nvidia/ollama/openai/openrouter/lmstudio |
| name | TEXT | Display name |
| endpoint | TEXT | API endpoint URL |
| api_key_ref | TEXT | Keyring reference |
| is_active | INTEGER | Active flag |
| config | TEXT | JSON additional config |
| created_at | DATETIME | Creation time |

### model_configs

Model-specific configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| provider_id | TEXT FK | Parent provider |
| model_id | TEXT | Model identifier |
| display_name | TEXT | Display name |
| capabilities | TEXT | JSON capabilities |
| max_tokens | INTEGER | Context window |
| cost_per_input_token | REAL | Input cost |
| cost_per_output_token | REAL | Output cost |

### usage_logs

Token usage and cost tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| model_id | TEXT | Model used |
| provider_id | TEXT | Provider used |
| input_tokens | INTEGER | Input tokens |
| output_tokens | INTEGER | Output tokens |
| cost | REAL | Calculated cost |
| latency_ms | INTEGER | Response latency |
| created_at | DATETIME | Timestamp |

### mcp_servers

MCP server registry.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| name | TEXT | Server name |
| command | TEXT | Start command |
| args | TEXT | JSON arguments |
| env | TEXT | JSON environment vars |
| is_active | INTEGER | Active flag |
| created_at | DATETIME | Creation time |

### settings

Key-value application settings.

| Column | Type | Description |
|--------|------|-------------|
| key | TEXT PK | Setting key |
| value | TEXT | Setting value |
| updated_at | DATETIME | Last update |

## Indexes

```sql
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_agent_tasks_conversation ON agent_tasks(conversation_id);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_actions_task ON agent_actions(task_id);
CREATE INDEX idx_memories_category ON memories(category);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at);
CREATE INDEX idx_checkpoints_project ON checkpoints(project_path);
```
