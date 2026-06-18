# Install dependencies script for Windows
Write-Host "Checking system dependencies for AstraForge..." -ForegroundColor Cyan

# 1. Check for Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node.js is installed." -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js v18+." -ForegroundColor Red
}

# 2. Check and Install Rustup
if (Get-Command rustc -ErrorAction SilentlyContinue) {
    Write-Host "✅ Rust/Cargo is installed." -ForegroundColor Green
} else {
    Write-Host "Downloading Rustup installer..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe" -OutFile "$env:TEMP\rustup-init.exe"
    Write-Host "Running Rustup installer (silent mode)..." -ForegroundColor Yellow
    Start-Process -FilePath "$env:TEMP\rustup-init.exe" -ArgumentList "-y --default-toolchain stable" -NoNewWindow -Wait
    Write-Host "✅ Rust has been installed. Please restart your shell to update PATH." -ForegroundColor Green
}

# 3. Warn about C++ Build Tools
Write-Host ""
Write-Host "⚠️  IMPORTANT: AstraForge requires Visual Studio 2022 C++ Build Tools." -ForegroundColor Yellow
Write-Host "If you encounter 'link.exe not found' errors, please download the VS Installer" -ForegroundColor Yellow
Write-Host "and check the 'Desktop development with C++' workload." -ForegroundColor Yellow
