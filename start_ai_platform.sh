#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║        MIA OAS Integration v4.2 — Quick Dev Start           ║
# ║   Khởi động: React :3000 | Backend :3001 | AI Service :8000 ║
# ╚══════════════════════════════════════════════════════════════╝
#
# Usage:
#   ./start_ai_platform.sh          # Start tất cả services
#   ./start_ai_platform.sh stop     # Dừng tất cả services
#   ./start_ai_platform.sh status   # Kiểm tra trạng thái
#   ./start_ai_platform.sh logs     # Xem logs gần nhất
#   ./start_ai_platform.sh restart  # Restart tất cả

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# ── Colors ──────────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'
log()  { echo -e "${G}[$(date +'%H:%M:%S')] $*${N}"; }
warn() { echo -e "${Y}[$(date +'%H:%M:%S')] ⚠  $*${N}"; }
err()  { echo -e "${R}[$(date +'%H:%M:%S')] ✗  $*${N}"; }
info() { echo -e "${B}[$(date +'%H:%M:%S')] ℹ  $*${N}"; }

# ── Ports ───────────────────────────────────────────────────────
FRONTEND_PORT=3000
BACKEND_PORT=3001
AI_PORT=8000

mkdir -p logs

# ── Helpers ─────────────────────────────────────────────────────
kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    warn "Killing existing process on port $port (PID $pids)"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

wait_healthy() {
  local url=$1 name=$2 max=${3:-20} i=1
  info "Waiting for $name ($url)..."
  while [ $i -le $max ]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      log "$name ready ✅"
      return 0
    fi
    sleep 2; ((i++))
  done
  err "$name did not respond after $((max * 2))s"
  return 1
}

check_status() {
  echo ""
  echo -e "${B}── Service Status ────────────────────────────────────${N}"
  for entry in \
    "React Frontend|http://localhost:$FRONTEND_PORT|$FRONTEND_PORT" \
    "Node.js Backend|http://localhost:$BACKEND_PORT/health|$BACKEND_PORT" \
    "AI Service|http://localhost:$AI_PORT/health|$AI_PORT"
  do
    IFS='|' read -r name url port <<< "$entry"
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo -e "  ${G}✅ $name (port $port): RUNNING${N}"
    else
      echo -e "  ${R}❌ $name (port $port): STOPPED${N}"
    fi
  done
  echo ""
}

stop_services() {
  log "Stopping all services..."
  kill_port $FRONTEND_PORT
  kill_port $BACKEND_PORT
  kill_port $AI_PORT
  # Clean up PID files
  rm -f logs/*.pid
  log "All services stopped ✅"
}

start_services() {
  echo ""
  echo -e "${G}╔══════════════════════════════════════════════════════════════╗${N}"
  echo -e "${G}║         MIA OAS Integration v4.2 — Starting Dev Stack        ║${N}"
  echo -e "${G}╚══════════════════════════════════════════════════════════════╝${N}"
  echo ""

  # ── Pre-flight checks ─────────────────────────────────────────
  info "Checking project structure..."
  [ -f "package.json" ]     || { err "package.json not found. Run from project root."; exit 1; }
  [ -d "backend" ]          || { err "backend/ directory not found."; exit 1; }
  [ -d "ai-service" ]       || { err "ai-service/ directory not found."; exit 1; }
  [ -d "ai-service/venv" ]  || { err "ai-service/venv not found. Run: cd ai-service && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"; exit 1; }
  log "Project structure OK ✅"

  # ── Load environment ──────────────────────────────────────────
  [ -f ".env" ] && source .env 2>/dev/null || true

  # ── Clear ports ───────────────────────────────────────────────
  info "Freeing ports $FRONTEND_PORT $BACKEND_PORT $AI_PORT..."
  kill_port $FRONTEND_PORT
  kill_port $BACKEND_PORT
  kill_port $AI_PORT

  # ── Install deps if needed ────────────────────────────────────
  if [ ! -d "node_modules" ]; then
    info "Installing root dependencies..."
    npm install --legacy-peer-deps
  fi
  if [ ! -d "backend/node_modules" ]; then
    info "Installing backend dependencies..."
    (cd backend && npm install --legacy-peer-deps)
  fi

  # ── 1. Node.js Backend (port 3001) ───────────────────────────
  log "Starting Node.js Backend on port $BACKEND_PORT..."
  PORT=$BACKEND_PORT nohup node backend/src/server.js \
    > logs/backend.log 2>&1 &
  echo $! > logs/backend.pid
  wait_healthy "http://localhost:$BACKEND_PORT/health" "Node.js Backend" 15

  # ── 2. AI Service — FastAPI (port 8000) ──────────────────────
  log "Starting AI Service (FastAPI) on port $AI_PORT..."
  (
    cd ai-service
    source venv/bin/activate
    PYTHONPATH="$ROOT/ai-service" \
    nohup python -m uvicorn main_simple:app \
      --host 0.0.0.0 --port $AI_PORT --reload \
      > "$ROOT/logs/ai-service.log" 2>&1 &
    echo $! > "$ROOT/logs/ai-service.pid"
  )
  wait_healthy "http://localhost:$AI_PORT/health" "AI Service" 20

  # ── 3. React Frontend (port 3000) ────────────────────────────
  log "Starting React Frontend on port $FRONTEND_PORT..."
  PORT=$FRONTEND_PORT BROWSER=none \
    nohup npm start > logs/frontend.log 2>&1 &
  echo $! > logs/frontend.pid
  wait_healthy "http://localhost:$FRONTEND_PORT" "React Frontend" 30

  # ── Summary ───────────────────────────────────────────────────
  echo ""
  echo -e "${G}╔══════════════════════════════════════════════════════════════╗${N}"
  echo -e "${G}║                   🚀 All Services Running                    ║${N}"
  echo -e "${G}╚══════════════════════════════════════════════════════════════╝${N}"
  echo ""
  echo -e "${B}  React Frontend   →  http://localhost:$FRONTEND_PORT${N}"
  echo -e "${B}  Node.js Backend  →  http://localhost:$BACKEND_PORT${N}"
  echo -e "${B}  AI Service       →  http://localhost:$AI_PORT   (docs: /docs)${N}"
  echo ""
  echo -e "${Y}  Logs: tail -f logs/frontend.log logs/backend.log logs/ai-service.log${N}"
  echo -e "${Y}  Stop: ./start_ai_platform.sh stop${N}"
  echo ""
}

# ── Main ────────────────────────────────────────────────────────
ACTION="${1:-start}"

case "$ACTION" in
  start)   start_services ;;
  stop)    stop_services ;;
  restart) stop_services; sleep 2; start_services ;;
  status)  check_status ;;
  logs)
    echo -e "${B}=== Backend (last 20 lines) ===${N}"
    tail -20 logs/backend.log 2>/dev/null || echo "(no log yet)"
    echo ""
    echo -e "${B}=== AI Service (last 20 lines) ===${N}"
    tail -20 logs/ai-service.log 2>/dev/null || echo "(no log yet)"
    echo ""
    echo -e "${B}=== Frontend (last 20 lines) ===${N}"
    tail -20 logs/frontend.log 2>/dev/null || echo "(no log yet)"
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs}"
    exit 1
    ;;
esac
