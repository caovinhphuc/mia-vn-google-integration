#!/bin/bash

# 🚀 REACT OAS INTEGRATION - DEPLOYMENT PLATFORM
# Triển khai toàn bộ hệ thống với AI/ML integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    log "Detected macOS environment"
else
    log "Running on Linux/Unix environment"
fi

# Project info
PROJECT_NAME="React OAS Integration Platform"
PROJECT_VERSION="v4.0"
DEPLOYMENT_DATE=$(date +'%Y-%m-%d %H:%M:%S')

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                  🚀 REACT OAS INTEGRATION                    ║"
echo "║                   Platform Deployment v4.0                   ║"
echo "║                     AI-Powered Analytics                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log "Starting deployment of $PROJECT_NAME $PROJECT_VERSION"
log "Deployment time: $DEPLOYMENT_DATE"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        warn "Port $port is already in use"
        return 1
    else
        info "Port $port is available"
        return 0
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        log "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    log "Waiting for $service_name to be ready at $url"

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log "$service_name is ready! ✅"
            return 0
        fi

        info "Attempt $attempt/$max_attempts: Waiting for $service_name..."
        sleep 2
        ((attempt++))
    done

    error "$service_name failed to start after $max_attempts attempts"
}

# Parse command line arguments
ACTION=${1:-"start"}

case $ACTION in
    "start")
        log "🚀 Starting full platform deployment..."
        ;;
    "stop")
        log "🛑 Stopping all services..."
        ;;
    "restart")
        log "🔄 Restarting all services..."
        ;;
    "status")
        log "📊 Checking service status..."
        ;;
    "health")
        log "🏥 Running health checks..."
        ;;
    "logs")
        log "📋 Showing service logs..."
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|health|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all services"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Check service status"
        echo "  health  - Run health checks"
        echo "  logs    - Show service logs"
        exit 1
        ;;
esac

# Service definitions
GOOGLE_SHEETS_FRONTEND_PORT=3000
GOOGLE_SHEETS_BACKEND_PORT=3003
AI_SERVICE_PORT=8000
MIA_FRONTEND_PORT=5173

# Service directories
GOOGLE_SHEETS_DIR="./google-sheets-project"
MIA_LOGISTICS_DIR="./src/mia-logistics-manager"
AI_ENV_DIR="./.venv"

