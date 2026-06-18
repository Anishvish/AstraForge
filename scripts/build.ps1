# AstraForge Automated Build Script
Write-Host "Starting production build pipeline for AstraForge..." -ForegroundColor Cyan

# 1. Check if cargo is in path
$env:PATH += ";$env:USERPROFILE\.cargo\bin"
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Rust/Cargo compiler is not installed or not in PATH. Run install-deps.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "Installing NPM dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Building React production frontend assets..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend compilation failed." -ForegroundColor Red
    exit 1
}

Write-Host "Running Tauri native Windows compiler..." -ForegroundColor Yellow
npx tauri build

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 AstraForge production executable (.exe) built successfully!" -ForegroundColor Green
    Write-Host "Installer package: src-tauri\target\release\bundle\nsis\" -ForegroundColor Green
} else {
    Write-Host "❌ Tauri executable build failed. Double check your MSVC C++ components." -ForegroundColor Red
}
