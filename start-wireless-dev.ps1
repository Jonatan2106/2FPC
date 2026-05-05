#!/usr/bin/env pwsh
# 2FPC Wireless Development Setup Script
# Untuk menjalankan aplikasi tanpa kabel di HP fisik dengan backend API

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "2FPC Wireless Backend + Mobile Setup" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Detect laptop IP
$route = Get-NetRoute -DestinationPrefix "192.168.100.0/24" -ErrorAction SilentlyContinue | Sort-Object RouteMetric | Select-Object -First 1
if ($route) {
    $laptopIp = Get-NetIPAddress -InterfaceIndex $route.InterfaceIndex -AddressFamily IPv4 |
        Where-Object { $_.IPAddress -notlike '169.254.*' -and $_.IPAddress -notlike '127.*' } |
        Select-Object -First 1 -ExpandProperty IPAddress
    Write-Host "✅ Laptop IP detected: $laptopIp" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not detect laptop IP. Make sure WiFi is connected." -ForegroundColor Yellow
    exit 1
}

# Check ADB device
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (!(Test-Path $adb)) {
    Write-Host "❌ ADB not found. Install Android SDK first." -ForegroundColor Red
    exit 1
}

$devices = & $adb devices -l | Select-String "device"
if ($devices) {
    Write-Host "✅ ADB device(s) found:" -ForegroundColor Green
    $devices | ForEach-Object { Write-Host "   $_" -ForegroundColor Green }
} else {
    Write-Host "❌ No ADB devices found. Connect device via USB or enable wireless debugging." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Start servers? (y/n)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'y') {
    Write-Host ""
    Write-Host "Starting backend on port 8080..." -ForegroundColor Cyan
    Write-Host "API will be available at: http://$laptopIp`:8080/api" -ForegroundColor Cyan
    
    # Start backend
    npm run backend:start
}