# Start function
start_services() {
    log "🔧 Preparing environment..."

    # Check if directories exist
    if [ ! -d "$GOOGLE_SHEETS_DIR" ]; then
        error "Google Sheets project directory not found: $GOOGLE_SHEETS_DIR"
    fi

    if [ ! -d "$AI_ENV_DIR" ]; then
        warn "Python .venv not found. Run: npm run ide:setup"
        exit 1
    fi

    # Install dependencies
    log "📦 Installing dependencies..."

    # Google Sheets Project
    if [ -f "$GOOGLE_SHEETS_DIR/package.json" ]; then
        log "Installing Google Sheets dependencies..."
        cd $GOOGLE_SHEETS_DIR
        npm install --legacy-peer-deps
        cd ..
    fi

    # Shared project
    if [ -f "./shared/package.json" ]; then
        log "Installing Shared project dependencies..."
        cd ./shared
        npm install --legacy-peer-deps
        cd ..
    fi

    # Kill any existing processes
    log "🧹 Cleaning up existing processes..."
    kill_port $GOOGLE_SHEETS_FRONTEND_PORT
    kill_port $GOOGLE_SHEETS_BACKEND_PORT
    kill_port $AI_SERVICE_PORT
    kill_port $MIA_FRONTEND_PORT

    sleep 3

    # Start services
    log "🚀 Starting services..."

    # 1. Google Sheets Backend
    log "Starting Google Sheets Backend (Port $GOOGLE_SHEETS_BACKEND_PORT)..."
    cd $GOOGLE_SHEETS_DIR
    PORT=$GOOGLE_SHEETS_BACKEND_PORT nohup node server.js > ../logs/google-sheets-backend.log 2>&1 &
    GOOGLE_SHEETS_BACKEND_PID=$!
    echo $GOOGLE_SHEETS_BACKEND_PID > ../logs/google-sheets-backend.pid
    cd ..

    sleep 5

    # 2. Google Sheets Frontend
    log "Starting Google Sheets Frontend (Port $GOOGLE_SHEETS_FRONTEND_PORT)..."
    cd $GOOGLE_SHEETS_DIR
    PORT=$GOOGLE_SHEETS_FRONTEND_PORT nohup npm start > ../logs/google-sheets-frontend.log 2>&1 &
    GOOGLE_SHEETS_FRONTEND_PID=$!
    echo $GOOGLE_SHEETS_FRONTEND_PID > ../logs/google-sheets-frontend.pid
    cd ..

    sleep 10

    # 3. MIA Logistics Frontend (if exists)
    if [ -d "./shared" ]; then
        log "Starting MIA Logistics Frontend (Port $MIA_FRONTEND_PORT)..."
        cd ./shared
        nohup npm run dev > ../logs/mia-frontend.log 2>&1 &
        MIA_FRONTEND_PID=$!
        echo $MIA_FRONTEND_PID > ../logs/mia-frontend.pid
        cd ..

        sleep 5
    fi

    # 4. AI Service (if Python environment exists)
    if [ -d "$AI_ENV_DIR" ]; then
        log "Starting AI Service (Port $AI_SERVICE_PORT)..."
        source $AI_ENV_DIR/bin/activate
        nohup uvicorn ai_service.main:app --host 0.0.0.0 --port $AI_SERVICE_PORT > logs/ai-service.log 2>&1 &
        AI_SERVICE_PID=$!
        echo $AI_SERVICE_PID > logs/ai-service.pid
        deactivate

        sleep 5
    fi

    # Wait for services to be ready
    log "⏳ Waiting for services to be ready..."

    wait_for_service "http://localhost:$GOOGLE_SHEETS_BACKEND_PORT/api/health" "Google Sheets Backend"
    wait_for_service "http://localhost:$GOOGLE_SHEETS_FRONTEND_PORT" "Google Sheets Frontend"

    if [ -d "./shared" ]; then
        wait_for_service "http://localhost:$MIA_FRONTEND_PORT" "MIA Logistics Frontend"
    fi

    log "✅ All services started successfully!"
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                     🎉 DEPLOYMENT COMPLETE                   ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📊 Service URLs:${NC}"
    echo -e "${BLUE}├── Google Sheets Frontend: http://localhost:$GOOGLE_SHEETS_FRONTEND_PORT${NC}"
    echo -e "${BLUE}├── Google Sheets Backend:  http://localhost:$GOOGLE_SHEETS_BACKEND_PORT${NC}"
    if [ -d "./shared" ]; then
        echo -e "${BLUE}├── MIA Logistics Frontend: http://localhost:$MIA_FRONTEND_PORT${NC}"
    fi
    if [ -d "$AI_ENV_DIR" ]; then
        echo -e "${BLUE}└── AI Service:             http://localhost:$AI_SERVICE_PORT${NC}"
    fi
    echo ""
    echo -e "${GREEN}🚀 Platform is ready for use!${NC}"
}

# Stop function
stop_services() {
    log "🛑 Stopping all services..."

    # Kill processes by PID files
    if [ -f "logs/google-sheets-backend.pid" ]; then
        PID=$(cat logs/google-sheets-backend.pid)
        kill $PID 2>/dev/null || true
        rm -f logs/google-sheets-backend.pid
    fi

    if [ -f "logs/google-sheets-frontend.pid" ]; then
        PID=$(cat logs/google-sheets-frontend.pid)
        kill $PID 2>/dev/null || true
        rm -f logs/google-sheets-frontend.pid
    fi

    if [ -f "logs/mia-frontend.pid" ]; then
        PID=$(cat logs/mia-frontend.pid)
        kill $PID 2>/dev/null || true
        rm -f logs/mia-frontend.pid
    fi

    if [ -f "logs/ai-service.pid" ]; then
        PID=$(cat logs/ai-service.pid)
        kill $PID 2>/dev/null || true
        rm -f logs/ai-service.pid
    fi

    # Kill by port as backup
    kill_port $GOOGLE_SHEETS_FRONTEND_PORT
    kill_port $GOOGLE_SHEETS_BACKEND_PORT
    kill_port $AI_SERVICE_PORT
    kill_port $MIA_FRONTEND_PORT

    log "✅ All services stopped"
}

