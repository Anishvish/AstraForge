# AstraForge

<div align="center">

![AstraForge Logo](public/astraforge.svg)

## The Autonomous AI Development Environment

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri%20v2-orange.svg)](https://tauri.app)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-2021-orange.svg)](https://www.rust-lang.org)

</div>

---

AstraForge is not a chatbot. AstraForge is not a code generator. **AstraForge is an autonomous software engineering platform** capable of planning, coding, testing, debugging, reviewing, documenting, and managing entire software projects.

## ✨ Features

### 🤖 Autonomous Agent Runtime
- **Agent Loop**: Observe → Think → Plan → Execute → Verify → Reflect → Continue
- **Multi-Agent Orchestration**: Architect, Frontend, Backend, Database, QA, Security, DevOps, Documentation, and Reviewer agents
- **Self-Healing Builds**: Automatic error detection, analysis, and fix cycles
- **Tool Execution**: File operations, terminal commands, Git, search, and more

### 📝 Professional Code Editor
- **Monaco Editor** — The same engine powering VS Code
- Multi-tab editing with split views
- AI inline completions (ghost text)
- Syntax highlighting for 50+ languages
- IntelliSense and symbol navigation
- Integrated diff viewer
- Minimap and breadcrumb navigation

### 💬 AI Chat Interface
- Streaming responses with markdown rendering
- Code block rendering with syntax highlighting
- Multi-conversation support
- File and project references
- Agent execution from chat

### 🗂️ File Explorer
- Tree view with expand/collapse
- Create, rename, delete files and folders
- Drag and drop support
- Context menus
- File type icons

### 🖥️ Integrated Terminal
- Interactive shell
- Streaming output
- Multiple terminal sessions
- AI terminal assistant
- Command suggestions

### 🔀 Git Integration
- Commit, push, pull
- Branch management
- Staging and unstaging
- Diff viewer
- AI-generated commit messages

### 🧠 Knowledge Systems
- **Local RAG Engine**: Semantic search over your codebase with LanceDB
- **Memory Engine**: Persistent user preferences and coding patterns
- **Knowledge Graph**: Interactive visualization of project architecture

### 🔐 Security
- Permission-based agent actions
- Encrypted API key storage (OS keyring)
- Audit logging for all operations

### 🎨 Premium Design
- Dark and light themes
- Glassmorphism effects
- Smooth animations (Framer Motion)
- VS Code / Cursor inspired UX
- Responsive layout

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Tauri v2 |
| Backend | Rust |
| Frontend | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand |
| Animations | Framer Motion |
| Code Editor | Monaco Editor |
| Database | SQLite (rusqlite) |
| Vector Database | LanceDB |
| Git | git2-rs (libgit2) |
| Terminal | xterm.js |

## 🚀 Getting Started

### Prerequisites

- **Rust** (latest stable) — [Install](https://rustup.rs/)
- **Node.js** 18+ — [Install](https://nodejs.org/)
- **Visual Studio Build Tools 2022** with C++ workload (Windows)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/astraforge/astraforge.git
cd astraforge

# Install frontend dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Production Build

```bash
# Build for Windows (EXE + MSI)
npm run tauri build
```

Output files will be in `src-tauri/target/release/bundle/`.

## 📁 Project Structure

```
astraforge/
├── src/                          # React frontend
│   ├── components/
│   │   ├── ui/                   # shadcn/ui base components
│   │   ├── layout/               # IDE layout (sidebar, titlebar, etc.)
│   │   ├── editor/               # Monaco editor components
│   │   ├── explorer/             # File explorer
│   │   ├── terminal/             # Terminal panel
│   │   ├── chat/                 # AI chat interface
│   │   ├── git/                  # Git panel
│   │   ├── agents/               # Agent timeline & task board
│   │   ├── models/               # Model management
│   │   ├── settings/             # Settings panel
│   │   ├── search/               # Search panel
│   │   ├── command-palette/      # Command palette
│   │   └── memory/               # Memory panel
│   ├── stores/                   # Zustand state management
│   ├── hooks/                    # Custom React hooks
│   └── lib/                      # Utilities and Tauri IPC
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── ai/                   # AI provider gateway
│   │   ├── agent/                # Agent runtime engine
│   │   ├── database/             # SQLite database
│   │   ├── fs/                   # File system operations
│   │   ├── git/                  # Git operations
│   │   ├── terminal/             # Terminal/PTY
│   │   ├── memory/               # Memory engine
│   │   ├── checkpoint/           # Checkpoint system
│   │   └── settings/             # Settings management
│   ├── capabilities/             # Tauri v2 permissions
│   └── Cargo.toml
├── docs/                         # Documentation
└── package.json
```

## 🤝 AI Provider Support

| Provider | Status | Notes |
|----------|--------|-------|
| NVIDIA NIM | ✅ Primary | integrate.api.nvidia.com |
| Ollama | ✅ Supported | Local models |
| OpenRouter | ✅ Supported | Model marketplace |
| LM Studio | ✅ Supported | Local inference |
| OpenAI-compatible | ✅ Supported | Any compatible API |

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by the AstraForge Team**

*The future of autonomous software engineering.*

</div>
