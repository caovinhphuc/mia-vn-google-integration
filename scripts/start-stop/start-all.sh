#!/bin/bash

# 🚀 React OAS Integration v4.0 - Start All Services
# Start Frontend, Backend, AI Service, and Automation
#
# Python: ưu tiên ai-service/venv/bin/python (và tương tự) — không in mù `python3` trên PATH.
# Khi chưa có venv hoặc venv cũ dùng 3.14: PYTHON_BIN=python3.12 bash ai-service/setup_venv.sh --force

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
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

# Python dùng cho log / health: ưu tiên venv của service (không dùng mù `python3` trên PATH — hay là 3.14 beta).
# Ép phiên bản khi tạo venv: PYTHON_BIN=python3.12 bash ai-service/setup_venv.sh --force
probe_service_python() {
    if [ -x "ai-service/venv/bin/python" ]; then
        printf '%s' "ai-service/venv/bin/python"
    elif [ -x "one_automation_system/venv/bin/python" ]; then
        printf '%s' "one_automation_system/venv/bin/python"
    elif [ -x "automation/venv/bin/python" ]; then
        printf '%s' "automation/venv/bin/python"
    elif [ -n "${PYTHON_BIN:-}" ] && command -v "${PYTHON_BIN}" &>/dev/null; then
        command -v "${PYTHON_BIN}"
    else
        command -v python3 2>/dev/null || command -v python 2>/dev/null || true
    fi
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

    # Check port 8000 (AI Service) - Optional
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port 8000 is already in use. AI Service may fail to start."
    else
        print_success "Port 8000 available for AI Service ✅"
    fi

    # Check port 8001 (Automation) - Optional
    if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port 8001 is already in use. Automation may fail to start."
    else
        print_success "Port 8001 available for Automation ✅"
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

    # Python: hiển thị interpreter thực tế (venv nếu có), không chỉ `python3` trên PATH
    PY_PROBE="$(probe_service_python)"
    if [ -z "$PY_PROBE" ] || [ ! -x "$PY_PROBE" ]; then
        print_warning "Không tìm thấy Python (venv hoặc python3 trên PATH). AI / Automation có thể lỗi."
    else
        print_success "Python (probe): $($PY_PROBE --version) — $PY_PROBE ✅"
        if "$PY_PROBE" -c 'import sys; sys.exit(0 if sys.version_info < (3, 14) else 1)' 2>/dev/null; then
            :
        else
            print_warning "Python ≥3.14: nhiều thư viện chưa hỗ trợ ổn định. Khuyến nghị: PYTHON_BIN=python3.12 bash ai-service/setup_venv.sh --force (và venv one_automation_system/automation tương tự)."
        fi
    fi
    if command -v python3 &>/dev/null; then
        PATH_PY="$(command -v python3)"
        if [ -n "$PY_PROBE" ] && [ "$PATH_PY" != "$PY_PROBE" ]; then
            print_status "python3 trên PATH = $($PATH_PY --version) ($PATH_PY) — chỉ shell mặc định; AI/Automation dùng $PY_PROBE (dòng [SUCCESS] trên). Đổi mặc định terminal: pyenv local 3.11.x hoặc brew link python@3.11."
        fi
    fi

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "Frontend dependencies not installed. Run 'npm install' first."
    fi

    if [ ! -d "backend/node_modules" ]; then
        print_warning "Backend dependencies not installed. Run 'cd backend && npm install' first."
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

    # Start React development server
    npm start > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!

    print_success "Frontend started with PID: $FRONTEND_PID"
    echo "📱 Frontend URL: http://localhost:3000"
}

# Start backend server
start_backend() {
    print_status "Starting Backend (Node.js) on port 3001..."

    cd backend
    npm start > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..

    print_success "Backend started with PID: $BACKEND_PID"
    echo "🖥️  Backend URL: http://localhost:3001"
}

# Start AI Service (Optional)
start_ai_service() {
    if [ ! -d "ai-service" ]; then
        print_warning "AI Service directory not found. Skipping..."
        return 0
    fi

    print_status "Starting AI Service (FastAPI) on port 8000..."

    cd ai-service

    if [ -x "venv/bin/python" ]; then
        AI_PY="$(pwd)/venv/bin/python"
        print_status "AI Service dùng: $AI_PY ($("$AI_PY" --version))"
    elif [ -n "${PYTHON_BIN:-}" ] && command -v "${PYTHON_BIN}" &>/dev/null; then
        AI_PY="$(command -v "${PYTHON_BIN}")"
        print_warning "Không có ai-service/venv — dùng PYTHON_BIN=$AI_PY"
    else
        AI_PY="$(command -v python3 2>/dev/null || command -v python 2>/dev/null || true)"
        print_warning "Không có ai-service/venv — dùng PATH: $AI_PY"
    fi

    if [ -z "$AI_PY" ] || [ ! -x "$AI_PY" ]; then
        print_warning "Không tìm thấy Python. Bỏ qua AI Service."
        cd ..
        return 0
    fi

    if ! "$AI_PY" -c "import uvicorn" 2>/dev/null; then
        print_warning "uvicorn not found. AI Service may not work."
        cd ..
        return 0
    fi

    # Start using uvicorn (FastAPI)
    "$AI_PY" -m uvicorn main_simple:app --host 0.0.0.0 --port 8000 --reload > ../logs/ai-service.log 2>&1 &
    AI_SERVICE_PID=$!
    cd ..

    print_success "AI Service started with PID: $AI_SERVICE_PID"
    echo "🧠 AI Service URL: http://localhost:8000"
}