# Status function
check_status() {
    log "📊 Checking service status..."
    echo ""

    # Check Google Sheets Backend
    if curl -f -s "http://localhost:$GOOGLE_SHEETS_BACKEND_PORT/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Google Sheets Backend (Port $GOOGLE_SHEETS_BACKEND_PORT): RUNNING${NC}"
    else
        echo -e "${RED}❌ Google Sheets Backend (Port $GOOGLE_SHEETS_BACKEND_PORT): STOPPED${NC}"
    fi

    # Check Google Sheets Frontend
    if curl -f -s "http://localhost:$GOOGLE_SHEETS_FRONTEND_PORT" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Google Sheets Frontend (Port $GOOGLE_SHEETS_FRONTEND_PORT): RUNNING${NC}"
    else
        echo -e "${RED}❌ Google Sheets Frontend (Port $GOOGLE_SHEETS_FRONTEND_PORT): STOPPED${NC}"
    fi

    # Check MIA Frontend
    if curl -f -s "http://localhost:$MIA_FRONTEND_PORT" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MIA Logistics Frontend (Port $MIA_FRONTEND_PORT): RUNNING${NC}"
    else
        echo -e "${RED}❌ MIA Logistics Frontend (Port $MIA_FRONTEND_PORT): STOPPED${NC}"
    fi

    # Check AI Service
    if curl -f -s "http://localhost:$AI_SERVICE_PORT/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ AI Service (Port $AI_SERVICE_PORT): RUNNING${NC}"
    else
        echo -e "${RED}❌ AI Service (Port $AI_SERVICE_PORT): STOPPED${NC}"
    fi

    echo ""
}

# Health check function
health_check() {
    log "🏥 Running comprehensive health checks..."
    echo ""

    # Health check details
    echo -e "${BLUE}Google Sheets Backend Health:${NC}"
    curl -s "http://localhost:$GOOGLE_SHEETS_BACKEND_PORT/api/health" | jq '.' 2>/dev/null || echo "Service not responding"
    echo ""

    echo -e "${BLUE}AI Service Health:${NC}"
    curl -s "http://localhost:$AI_SERVICE_PORT/health" | jq '.' 2>/dev/null || echo "Service not responding"
    echo ""

    # System resources
    echo -e "${BLUE}System Resources:${NC}"
    echo "CPU Usage: $(top -l 1 | grep "CPU usage" | awk '{print $3}' | tr -d '%')"
    echo "Memory Usage: $(vm_stat | grep "Pages active" | awk '{print int($3)*4/1024}')"MB
    echo "Disk Usage: $(df -h . | tail -1 | awk '{print $5}')"
    echo ""
}

# Logs function
show_logs() {
    log "📋 Showing recent service logs..."

    if [ -f "logs/google-sheets-backend.log" ]; then
        echo -e "${BLUE}=== Google Sheets Backend Logs ===${NC}"
        tail -20 logs/google-sheets-backend.log
        echo ""
    fi

    if [ -f "logs/google-sheets-frontend.log" ]; then
        echo -e "${BLUE}=== Google Sheets Frontend Logs ===${NC}"
        tail -20 logs/google-sheets-frontend.log
        echo ""
    fi

    if [ -f "logs/mia-frontend.log" ]; then
        echo -e "${BLUE}=== MIA Frontend Logs ===${NC}"
        tail -20 logs/mia-frontend.log
        echo ""
    fi

    if [ -f "logs/ai-service.log" ]; then
        echo -e "${BLUE}=== AI Service Logs ===${NC}"
        tail -20 logs/ai-service.log
        echo ""
    fi
}

# Create logs directory
mkdir -p logs

# Execute based on action
case $ACTION in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 5
        start_services
        ;;
    "status")
        check_status
        ;;
    "health")
        health_check
        ;;
    "logs")
        show_logs
        ;;
esac

log "Deployment script completed successfully! 🎉"
