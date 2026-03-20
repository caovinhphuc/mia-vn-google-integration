#!/bin/bash

# 📊 Organize Reports and Backups Script
# Tự động tổ chức các file reports và backups vào đúng thư mục

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# scripts/utils → repo root (2 cấp)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "📊 Organizing Reports and Backups..."
echo "===================================="
echo ""

# Create directory structure
print_status "Creating directory structure..."
mkdir -p reports/{email,telegram,health,build,performance,lighthouse,test-runs,log-analysis}
mkdir -p lighthouse-reports
mkdir -p backups/{scripts,automation,backend,ai-service,venv,package-json}
print_success "Directory structure created"

# Move email test reports
print_status "Organizing email test reports..."
find . -name "email-test-report-*.json" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/reports/*" \
    ! -path "*/venv/*" \
    -exec mv {} reports/email/ \; 2>/dev/null
EMAIL_COUNT=$(ls reports/email/*.json 2>/dev/null | wc -l | xargs)
print_success "Moved $EMAIL_COUNT email test reports"

# Move telegram test reports
print_status "Organizing telegram test reports..."
find . -name "telegram-test-report-*.json" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/reports/*" \
    ! -path "*/venv/*" \
    -exec mv {} reports/telegram/ \; 2>/dev/null
TELEGRAM_COUNT=$(ls reports/telegram/*.json 2>/dev/null | wc -l | xargs)
print_success "Moved $TELEGRAM_COUNT telegram test reports"

# Move health reports
print_status "Organizing health reports..."
find . -name "health-report-*.json" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/reports/*" \
    ! -path "*/venv/*" \
    -exec mv {} reports/health/ \; 2>/dev/null
HEALTH_COUNT=$(ls reports/health/*.json 2>/dev/null | wc -l | xargs)
print_success "Moved $HEALTH_COUNT health reports"

# Move test-all.js suite reports (test-report-<timestamp>.json) từ root → reports/test-runs/
print_status "Organizing test-all suite reports (test-report-*.json)..."
find . -maxdepth 1 -name "test-report-*.json" -type f \
    -exec mv {} reports/test-runs/ \; 2>/dev/null
TEST_RUN_COUNT=$(ls reports/test-runs/*.json 2>/dev/null | wc -l | xargs)
print_success "test-runs folder now has $TEST_RUN_COUNT JSON report(s) (includes any already there)"

# Move build reports
print_status "Organizing build reports..."
find . -name "*build*report*.json" -o -name "*bundle*report*.json" -o -name "*setup*report*.json" | \
    grep -v node_modules | grep -v ".git" | grep -v reports | grep -v venv | \
    while read f; do mv "$f" reports/build/ 2>/dev/null; done
BUILD_COUNT=$(ls reports/build/*.json 2>/dev/null | wc -l | xargs)
print_success "Moved $BUILD_COUNT build reports"

# Move performance reports
print_status "Organizing performance reports..."
find . -name "*performance*report*.json" -o -name "*performance-budget*.json" | \
    grep -v node_modules | grep -v ".git" | grep -v reports | grep -v venv | \
    while read f; do mv "$f" reports/performance/ 2>/dev/null; done
PERF_COUNT=$(ls reports/performance/*.json 2>/dev/null | wc -l | xargs)
print_success "Moved $PERF_COUNT performance reports"

# Move lighthouse reports
print_status "Organizing lighthouse reports..."
find . -name "*lighthouse*.json" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/reports/*" \
    ! -path "*/venv/*" | \
    while read f; do
        dir=$(dirname "$f" | sed 's|^\./||' | tr '/' '_')
        if [ "$dir" = "." ]; then dir="root"; fi
        mkdir -p "reports/lighthouse/$dir"
        mv "$f" "reports/lighthouse/$dir/" 2>/dev/null
    done
LIGHTHOUSE_COUNT=$(find reports/lighthouse -name "*.json" 2>/dev/null | wc -l | xargs)
print_success "Moved $LIGHTHOUSE_COUNT lighthouse reports"

# Lighthouse HTML ở root → lighthouse-reports/
# - run-lighthouse.sh: lighthouse-report-*.html
# - Lighthouse CLI mặc định theo URL: <host>_YYYY-MM-DD_HH-MM-SS.report.html
print_status "Organizing Lighthouse HTML reports (root → lighthouse-reports/)..."
find . -maxdepth 1 \( -name "lighthouse-report*.html" -o -name "lighthouse-report.html" \) -type f \
    -exec mv {} lighthouse-reports/ \; 2>/dev/null
find . -maxdepth 1 -name "*.report.html" -type f \
    -exec mv {} lighthouse-reports/ \; 2>/dev/null
LH_HTML_COUNT=$(find lighthouse-reports -maxdepth 1 -name "*.html" 2>/dev/null | wc -l | xargs)
print_success "lighthouse-reports/ có $LH_HTML_COUNT file HTML (maxdepth 1)"

# Log analyzer JSON (root → reports/log-analysis/)
print_status "Organizing log-analysis reports..."
find . -maxdepth 1 -name "log-analysis-*.json" -type f \
    -exec mv {} reports/log-analysis/ \; 2>/dev/null
LOG_ANALYSIS_COUNT=$(ls reports/log-analysis/*.json 2>/dev/null | wc -l | xargs)
print_success "reports/log-analysis/ có $LOG_ANALYSIS_COUNT file JSON"

# Move venv backups
print_status "Organizing venv backups..."
find . -name "*venv.backup*" -type d \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/backups/*" | \
    while read d; do mv "$d" backups/venv/ 2>/dev/null; done
VENV_BACKUP_COUNT=$(ls -d backups/venv/* 2>/dev/null | wc -l | xargs)
print_success "Moved $VENV_BACKUP_COUNT venv backups"

# Move package.json backups (root → backups/package-json/)
print_status "Organizing package.json backups..."
find . -maxdepth 1 -name "package.json.backup.*" -type f \
    -exec mv {} backups/package-json/ \; 2>/dev/null
PKG_JSON_BACKUP_COUNT=$(ls backups/package-json/package.json.backup.* 2>/dev/null | wc -l | xargs)
print_success "package-json backup folder has $PKG_JSON_BACKUP_COUNT file(s)"

# Summary
echo ""
echo "===================================="
print_success "✅ Organization complete!"
echo ""
echo "📊 Summary:"
echo "   Email reports:      $EMAIL_COUNT"
echo "   Telegram reports:   $TELEGRAM_COUNT"
echo "   Health reports:     $HEALTH_COUNT"
echo "   Test-all reports:   $TEST_RUN_COUNT"
echo "   Build reports:      $BUILD_COUNT"
echo "   Performance reports: $PERF_COUNT"
echo "   Lighthouse JSON:    $LIGHTHOUSE_COUNT"
echo "   Lighthouse HTML:    $LH_HTML_COUNT (trong lighthouse-reports/)"
echo "   Log analysis JSON:  $LOG_ANALYSIS_COUNT"
echo "   Venv backups:       $VENV_BACKUP_COUNT"
echo "   package.json backups: $PKG_JSON_BACKUP_COUNT"
echo ""
echo "📁 Reports: reports/ | Lighthouse HTML: lighthouse-reports/"
echo "💾 Backups location: backups/"
echo ""

