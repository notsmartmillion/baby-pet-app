#!/usr/bin/env pwsh
# Stop all Kittypup development services

Write-Host "🛑 Stopping Kittypup Services..." -ForegroundColor Red
Write-Host ""

# Function to safely stop processes by port
function Stop-ProcessOnPort {
    param($Port, $ServiceName)
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connection) {
            $processId = $connection.OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "  Stopping $ServiceName (PID: $processId)..." -ForegroundColor Yellow
                Stop-Process -Id $processId -Force
                Write-Host "  ✓ $ServiceName stopped" -ForegroundColor Green
            }
        } else {
            Write-Host "  ℹ $ServiceName not running on port $Port" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ⚠ Could not stop $ServiceName" -ForegroundColor Yellow
    }
}

# Stop API Server (port 3000)
Stop-ProcessOnPort -Port 3000 -ServiceName "API Server"

# Stop GPU Worker (port 5000)
Stop-ProcessOnPort -Port 5000 -ServiceName "GPU Worker"

# Stop Metro Bundler (port 8081)
Stop-ProcessOnPort -Port 8081 -ServiceName "Metro Bundler"

# Also try to kill any lingering node/python processes from this project
Write-Host ""
Write-Host "Cleaning up any remaining processes..." -ForegroundColor Yellow

# Kill node processes that might be related
$nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*kittypup*"
}
if ($nodeProcs) {
    $nodeProcs | Stop-Process -Force
    Write-Host "  ✓ Stopped $($nodeProcs.Count) Node.js process(es)" -ForegroundColor Green
}

# Kill python processes that might be related
$pythonProcs = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*kittypup*"
}
if ($pythonProcs) {
    $pythonProcs | Stop-Process -Force
    Write-Host "  ✓ Stopped $($pythonProcs.Count) Python process(es)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ All services stopped!" -ForegroundColor Cyan
Write-Host ""


