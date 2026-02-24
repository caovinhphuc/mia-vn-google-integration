#!/bin/bash

# 🚀 React OAS Integration - Development Servers Startup Script (v2.0)
# Optimized version with improved error handling and monitoring

echo "🚀 Starting React OAS Integration Development Servers (v2.0)"
echo "================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required directories exist
check_directories() {
    print_status "Checking project structure..."

    if [ ! -d "src" ]; then
        print_error "Frontend src directory not found!"
        exit 1
    fi

    if [ ! -d "backend" ]; then
        print_error "Backend directory not found!"
        exit 1
    fi

    if [ ! -d "automation" ]; then
        print_error "Automation directory not found!"
        exit 1
    fi

    print_success "Project structure verified ✅"
}

# Check if ports are available
check_ports() {
    print_status "Checking port availability..."

    # Check port 3000 (Frontend)
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port 3000 is already in use. Frontend may fail to start."
    else
        print_success "Port 3000 available for Frontend ✅"
    fi

    # Check port 3001 (Backend)
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port 3001 is already in use. Backend may fail to start."
    else
        print_success "Port 3001 available for Backend ✅"
    fi
}

# Check dependencies
check_dependencies() {
    print_status "Checking dependencies..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        exit 1
    fi
    print_success "Node.js found: $(node --version) ✅"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
            exit 1
    fi
    print_success "npm found: $(npm --version) ✅"

    # Check Python (for automation)
    if ! command -v python3 &> /dev/null; then
        print_warning "Python3 not found. Automation service may not work."
    else
        print_success "Python3 found: $(python3 --version) ✅"
    fi

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "Frontend dependencies not installed. Run 'npm install' first."
    fi

    if [ ! -d "backend/node_modules" ]; then
        print_warning "Backend dependencies not installed. Run 'npm run backend:install' first."
    fi
}

# Create log directory
create_logs() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        print_status "Created logs directory"
    fi
}

# Kill existing processes
cleanup_processes() {
    print_status "Cleaning up existing processes..."

    # Kill processes on ports 3000, 3001, 8000, 8001
    for PORT in 3000 3001 8000 8001; do
        PIDS=$(lsof -ti:$PORT 2>/dev/null)
        if [ ! -z "$PIDS" ]; then
            print_warning "Port $PORT is in use. Killing processes..."
            for PID in $PIDS; do
                PROCESS=$(ps -p $PID -o command= 2>/dev/null)
                if echo "$PROCESS" | grep -qE "(react-scripts|node.*server|python.*main|uvicorn)"; then
                    print_status "Killing PID $PID on port $PORT"
                    kill -9 $PID 2>/dev/null || true
                fi
            done
        fi
    done

    # Kill by process name as fallback
    pkill -f "react-scripts start" 2>/dev/null || true
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "python.*main.py" 2>/dev/null || true
    pkill -f "uvicorn.*main" 2>/dev/null || true

    sleep 2

    # Verify ports are free
    for PORT in 3000 3001 8000 8001; do
        PIDS=$(lsof -ti:$PORT 2>/dev/null)
        if [ -z "$PIDS" ]; then
            print_success "Port $PORT is now free ✅"
        else
            print_warning "Port $PORT still in use (may need manual cleanup)"
        fi
    done

    print_success "Cleanup completed ✅"
}

# Start frontend server
start_frontend() {
    print_status "Starting Frontend (React) on port 3000..."
    cd "$(dirname "$0")"

    # Start React development server
    PORT=3000 BROWSER=none npm run start > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!

    print_success "Frontend started with PID: $FRONTEND_PID"
    echo "📱 Frontend URL: http://localhost:3000"
}

# Start backend server
start_backend() {
    print_status "Starting Backend (Node.js) on port 3001..."

    cd backend
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..

    print_success "Backend started with PID: $BACKEND_PID"
    echo "🖥️  Backend URL: http://localhost:3001"
}

