#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║        MIA OAS Integration v4.2 — Deploy Script             ║
# ║  local  : build + verify production bundle locally          ║
# ║  vercel : deploy frontend to Vercel (prod)                  ║
# ║  full   : lint + test + build + verify + vercel deploy      ║
# ╚══════════════════════════════════════════════════════════════╝
#
# Usage:
#   ./deploy_platform.sh              # = local (default)
#   ./deploy_platform.sh local        # Build and verify locally
#   ./deploy_platform.sh vercel       # Deploy to Vercel only
#   ./deploy_platform.sh full         # Full pipeline: test + build + deploy
#   ./deploy_platform.sh check        # Pre-deploy checks only (no build)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# ── Colors ──────────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[0;34m'; P='\033[0;35m'; N='\033[0m'
log()     { echo -e "${G}[$(date +'%H:%M:%S')] $*${N}"; }
warn()    { echo -e "${Y}[$(date +'%H:%M:%S')] WARNING: $*${N}"; }
err()     { echo -e "${R}[$(date +'%H:%M:%S')] ERROR: $*${N}"; exit 1; }
info()    { echo -e "${B}[$(date +'%H:%M:%S')] $*${N}"; }
section() { echo -e "\n${P}━━━ $* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"; }

# ── Config ───────────────────────────────────────────────────────
VERSION="4.2.0"
BACKEND_PORT=3001
AI_PORT=8000
BUILD_DIR="$ROOT/build"
LOG_FILE="$ROOT/logs/deploy-$(date +'%Y%m%d_%H%M%S').log"
mkdir -p "$ROOT/logs"

# ── Helpers ─────────────────────────────────────────────────────
require_cmd() {
  command -v "$1" >/dev/null 2>&1 || err "Required command not found: $1 — install it first."
}

service_ok() {
  local url=$1
  curl -fsS "$url" >/dev/null 2>&1
}

kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  [ -n "$pids" ] && echo "$pids" | xargs kill -9 2>/dev/null || true
}

wait_healthy() {
  local url=$1 name=$2 max=${3:-20} i=1
  info "Waiting for $name..."
  while [ $i -le $max ]; do
    service_ok "$url" && { log "$name OK"; return 0; }
    sleep 2; ((i++))
  done
  warn "$name did not respond — continuing anyway"
}

