#!/bin/bash

# Baby Pet App - Complete Setup Script
# Run this once to set up everything for local development

set -e  # Exit on error

echo "🐾 Baby Pet App - Setup Script"
echo "==============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "   Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python is not installed${NC}"
    echo "   Please install Python 3.11+ from https://python.org/"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed (optional but recommended)${NC}"
    echo "   Install Docker from https://docker.com/ to use docker-compose for services"
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"
echo ""

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Build shared types
echo "🔨 Building shared types package..."
cd packages/types
npm run build
cd ../..
echo -e "${GREEN}✅ Types built${NC}"
echo ""

# Set up environment files
echo "⚙️  Setting up environment files..."

if [ ! -f "services/api/.env" ]; then
    cp services/api/.env.example services/api/.env
    echo -e "${YELLOW}⚠️  Created services/api/.env - please update with your credentials${NC}"
else
    echo -e "${GREEN}✅ services/api/.env already exists${NC}"
fi

if [ ! -f "apps/mobile/.env" ]; then
    cp apps/mobile/.env.example apps/mobile/.env
    echo -e "${GREEN}✅ Created apps/mobile/.env${NC}"
else
    echo -e "${GREEN}✅ apps/mobile/.env already exists${NC}"
fi

echo ""

# Docker setup
echo "🐳 Do you want to start Docker services (Postgres, Redis, S3)? (y/n)"
read -r start_docker

if [ "$start_docker" = "y" ]; then
    echo "Starting Docker services..."
    cd infra
    docker-compose up -d
    cd ..
    echo -e "${GREEN}✅ Docker services started${NC}"
    echo ""
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 5
else
    echo -e "${YELLOW}⚠️  Skipped Docker setup - make sure Postgres and Redis are running${NC}"
    echo ""
fi

# Database setup
echo "🗄️  Setting up database..."
cd services/api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
cd ../..
echo -e "${GREEN}✅ Database ready${NC}"
echo ""

# Python setup
echo "🐍 Setting up Python GPU worker..."
cd services/worker-gpu

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Created Python virtual environment${NC}"
fi

# Activate venv and install dependencies
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Unix-like
    source venv/bin/activate
fi

pip install -r requirements.txt
echo -e "${GREEN}✅ Python dependencies installed${NC}"
deactivate
cd ../..
echo ""

# Create S3 bucket in LocalStack (if using Docker)
if [ "$start_docker" = "y" ]; then
    echo "🪣 Creating S3 bucket in LocalStack..."
    sleep 2  # Give LocalStack time to start
    chmod +x scripts/create-s3-bucket.sh
    ./scripts/create-s3-bucket.sh || echo -e "${YELLOW}⚠️  Failed to create S3 bucket - you may need to do this manually${NC}"
    echo ""
fi

# Final instructions
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Update environment variables:"
echo "   - Edit services/api/.env with your credentials"
echo "   - Update API_URL in apps/mobile/.env if testing on device"
echo ""
echo "2. Start the development servers:"
echo ""
echo "   Terminal 1 - API Server:"
echo "   $ npm run dev:api"
echo ""
echo "   Terminal 2 - GPU Worker:"
echo "   $ npm run dev:gpu"
echo ""
echo "   Terminal 3 - Mobile App:"
echo "   $ npm run dev:mobile"
echo ""
echo "3. Or run everything at once:"
echo "   $ npm run dev  (API + Mobile)"
echo ""
echo "4. Access Prisma Studio (database GUI):"
echo "   $ npm run prisma:studio"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - QUICKSTART.md - Detailed setup guide"
echo "   - ARCHITECTURE.md - System design"
echo "   - TODO.md - Development roadmap"
echo ""
echo "🧪 Test credentials:"
echo "   User ID: test-user-123"
echo "   Add header: x-user-id: test-user-123"
echo ""
echo "Happy coding! 🚀"

