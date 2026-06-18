# AstraForge Agent Runtime Guide

## Overview

The AstraForge Agent Runtime is an autonomous execution engine that enables AI agents to understand, plan, and execute software engineering tasks with minimal human intervention.

## Agent Loop

Every agent follows a structured execution loop:

```
┌──────────┐
│ OBSERVE  │ ← Gather context (files, errors, project state)
└────┬─────┘
     ▼
┌──────────┐
│  THINK   │ ← Analyze the situation using LLM
└────┬─────┘
     ▼
┌──────────┐
│   PLAN   │ ← Decompose into actionable steps
└────┬─────┘
     ▼
┌──────────┐
│ EXECUTE  │ ← Run tools (file ops, commands, git)
└────┬─────┘
     ▼
┌──────────┐
│  VERIFY  │ ← Check results, run tests
└────┬─────┘
     ▼
┌──────────┐
│ REFLECT  │ ← Evaluate progress, adjust strategy
└────┬─────┘
     ▼
┌──────────────┐
│ CONTINUE or  │ ← Loop or complete
│   COMPLETE   │
└──────────────┘
```

## Agent Types

### Orchestrator Agent
The top-level coordinator that:
- Receives user tasks
- Decomposes them into subtasks
- Assigns subtasks to specialized agents
- Monitors progress
- Handles failures and retries

### Architect Agent
- Analyzes requirements
- Designs system architecture
- Creates technical specifications
- Defines API contracts
- Selects technology stack

### Frontend Agent
- Creates React components
- Implements UI designs
- Handles styling (Tailwind CSS)
- Manages state
- Implements responsive layouts

### Backend Agent
- Creates APIs and services
- Implements business logic
- Handles authentication
- Manages middleware
- Implements error handling

### Database Agent
- Designs database schemas
- Creates migrations
- Writes queries
- Optimizes performance
- Handles data modeling

### QA Agent
- Writes unit tests
- Writes integration tests
- Validates functionality
- Reports test coverage
- Identifies edge cases

### Security Agent
- Reviews code for vulnerabilities
- Checks dependency security
- Validates authentication flows
- Reviews authorization logic
- Generates security reports

### DevOps Agent
- Creates Docker configurations
- Sets up CI/CD pipelines
- Configures deployment
- Manages infrastructure
- Handles monitoring

### Documentation Agent
- Generates README files
- Creates API documentation
- Writes inline comments
- Creates architecture docs
- Generates changelogs

### Reviewer Agent
- Reviews code quality
- Checks best practices
- Validates architecture
- Suggests improvements
- Generates review reports

## Tools

Agents interact with the system through a set of tools:

| Tool | Description | Parameters |
|------|-------------|------------|
| `ReadFile` | Read file contents | path |
| `WriteFile` | Write/update file | path, content |
| `CreateFile` | Create new file | path, content |
| `DeleteFile` | Delete file | path |
| `ListDirectory` | List directory contents | path |
| `SearchFiles` | Search for files by name/content | path, query |
| `RunCommand` | Execute terminal command | cwd, command, args |
| `GitCommit` | Create a git commit | message |
| `GitDiff` | Get git diff | — |

## Task Lifecycle

```
PENDING → RUNNING → COMPLETED
                  → FAILED
         → BLOCKED (waiting for dependency)
```

Each task maintains:
- **History**: Complete record of all actions taken
- **Context**: Files read, commands run, conversations had
- **Artifacts**: Files created or modified
- **Metrics**: Duration, token usage, tool invocations

## Self-Healing

When a build or test fails, the agent automatically:

1. Captures the error output
2. Analyzes the error using LLM
3. Identifies the root cause
4. Generates a fix
5. Applies the fix
6. Re-runs the build/test
7. Repeats until success or max retries

## Security

All agent tool executions go through a permission system:

- **Safe operations** (read file, list directory): Auto-approved
- **Moderate operations** (write file, create file): Logged, auto-approved
- **Dangerous operations** (delete file, git push, system commands): Require user approval

All actions are recorded in an audit log stored in SQLite.