# Start automation service (Optional)
start_automation() {
    if [ ! -d "automation" ] && [ ! -d "one_automation_system" ]; then
        print_warning "Automation directory not found. Skipping..."
        return 0
    fi

    print_status "Starting Automation (Python) on port 8001..."

    # Try one_automation_system first
    if [ -d "one_automation_system" ]; then
        cd one_automation_system

        if [ -x "venv/bin/python" ]; then
            AUTO_PY="$(pwd)/venv/bin/python"
            print_status "Automation dùng: $AUTO_PY ($("$AUTO_PY" --version))"
        elif [ -x "../automation/venv/bin/python" ]; then
            AUTO_PY="$(cd .. && pwd)/automation/venv/bin/python"
            print_status "Automation dùng (từ automation/venv): $AUTO_PY ($("$AUTO_PY" --version))"
        elif [ -n "${PYTHON_BIN:-}" ] && command -v "${PYTHON_BIN}" &>/dev/null; then
            AUTO_PY="$(command -v "${PYTHON_BIN}")"
            print_warning "Không có venv one_automation/automation — dùng PYTHON_BIN=$AUTO_PY"
        else
            AUTO_PY="$(command -v python3 2>/dev/null || command -v python 2>/dev/null || true)"
            print_warning "Không có venv — dùng PATH: $AUTO_PY"
        fi

        # Check if main.py exists
        if [ ! -f "main.py" ]; then
            print_warning "main.py not found in one_automation_system/"
            cd ..
            return 0
        fi

        if [ -z "$AUTO_PY" ] || [ ! -x "$AUTO_PY" ]; then
            print_warning "Không tìm thấy Python. Bỏ qua Automation."
            cd ..
            return 0
        fi

        if ! "$AUTO_PY" -c "import uvicorn" 2>/dev/null; then
            print_warning "uvicorn not found. Automation service may not work."
            cd ..
            return 0
        fi

        # Biến Google / Telegram từ automation/.env (process uvicorn kế thừa env)
        if [ -f "../automation/.env" ]; then
            set -a
            # shellcheck disable=SC1091
            . "../automation/.env"
            set +a
            print_status "Loaded ../automation/.env into environment for Automation service"
        fi

        # Start using uvicorn (FastAPI)
        "$AUTO_PY" -m uvicorn main:app --host 0.0.0.0 --port 8001 > ../logs/automation.log 2>&1 &
        AUTOMATION_PID=$!
        cd ..

        print_success "Automation started with PID: $AUTOMATION_PID"
        echo "🤖 Automation URL: http://localhost:8001"
    fi
}

# Monitor services
monitor_services() {
    print_status "Monitoring services startup..."
    sleep 5

    # Check if processes are still running
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        print_success "Frontend is running ✅"
    else
        print_error "Frontend failed to start! Check logs/frontend.log"
    fi

    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        print_success "Backend is running ✅"
    else
        print_error "Backend failed to start! Check logs/backend.log"
    fi

    if [ ! -z "$AI_SERVICE_PID" ] && ps -p $AI_SERVICE_PID > /dev/null 2>&1; then
        print_success "AI Service is running ✅"
    fi

    if [ ! -z "$AUTOMATION_PID" ] && ps -p $AUTOMATION_PID > /dev/null 2>&1; then
        print_success "Automation is running ✅"
    fi
}

# Display final status
display_status() {
    echo ""
    echo "🎉 Development servers started successfully!"
    echo "================================================="
    echo "📱 Frontend:   http://localhost:3000"
    echo "🖥️  Backend:    http://localhost:3001"
    if [ ! -z "$AI_SERVICE_PID" ]; then
        echo "🧠 AI Service: http://localhost:8000"
    fi
    if [ ! -z "$AUTOMATION_PID" ]; then
        echo "🤖 Automation: http://localhost:8001"
    fi
    echo ""
    echo "📊 Process IDs:"
    echo "   Frontend:   $FRONTEND_PID"
    echo "   Backend:    $BACKEND_PID"
    if [ ! -z "$AI_SERVICE_PID" ]; then
        echo "   AI Service: $AI_SERVICE_PID"
    fi
    if [ ! -z "$AUTOMATION_PID" ]; then
        echo "   Automation: $AUTOMATION_PID"
    fi
    echo ""
    echo "📝 Logs available in:"
    echo "   Frontend:   logs/frontend.log"
    echo "   Backend:    logs/backend.log"
    if [ ! -z "$AI_SERVICE_PID" ]; then
        echo "   AI Service: logs/ai-service.log"
    fi
    if [ ! -z "$AUTOMATION_PID" ]; then
        echo "   Automation: logs/automation.log"
    fi
    echo ""
}

# Main execution
main() {
    echo "🚀 React OAS Integration v4.0 - Starting All Services"
    echo "================================================="
    echo ""

    check_directories
    check_ports
    check_dependencies
    create_logs
    cleanup_processes

    start_frontend
    sleep 3
    start_backend
    sleep 3
    start_ai_service
    sleep 3
    start_automation

    monitor_services
    display_status

    # Keep script running to show logs
    print_status "Press Ctrl+C to stop all services and exit"
    trap 'print_status "Stopping all services..."; kill $FRONTEND_PID $BACKEND_PID $AI_SERVICE_PID $AUTOMATION_PID 2>/dev/null; exit 0' INT

    # Follow logs
    tail -f logs/frontend.log logs/backend.log logs/ai-service.log logs/automation.log 2>/dev/null
}

# Run main function
main

