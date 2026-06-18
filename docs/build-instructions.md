# AstraForge Build & Packaging Guide

## Development Build

```bash
# Start the development server with hot-reload
npm run tauri dev
```

This command:
1. Starts the Vite dev server on `http://localhost:1420`
2. Compiles the Rust backend in debug mode
3. Opens the AstraForge desktop window
4. Enables hot-reload for frontend changes
5. Recompiles Rust on backend file changes

## Production Build

### Windows

```bash
# Build for Windows (both EXE and MSI)
npm run tauri build
```

### Output Artifacts

| Artifact | Location | Description |
|----------|----------|-------------|
| Standalone EXE | `src-tauri/target/release/AstraForge.exe` | Portable executable |
| MSI Installer | `src-tauri/target/release/bundle/msi/` | Windows Installer package |
| NSIS Installer | `src-tauri/target/release/bundle/nsis/` | NSIS setup executable |

### Build Configuration

The build is configured in `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "active": true,
    "targets": ["msi", "nsis"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/icon.ico"
    ]
  }
}
```

### Release Profile

The Rust release profile in `Cargo.toml` optimizes for binary size:

```toml
[profile.release]
codegen-units = 1    # Maximum optimization
lto = true           # Link-Time Optimization
opt-level = "s"      # Optimize for size
panic = "abort"      # Smaller binary
strip = true         # Strip debug symbols
```

## Icon Generation

Tauri requires icons in multiple sizes. Place your source icon at `src-tauri/icons/` in these formats:

- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.ico` (Windows)
- `icon.icns` (macOS, optional)

You can generate all sizes from a single source image using:

```bash
npx @tauri-apps/cli icon path/to/source-icon.png
```

## Code Signing (Windows)

For production distribution, sign your executables:

1. Obtain a code signing certificate
2. Set the certificate thumbprint in `tauri.conf.json`:
   ```json
   {
     "bundle": {
       "windows": {
         "certificateThumbprint": "YOUR_THUMBPRINT",
         "digestAlgorithm": "sha256",
         "timestampUrl": "http://timestamp.digicert.com"
       }
     }
   }
   ```

## CI/CD

### GitHub Actions

The project includes a GitHub Actions workflow at `.github/workflows/build.yml` that:

1. Checks out the code
2. Sets up Rust and Node.js
3. Installs dependencies
4. Runs tests (Rust + TypeScript)
5. Builds the application
6. Uploads build artifacts

### Release Workflow

The release workflow at `.github/workflows/release.yml`:

1. Triggers on version tag push (e.g., `v0.1.0`)
2. Builds for Windows
3. Creates a GitHub Release
4. Uploads MSI and NSIS installers
