# Baby Pet App - Windows Setup Script
# Run this with: powershell -ExecutionPolicy Bypass -File SETUP.ps1

Write-Host "🐾 Baby Pet App - Windows Setup" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "   Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed" -ForegroundColor Red
    Write-Host "   Please install Python 3.11+ from https://python.org/" -ForegroundColor Yellow
    exit 1
}

# Check Docker (optional)
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
    $hasDocker = $true
} catch {
    Write-Host "⚠️  Docker is not installed (optional but recommended)" -ForegroundColor Yellow
    $hasDocker = $false
}

Write-Host ""

# Install Node dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build shared types
Write-Host "🔨 Building shared types package..." -ForegroundColor Yellow
Set-Location packages\types
npm run build
Set-Location ..\..
Write-Host "✅ Types built" -ForegroundColor Green
Write-Host ""

# Set up environment files
Write-Host "⚙️  Setting up environment files..." -ForegroundColor Yellow

if (!(Test-Path "services\api\.env")) {
    Copy-Item "services\api\.env.example" "services\api\.env"
    Write-Host "⚠️  Created services\api\.env - please update with your credentials" -ForegroundColor Yellow
} else {
    Write-Host "✅ services\api\.env already exists" -ForegroundColor Green
}

if (!(Test-Path "apps\mobile\.env")) {
    Copy-Item "apps\mobile\.env.example" "apps\mobile\.env"
    Write-Host "✅ Created apps\mobile\.env" -ForegroundColor Green
} else {
    Write-Host "✅ apps\mobile\.env already exists" -ForegroundColor Green
}

Write-Host ""

# Docker setup
if ($hasDocker) {
    $response = Read-Host "Do you want to start Docker services (Postgres, Redis, S3)? (y/n)"
    if ($response -eq "y") {
        Write-Host "Starting Docker services..." -ForegroundColor Yellow
        Set-Location infra
        docker-compose up -d
        Set-Location ..
        Write-Host "✅ Docker services started" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "⚠️  Skipped Docker setup - make sure Postgres and Redis are running" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Database setup
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
Set-Location services\api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
Set-Location ..\..
Write-Host "✅ Database ready" -ForegroundColor Green
Write-Host ""

# Python setup
Write-Host "🐍 Setting up Python GPU worker..." -ForegroundColor Yellow
Set-Location services\worker-gpu

if (!(Test-Path "venv")) {
    python -m venv venv
    Write-Host "✅ Created Python virtual environment" -ForegroundColor Green
}

# Activate and install
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Write-Host "✅ Python dependencies installed" -ForegroundColor Green
deactivate
Set-Location ..\..
Write-Host ""

# Final instructions
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Update environment variables:" -ForegroundColor White
Write-Host "   - Edit services\api\.env with your credentials"
Write-Host "   - Update API_URL in apps\mobile\.env if testing on device"
Write-Host ""
Write-Host "2. Start the development servers:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 - API Server:" -ForegroundColor Yellow
Write-Host "   npm run dev:api" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Terminal 2 - GPU Worker:" -ForegroundColor Yellow
Write-Host "   npm run dev:gpu" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Terminal 3 - Mobile App:" -ForegroundColor Yellow
Write-Host "   npm run dev:mobile" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Or run API + Mobile together:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Access Prisma Studio (database GUI):" -ForegroundColor White
Write-Host "   npm run prisma:studio" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - START_HERE.md (← Read this first!)"
Write-Host "   - RUN.md"
Write-Host "   - QUICKSTART.md"
Write-Host "   - ARCHITECTURE.md"
Write-Host "   - TODO.md"
Write-Host ""
Write-Host "🧪 Test credentials:" -ForegroundColor Cyan
Write-Host "   User ID: test-user-123"
Write-Host "   Add header: x-user-id: test-user-123"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green

