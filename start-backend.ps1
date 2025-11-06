#!/usr/bin/env pwsh
# Backend services startup script (API + GPU Worker only)
# Use this when you just need to run the backend without rebuilding the mobile app

Write-Host "Starting Kittypup Backend Services..." -ForegroundColor Cyan
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
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\services\worker-gpu'; Write-Host 'GPU Worker' -ForegroundColor Green; .\venv\Scripts\Activate.ps1; python app.py"

Write-Host ""
Write-Host "Backend services are starting in separate terminal windows!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor White
Write-Host "  API Server:    http://localhost:3000" -ForegroundColor White
Write-Host "  GPU Worker:    http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "To start the mobile app separately, run:" -ForegroundColor Yellow
Write-Host "  cd apps/mobile; npx expo run:android" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop a service." -ForegroundColor White
Write-Host ""
