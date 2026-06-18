# AstraForge Architecture Guide

## Overview

AstraForge follows a **layered architecture** with clear separation between the desktop framework (Tauri v2/Rust), the frontend UI (React/TypeScript), and the AI systems.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React 19 + TypeScript + Tailwind CSS + shadcn/ui           │
│  Monaco Editor + xterm.js + Framer Motion                    │
├─────────────────────────────────────────────────────────────┤
│                    STATE MANAGEMENT                          │
│  Zustand stores (workspace, editor, terminal, git, chat,    │
│  agents, models, ui, settings)                               │
├─────────────────────────────────────────────────────────────┤
│                    IPC BRIDGE                                │
│  Tauri Commands (invoke) + Events (emit/listen)              │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                         │
│  Agent Runtime │ AI Gateway │ Memory │ Checkpoint │ Security │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                      │
│  File System │ Git (git2) │ Terminal (PTY) │ Database (SQLite)│
│  Vector DB (LanceDB) │ HTTP (reqwest) │ Keyring              │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── TitleBar (custom window controls)
├── WorkspaceLayout
│   ├── Sidebar (activity bar)
│   ├── PanelContainer
│   │   ├── LeftPanel (explorer, search, git, etc.)
│   │   ├── CenterPanel
│   │   │   ├── EditorTabs
│   │   │   ├── MonacoEditor / WelcomeTab
│   │   │   └── BottomPanel (terminal)
│   │   └── RightPanel (chat, agents)
│   └── StatusBar
└── CommandPalette (overlay)
```

### State Management

Each major feature area has its own Zustand store:

| Store | Purpose |
|-------|---------|
| `workspace` | Project path, file tree, selection |
| `editor` | Open tabs, active file, dirty state |
| `terminal` | Terminal sessions |
| `git` | Repository status, branches, history |
| `chat` | Conversations, messages, streaming |
| `agent` | Running agents, tasks, history |
| `models` | AI providers, active model, usage |
| `ui` | Theme, panel visibility, notifications |

## Backend Architecture

### Module Structure

```
src-tauri/src/
├── lib.rs          # App builder, command registration
├── main.rs         # Entry point
├── state.rs        # Shared application state
├── error.rs        # Unified error handling
├── database/       # SQLite connection and schema
├── fs/             # File system operations
├── git/            # Git operations (libgit2)
├── terminal/       # Terminal/shell integration
├── ai/             # AI provider gateway
│   └── providers/  # NVIDIA, Ollama, OpenAI-compat
├── agent/          # Agent runtime engine
├── memory/         # Memory persistence
├── checkpoint/     # Workspace snapshots
└── settings/       # Application settings
```

### Agent Runtime

The agent runtime implements an autonomous execution loop:

```
1. OBSERVE  → Gather context (files, errors, project state)
2. THINK    → Analyze the situation using LLM
3. PLAN     → Decompose into actionable steps
4. EXECUTE  → Run tools (file ops, commands, git)
5. VERIFY   → Check results, run tests
6. REFLECT  → Evaluate progress, adjust strategy
7. CONTINUE → Loop or complete
```

### AI Provider Gateway

All AI providers implement a common trait:

```rust
#[async_trait]
pub trait AiProvider: Send + Sync {
    async fn chat_completion(&self, request: ChatRequest) -> Result<ChatResponse>;
    async fn stream_completion(&self, request: ChatRequest) -> Result<StreamResponse>;
    async fn list_models(&self) -> Result<Vec<ModelInfo>>;
}
```

The gateway routes requests to the active provider with automatic fallback.

## Database Design

SQLite with WAL mode for concurrent access. Key tables:

- **conversations** / **messages** — Chat history
- **agent_tasks** / **agent_actions** — Agent execution log
- **memories** — Persistent user preferences
- **checkpoints** — Workspace snapshots
- **provider_configs** / **model_configs** — AI configuration
- **usage_logs** — Token and cost tracking
- **settings** — Key-value application settings

## Security Model

1. **API Keys**: Stored in OS keyring (Windows Credential Manager)
2. **Agent Permissions**: Dangerous operations require user approval
3. **Audit Log**: All agent actions are logged to the database
4. **CSP**: Content Security Policy restricts web content loading
