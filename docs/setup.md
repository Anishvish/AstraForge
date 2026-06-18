# AstraForge Development Setup Guide

## Prerequisites

### Required Software

1. **Rust** (latest stable)
   ```bash
   # Install rustup
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Or on Windows, download from https://rustup.rs
   ```

2. **Node.js 18+**
   ```bash
   # Download from https://nodejs.org
   # Or use nvm-windows
   nvm install 18
   nvm use 18
   ```

3. **Visual Studio Build Tools 2022** (Windows)
   - Download from https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Select "Desktop development with C++" workload
   - Required components: MSVC, Windows SDK

4. **WebView2** (Windows 10/11)
   - Pre-installed on Windows 10 (post-2018) and Windows 11
   - If missing, download from https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Optional Software

- **WiX Toolset v3** — For building MSI installers
- **NSIS** — For building EXE installers (alternative to WiX)
- **Git** — For version control features

## Quick Start

```bash
# Clone the repository
git clone https://github.com/astraforge/astraforge.git
cd astraforge

# Install Node.js dependencies
npm install

# Start development server
npm run tauri dev
```

This will:
1. Start the Vite dev server on port 1420
2. Compile the Rust backend
3. Open the AstraForge desktop window

## Development Workflow

### Frontend Development

```bash
# Start only the Vite dev server (no Tauri)
npm run dev

# Run TypeScript type checking
npx tsc --noEmit

# Lint
npm run lint
```

### Backend Development

```bash
# Run Rust tests
cd src-tauri
cargo test

# Check for issues
cargo clippy

# Format code
cargo fmt
```

### Full Application

```bash
# Development mode with hot-reload
npm run tauri dev

# Production build
npm run tauri build
```

## Project Configuration

### Environment Variables

Create a `.env` file in the project root (optional):

```env
# AI Provider API Keys (for development)
NVIDIA_API_KEY=your-nvidia-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

> **Note:** In production, API keys are stored securely in the OS keyring, not in environment variables.

### Tauri Configuration

The main Tauri configuration is in `src-tauri/tauri.conf.json`. Key settings:

| Setting | Description |
|---------|-------------|
| `productName` | Application name |
| `identifier` | Unique app identifier |
| `build.devUrl` | Vite dev server URL |
| `bundle.targets` | Build targets (msi, nsis) |
| `app.windows` | Window configuration |

### Permissions

Tauri v2 uses a capability system in `src-tauri/capabilities/`. The default capability grants:
- File system access
- Shell command execution
- Native dialogs
- OS information

## Building for Production

### Windows EXE + MSI

```bash
npm run tauri build
```

Output:
- `src-tauri/target/release/AstraForge.exe` — Standalone executable
- `src-tauri/target/release/bundle/msi/` — MSI installer
- `src-tauri/target/release/bundle/nsis/` — NSIS installer

### Build Optimization

The release profile in `Cargo.toml` enables:
- LTO (Link-Time Optimization)
- Single codegen unit
- Binary stripping
- Size optimization

## Troubleshooting

### Common Issues

**Build fails with "MSVC not found"**
- Install Visual Studio Build Tools 2022 with C++ workload

**WebView2 runtime not found**
- Download and install from Microsoft's website

**Port 1420 already in use**
- Change the port in `vite.config.ts` and `tauri.conf.json`

**Rust compilation slow**
- Ensure `incremental = true` in `[profile.dev]`
- Use `cargo build` before `tauri dev` to pre-compile
