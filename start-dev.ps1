#!/usr/bin/env pwsh
# Development environment startup script
# Starts API, GPU Worker, and Mobile app in separate terminal windows

Write-Host "Starting Kittypup Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$projectRoot = $PSScriptRoot

# 1. Start API Server
Write-Host "Launching API Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; Write-Host 'API Server' -ForegroundColor Blue; npm run dev:api"

# Wait a moment for API to start
Start-Sleep -Seconds 2

# 2. Start GPU Worker
Write-Host "Launching GPU Worker..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\services\worker-gpu'; Write-Host 'GPU Worker' -ForegroundColor Green; if (Test-Path .\venv\Scripts\Activate.ps1) { .\venv\Scripts\Activate.ps1 }; python app.py"

# Wait a moment for GPU Worker to start
Start-Sleep -Seconds 2

# 3. Start Mobile App
Write-Host "Launching Mobile App..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\apps\mobile'; Write-Host 'Mobile App (Expo)' -ForegroundColor Yellow; npm start"

Write-Host ""
Write-Host "All services are starting in separate terminal windows!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor White
Write-Host "  API Server:    http://localhost:3000" -ForegroundColor White
Write-Host "  GPU Worker:    http://localhost:5000" -ForegroundColor White
Write-Host "  Mobile App:    Expo DevTools" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop a service." -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop all services at once, run: .\stop-dev.ps1" -ForegroundColor Yellow