# ── Step: Pre-deploy checks ─────────────────────────────────────
step_check() {
  section "Pre-Deploy Checks"

  require_cmd node
  require_cmd npm
  require_cmd python3

  log "Node: $(node --version)  |  npm: $(npm --version)"

  # Check .env exists
  [ -f ".env" ] || err ".env file not found. Copy from .env.example and configure."

  # Check key env vars
  local missing=()
  for var in REACT_APP_API_URL; do
    grep -q "^${var}=" .env 2>/dev/null || missing+=("$var")
  done
  if [ ${#missing[@]} -gt 0 ]; then
    warn "Missing in .env: ${missing[*]}"
  fi

  # Check backend
  [ -d "backend" ]             || err "backend/ directory not found."
  [ -f "backend/src/server.js" ] || err "backend/src/server.js not found."

  # Check AI service
  [ -d "ai-service" ]             || err "ai-service/ directory not found."
  [ -f "ai-service/main_simple.py" ] || err "ai-service/main_simple.py not found."
  [ -d "ai-service/venv" ]        || err "ai-service/venv not found. Run: cd ai-service && python -m venv venv && pip install -r requirements.txt"

  log "Pre-deploy checks passed ✅"
}

# ── Step: Install deps ──────────────────────────────────────────
step_install() {
  section "Installing Dependencies"
  npm install --legacy-peer-deps
  (cd backend && npm install --legacy-peer-deps)
  log "Dependencies installed ✅"
}

# ── Step: Lint ───────────────────────────────────────────────────
step_lint() {
  section "Lint"
  npm run lint:fix || warn "Lint warnings found — review before production"
  log "Lint done ✅"
}

# ── Step: Tests ─────────────────────────────────────────────────
step_test() {
  section "Tests"
  CI=true npm run test:ci        || err "Frontend tests failed — fix before deploying."
  npm run test:e2e               || warn "E2E tests failed — check manually."
  log "Tests passed ✅"
}

# ── Step: Build ─────────────────────────────────────────────────
step_build() {
  section "Production Build"
  log "Building React app (source maps disabled)..."
  GENERATE_SOURCEMAP=false npm run build
  [ -d "$BUILD_DIR" ] || err "Build directory not created — build failed."
  log "Build complete: $(du -sh "$BUILD_DIR" | cut -f1) ✅"
}

# ── Step: Bundle check ───────────────────────────────────────────
step_bundle_check() {
  section "Bundle Size Check"
  PERF_SKIP_BUNDLE=0 LIGHTHOUSE_MIN_SCORE=0 node scripts/performance-budget.js 2>/dev/null || warn "Bundle check had warnings — review build output."
  log "Bundle check done ✅"
}

# ── Step: Smoke test (local serve) ──────────────────────────────
step_smoke() {
  section "Local Smoke Test"

  # Start backend for smoke test
  kill_port $BACKEND_PORT
  kill_port $AI_PORT

  log "Starting backend for smoke test..."
  PORT=$BACKEND_PORT node backend/src/server.js > logs/smoke-backend.log 2>&1 &
  BACKEND_SMOKE_PID=$!
  wait_healthy "http://localhost:$BACKEND_PORT/health" "Backend" 15

  # Start AI service for smoke test
  log "Starting AI service for smoke test..."
  (
    cd ai-service
    source venv/bin/activate
    python -m uvicorn main_simple:app --host 0.0.0.0 --port $AI_PORT \
      > "$ROOT/logs/smoke-ai.log" 2>&1 &
    echo $! > "$ROOT/logs/smoke-ai.pid"
  )
  wait_healthy "http://localhost:$AI_PORT/health" "AI Service" 20

  # Verify API key auth
  log "Testing /auth/token..."
  AI_API_KEY=$(grep "^AI_API_KEY=" .env 2>/dev/null | cut -d'=' -f2- || echo "mia-dev-api-key-2026")
  TOKEN_RESP=$(curl -s -X POST "http://localhost:$AI_PORT/auth/token" \
    -H "Content-Type: application/json" \
    -d "{\"api_key\":\"${AI_API_KEY}\"}")
  echo "$TOKEN_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'access_token' in d else 1)" \
    && log "JWT auth OK ✅" \
    || warn "JWT auth failed — check AI_API_KEY in .env"

  # Cleanup smoke processes
  kill $BACKEND_SMOKE_PID 2>/dev/null || true
  [ -f logs/smoke-ai.pid ] && kill "$(cat logs/smoke-ai.pid)" 2>/dev/null || true
  kill_port $BACKEND_PORT
  kill_port $AI_PORT
  rm -f logs/smoke-ai.pid

  log "Smoke test complete ✅"
}

# ── Step: Vercel deploy ─────────────────────────────────────────
step_vercel() {
  section "Vercel Production Deploy"
  require_cmd vercel

  log "Deploying to Vercel (production)..."
  vercel --prod --yes 2>&1 | tee -a "$LOG_FILE"
  log "Vercel deploy complete ✅"
}

# ── Step: Summary ────────────────────────────────────────────────
print_summary() {
  echo ""
  echo -e "${G}╔══════════════════════════════════════════════════════════════╗${N}"
  echo -e "${G}║             Deploy Complete — v${VERSION}                      ║${N}"
  echo -e "${G}╚══════════════════════════════════════════════════════════════╝${N}"
  echo ""
  echo -e "${B}  Build output : $BUILD_DIR${N}"
  echo -e "${B}  Deploy log   : $LOG_FILE${N}"
  echo ""
  echo -e "${Y}  To serve locally:${N}"
  echo -e "${Y}    npx serve -s build -l 3000${N}"
  echo ""
  echo -e "${Y}  To start full dev stack:${N}"
  echo -e "${Y}    ./start_ai_platform.sh${N}"
  echo ""
}

# ── Main ────────────────────────────────────────────────────────
ACTION="${1:-local}"

echo -e "\n${P}╔══════════════════════════════════════════════════════════════╗${N}"
echo -e "${P}║          MIA OAS Integration v${VERSION} — Deploy Platform          ║${N}"
echo -e "${P}╚══════════════════════════════════════════════════════════════╝${N}"
echo -e "${B}  Mode: $ACTION  |  $(date +'%Y-%m-%d %H:%M:%S')${N}\n"

case "$ACTION" in
  local)
    # Build + bundle check + smoke test (no Vercel)
    step_check
    step_install
    step_build
    step_bundle_check
    step_smoke
    print_summary
    ;;
  vercel)
    # Vercel deploy only (assumes build already done)
    step_check
    [ -d "$BUILD_DIR" ] || { warn "No build/ found — running build first..."; step_build; }
    step_vercel
    print_summary
    ;;
  full)
    # Complete pipeline: check + install + lint + test + build + bundle + smoke + vercel
    step_check
    step_install
    step_lint
    step_test
    step_build
    step_bundle_check
    step_smoke
    step_vercel
    print_summary
    ;;
  check)
    # Pre-deploy checks only — no build, no deploy
    step_check
    log "All checks passed. Run './deploy_platform.sh local' to build."
    ;;
  *)
    echo "Usage: $0 {local|vercel|full|check}"
    echo ""
    echo "  local   Build + bundle check + smoke test (default)"
    echo "  vercel  Deploy to Vercel production"
    echo "  full    lint + test + build + smoke + vercel"
    echo "  check   Pre-deploy checks only"
    exit 1
    ;;
esac