# Start automation service
start_automation() {
    print_status "Starting Automation (Python)..."

    cd one_automation_system

    # Check if virtual environment exists
    if [ -d "venv" ]; then
        source venv/bin/activate
        print_status "Activated Python virtual environment"
    elif [ -d "../automation/venv" ]; then
        source ../automation/venv/bin/activate
        print_status "Activated Python virtual environment from automation folder"
    else
        print_warning "Python virtual environment not found. Using system Python."
    fi

    # Check if main.py exists
    if [ ! -f "main.py" ]; then
        print_error "main.py not found in one_automation_system/"
        print_error "Automation service cannot start!"
        cd ..
        return 1
    fi

    # Check if uvicorn is available
    if ! python -c "import uvicorn" 2>/dev/null; then
        print_warning "uvicorn not found. Installing..."
        pip install uvicorn fastapi > /dev/null 2>&1 || true
    fi

    # Check if python-dotenv is available
    if ! python -c "import dotenv" 2>/dev/null; then
        print_warning "python-dotenv not found. Installing..."
        pip install python-dotenv > /dev/null 2>&1 || true
    fi

    # Check Google Sheets dependencies
    if ! python -c "import gspread" 2>/dev/null; then
        print_warning "gspread not found. Installing Google Sheets dependencies..."
        pip install gspread google-auth google-auth-oauthlib google-auth-httplib2 > /dev/null 2>&1 || true
    fi

    # Check data processing dependencies
    if ! python -c "import pandas" 2>/dev/null; then
        print_warning "pandas not found. Installing data processing dependencies..."
        pip install pandas numpy openpyxl > /dev/null 2>&1 || true
    fi

    # Start using uvicorn (FastAPI)
    print_status "Starting FastAPI automation service on port 8001..."
    python -m uvicorn main:app --host 0.0.0.0 --port 8001 > ../logs/automation.log 2>&1 &
    AUTOMATION_PID=$!
    cd ..

    print_success "Automation started with PID: $AUTOMATION_PID"
    echo "🤖 Automation URL: http://localhost:8001"
}

# Monitor services
monitor_services() {
    print_status "Monitoring services startup..."
    sleep 5

    # Check if processes are still running
    if ps -p $FRONTEND_PID > /dev/null; then
        print_success "Frontend is running ✅"
    else
        print_error "Frontend failed to start! Check logs/frontend.log"
    fi

    if ps -p $BACKEND_PID > /dev/null; then
        print_success "Backend is running ✅"
    else
        print_error "Backend failed to start! Check logs/backend.log"
    fi

    if ps -p $AUTOMATION_PID > /dev/null; then
        print_success "Automation is running ✅"
    else
        print_error "Automation failed to start! Check logs/automation.log"
    fi
}

# Display final status
display_status() {
    echo ""
    echo "🎉 Development servers started successfully!"
    echo "================================================="
    echo "📱 Frontend:   http://localhost:3000"
    echo "🖥️  Backend:    http://localhost:3001"
    echo "🤖 Automation: Running in background"
    echo ""
    echo "📊 Process IDs:"
    echo "   Frontend:   $FRONTEND_PID"
    echo "   Backend:    $BACKEND_PID"
    echo "   Automation: $AUTOMATION_PID"
    echo ""
    echo "📝 Logs available in:"
    echo "   Frontend:   logs/frontend.log"
    echo "   Backend:    logs/backend.log"
    echo "   Automation: logs/automation.log"
    echo ""
}

# Main execution
main() {
    check_directories
    check_ports
    check_dependencies
    create_logs
    cleanup_processes

    start_frontend
    start_backend
    start_automation

    monitor_services
    display_status

    # Keep script running to show logs
    print_status "Press Ctrl+C to stop all services and exit"
    trap 'print_status "Stopping all services..."; kill $FRONTEND_PID $BACKEND_PID $AUTOMATION_PID 2>/dev/null; exit 0' INT

    # Follow logs
    tail -f logs/frontend.log logs/backend.log logs/automation.log
}

# Run main function
main
