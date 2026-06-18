# PowerShell script to set up AstraForge development environment on Windows
# Run: powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              AstraForge Development Setup                    ║" -ForegroundColor Cyan
Write-Host "║        The Autonomous AI Development Environment             ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

function Check-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Write-Status {
    param([string]$Message, [string]$Status)
    if ($Status -eq "OK") {
        Write-Host "  [✓] $Message" -ForegroundColor Green
    } elseif ($Status -eq "FAIL") {
        Write-Host "  [✗] $Message" -ForegroundColor Red
    } elseif ($Status -eq "WARN") {
        Write-Host "  [!] $Message" -ForegroundColor Yellow
    } else {
        Write-Host "  [·] $Message" -ForegroundColor Gray
    }
}

# Check Rust
Write-Host "Checking prerequisites..." -ForegroundColor White
Write-Host ""

if (Check-Command "rustc") {
    $rustVersion = rustc --version
    Write-Status "Rust: $rustVersion" "OK"
} else {
    Write-Status "Rust not found. Install from https://rustup.rs" "FAIL"
    exit 1
}

# Check Cargo
if (Check-Command "cargo") {
    $cargoVersion = cargo --version
    Write-Status "Cargo: $cargoVersion" "OK"
} else {
    Write-Status "Cargo not found" "FAIL"
    exit 1
}

# Check Node.js
if (Check-Command "node") {
    $nodeVersion = node --version
    Write-Status "Node.js: $nodeVersion" "OK"
} else {
    Write-Status "Node.js not found. Install from https://nodejs.org" "FAIL"
    exit 1
}

# Check npm
if (Check-Command "npm") {
    $npmVersion = npm --version
    Write-Status "npm: $npmVersion" "OK"
} else {
    Write-Status "npm not found" "FAIL"
    exit 1
}

# Check Git
if (Check-Command "git") {
    $gitVersion = git --version
    Write-Status "Git: $gitVersion" "OK"
} else {
    Write-Status "Git not found (optional but recommended)" "WARN"
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor White
Write-Host ""

# Install Node.js dependencies
Write-Status "Installing Node.js dependencies..." "INFO"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Status "Node.js dependencies installed" "OK"
} else {
    Write-Status "Failed to install Node.js dependencies" "FAIL"
    exit 1
}

# Install Tauri CLI
Write-Status "Ensuring Tauri CLI is available..." "INFO"
npm install -D @tauri-apps/cli
Write-Status "Tauri CLI ready" "OK"

# Check Rust dependencies compile
Write-Status "Checking Rust compilation (this may take a while on first run)..." "INFO"
Push-Location src-tauri
cargo check 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Status "Rust dependencies compiled successfully" "OK"
} else {
    Write-Status "Rust compilation failed - check build tools" "FAIL"
    Write-Host ""
    Write-Host "  Ensure Visual Studio Build Tools 2022 is installed with:" -ForegroundColor Yellow
    Write-Host "  - MSVC v143 - VS 2022 C++ x64/x86 build tools" -ForegroundColor Yellow
    Write-Host "  - Windows 10/11 SDK" -ForegroundColor Yellow
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              Setup Complete!                                 ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  To start development:" -ForegroundColor White
Write-Host "    npm run tauri dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  To build for production:" -ForegroundColor White
Write-Host "    npm run tauri build" -ForegroundColor Cyan
Write-Host ""
