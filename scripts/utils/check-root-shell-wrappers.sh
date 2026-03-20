#!/bin/bash

# CI guard: selected root shell scripts must stay thin wrappers.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

ROOT_WRAPPERS=(
  "start.sh"
  "deploy.sh"
  "quick-deploy.sh"
  "deploy-vercel.sh"
  "deployVercel.sh"
  "deployNetlify.sh"
  "deployGCP.sh"
  "serve-build.sh"
  "production_deploy.sh"
  "quick_deploy.sh"
  "start_ai_platform.sh"
  "run_projects.sh"
  "start_data_flow.sh"
)

errors=0

check_wrapper() {
  local file="$1"

  if [ ! -f "$file" ]; then
    echo "❌ Missing wrapper: $file"
    errors=$((errors + 1))
    return
  fi

  # 1) Syntax check
  if ! bash -n "$file"; then
    echo "❌ Syntax error: $file"
    errors=$((errors + 1))
    return
  fi

  # 2) Must be short
  local lines
  lines=$(wc -l < "$file" | tr -d ' ')
  if [ "$lines" -gt 20 ]; then
    echo "❌ Wrapper too long ($lines lines): $file"
    errors=$((errors + 1))
  fi

  # 3) Must resolve SCRIPT_DIR and exec target
  if ! rg -q "SCRIPT_DIR=.*BASH_SOURCE" "$file"; then
    echo "❌ Missing SCRIPT_DIR resolver: $file"
    errors=$((errors + 1))
  fi

  if ! rg -q "^exec " "$file"; then
    echo "❌ Missing exec handoff: $file"
    errors=$((errors + 1))
  fi

  # 4) Should not contain heavy logic patterns in actual commands
  if rg -q "^[[:space:]]*(npm install|pip install|curl[[:space:]]|nohup[[:space:]]|lsof[[:space:]]|pkill[[:space:]]|kill -9[[:space:]])" "$file"; then
    echo "❌ Found non-wrapper logic pattern: $file"
    errors=$((errors + 1))
  fi
}

echo "🔎 Checking root wrapper scripts..."
for f in "${ROOT_WRAPPERS[@]}"; do
  check_wrapper "$f"
done

if [ "$errors" -ne 0 ]; then
  echo "❌ Root wrapper check failed ($errors issue(s))."
  exit 1
fi

echo "✅ Root wrapper check passed."
