#!/bin/bash
# Compare files with default/source branch, then optionally sync missing/different files

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

CURRENT_BRANCH=$(git branch --show-current)
SOURCE_BRANCH="${1:-main}"

if git rev-parse --verify "$SOURCE_BRANCH" >/dev/null 2>&1; then
  SOURCE_REF="$SOURCE_BRANCH"
elif git rev-parse --verify "origin/$SOURCE_BRANCH" >/dev/null 2>&1; then
  SOURCE_REF="origin/$SOURCE_BRANCH"
else
  error "Không tìm thấy source branch: $SOURCE_BRANCH"
  echo "Dùng: $0 [source-branch]"
  exit 1
fi

echo -e "${BLUE}🔧 Fix Missing Files${NC}"
echo "Current branch : $CURRENT_BRANCH"
echo "Source branch  : $SOURCE_BRANCH"
echo "Compare ref    : $SOURCE_REF"

FILES=(
  "src/components/automation/AutomationDashboard.jsx"
  "src/components/automation/AutomationDashboard.css"
)

restored=0
staged=0

MISSING_FILES=()
DIFFERENT_FILES=()
OK_FILES=()
NOT_IN_SOURCE=()

echo ""
log "So sánh file với mặc định..."
for file in "${FILES[@]}"; do
  if ! git show "$SOURCE_REF:$file" >/dev/null 2>&1; then
    echo "⚠️  $file - KHÔNG TỒN TẠI TRÊN $SOURCE_REF"
    NOT_IN_SOURCE+=("$file")
    continue
  fi

  source_hash=$(git rev-parse "$SOURCE_REF:$file")

  if [ ! -f "$file" ]; then
    echo "❌ $file - MISSING (so với mặc định)"
    MISSING_FILES+=("$file")
  else
    local_hash=$(git hash-object "$file")
    if [ "$local_hash" = "$source_hash" ]; then
      echo "✅ $file - OK (khớp mặc định)"
      OK_FILES+=("$file")
    else
      echo "🟡 $file - DIFFERENT (khác mặc định)"
      DIFFERENT_FILES+=("$file")
    fi
  fi
done

echo ""
log "Summary: ok=${#OK_FILES[@]}, missing=${#MISSING_FILES[@]}, different=${#DIFFERENT_FILES[@]}, not_in_source=${#NOT_IN_SOURCE[@]}"

if [ ${#MISSING_FILES[@]} -eq 0 ] && [ ${#DIFFERENT_FILES[@]} -eq 0 ]; then
  warn "Không có file nào cần sync theo mặc định."
  exit 0
fi

echo ""
read -p "Bạn có muốn sync các file MISSING/DIFFERENT từ $SOURCE_REF không? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ACTION_FILES=("${MISSING_FILES[@]}" "${DIFFERENT_FILES[@]}")
  for file in "${ACTION_FILES[@]}"; do
    git checkout "$SOURCE_REF" -- "$file"
    git add "$file"
    restored=$((restored + 1))
    staged=$((staged + 1))
    echo "🛠️  Synced: $file"
  done

  echo ""
  log "Đã sync $restored file từ mặc định"

  if git diff --cached --quiet; then
    warn "Không có thay đổi nào để commit sau khi sync."
    exit 0
  fi

  echo ""
  read -p "Bạn có muốn commit và push các file đã sync không? (y/n): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "fix: sync critical automation files with $SOURCE_REF"
    git push origin "$CURRENT_BRANCH"
    log "Đã push lên branch: $CURRENT_BRANCH"
  else
    warn "Đã stage sẵn file synced. Bạn có thể tự commit/push sau."
  fi
else
  warn "Không sync. Chỉ report so sánh để bạn kiểm tra."
fi
