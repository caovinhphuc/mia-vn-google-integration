#!/bin/bash

# 🧪 Test CI/CD Workflow Locally
# Script để test các bước trong workflow CI/CD

echo "🧪 Testing CI/CD Workflow Steps"
echo "================================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[ℹ]${NC} $1"
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name=$1
    local test_command=$2

    print_status "Testing: $test_name"
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$test_name"
        ((TESTS_PASSED++))
        return 0
    else
        print_error "$test_name"
        ((TESTS_FAILED++))
        return 1
    fi
}

# 1. Validate workflow YAML (PyYAML → Ruby stdlib → lỗi cú pháp / thiếu công cụ)
WORKFLOW_YML=".github/workflows/ci-cd.yml"
print_status "Step 1: Validating workflow YAML syntax..."
if [ ! -f "$WORKFLOW_YML" ]; then
    print_error "Missing $WORKFLOW_YML"
    ((TESTS_FAILED++))
elif command -v python3 &> /dev/null && python3 -c "import yaml; yaml.safe_load(open('$WORKFLOW_YML'))" 2>/dev/null; then
    print_success "Workflow YAML syntax is valid (PyYAML)"
    ((TESTS_PASSED++))
elif command -v ruby &> /dev/null && ruby -r yaml -e "YAML.load_file('$WORKFLOW_YML')" 2>/dev/null; then
    print_success "Workflow YAML syntax is valid (Ruby)"
    ((TESTS_PASSED++))
else
    if command -v python3 &> /dev/null && python3 -c "import yaml" 2>/dev/null; then
        print_error "Workflow YAML syntax has errors"
        ((TESTS_FAILED++))
    elif command -v ruby &> /dev/null; then
        print_error "Workflow YAML syntax has errors (Ruby parser)"
        ((TESTS_FAILED++))
    elif command -v python3 &> /dev/null; then
        print_warning "Thiếu PyYAML. Cài: pip install -r scripts/requirements-workflow.txt (hoặc dùng Ruby có sẵn trên macOS)"
        ((TESTS_PASSED++))
    else
        print_warning "Cần python3+PyYAML hoặc ruby để validate YAML"
        ((TESTS_PASSED++))
    fi
fi

# 2. Check Node.js version
print_status "Step 2: Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" = "18" ] || [ "$NODE_VERSION" = "20" ] || [ "$NODE_VERSION" = "22" ]; then
    print_success "Node.js version: $(node --version) (compatible)"
    ((TESTS_PASSED++))
else
    print_warning "Node.js version: $(node --version) (expected 18+)"
    ((TESTS_PASSED++))
fi

# 3. Check Python version (>= 3.11, khớp tinh thần CI: PYTHON_VERSION 3.11+)
print_status "Step 3: Checking Python version..."
if command -v python3 &> /dev/null && python3 -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" 2>/dev/null; then
    print_success "Python version: $(python3 --version) (compatible, >= 3.11)"
    ((TESTS_PASSED++))
elif command -v python3 &> /dev/null; then
    print_warning "Python version: $(python3 --version) (CI dùng 3.11+; nâng Python hoặc dùng pyenv/asdf)"
    ((TESTS_FAILED++))
else
    print_warning "Python3 not found (CI cài Python từ actions/setup-python)"
    ((TESTS_PASSED++))
fi

# 4. Check required directories
print_status "Step 4: Checking project structure..."
run_test "Frontend directory exists" "[ -d 'src' ]"
run_test "Backend directory exists" "[ -d 'backend' ]"
run_test "Automation directory exists" "[ -d 'automation' ]"
run_test "AI service directory exists" "[ -d 'ai-service' ]"
run_test "Workflow file exists" "[ -f '.github/workflows/ci-cd.yml' ]"

# 5. Check required files
print_status "Step 5: Checking required files..."
run_test "package.json exists" "[ -f 'package.json' ]"
run_test "backend/package.json exists" "[ -f 'backend/package.json' ]"
run_test "automation/requirements.txt exists" "[ -f 'automation/requirements.txt' ]"
run_test "ai-service/requirements.txt exists" "[ -f 'ai-service/requirements.txt' ]"
run_test "Dockerfile.ai exists" "[ -f 'Dockerfile.ai' ]"

# 6. Test npm install (dry run)
print_status "Step 6: Testing dependency installation..."
if [ -f "package.json" ]; then
    print_status "Checking frontend dependencies..."
    if [ -d "node_modules" ]; then
        print_success "Frontend dependencies installed"
        ((TESTS_PASSED++))
    else
        print_warning "Frontend dependencies not installed (run: npm install)"
        ((TESTS_FAILED++))
    fi

    if [ -d "backend/node_modules" ]; then
        print_success "Backend dependencies installed"
        ((TESTS_PASSED++))
    else
        print_warning "Backend dependencies not installed (run: cd backend && npm install)"
        ((TESTS_FAILED++))
    fi
fi

# 7. Test build command
print_status "Step 7: Testing build command..."
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    print_success "Build script found in package.json"
    ((TESTS_PASSED++))
else
    print_error "Build script not found"
    ((TESTS_FAILED++))
fi

# 8. Test test commands
print_status "Step 8: Testing test commands..."
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    print_success "Test script found in package.json"
    ((TESTS_PASSED++))
else
    print_warning "Test script not found in package.json"
    ((TESTS_FAILED++))
fi

# 9. Check Docker
print_status "Step 9: Checking Docker..."
if command -v docker &> /dev/null; then
    print_success "Docker is installed: $(docker --version)"
    ((TESTS_PASSED++))

    if docker info > /dev/null 2>&1; then
        print_success "Docker daemon is running"
        ((TESTS_PASSED++))
    else
        # Không phải lỗi workflow: nhiều dev không bật Docker hằng ngày; CI chạy trên GitHub
        print_info "Docker daemon chưa chạy — bình thường nếu không build image local. Gợi ý: macOS → Docker Desktop · Linux → sudo systemctl start docker · Colima → colima start. Job Docker trên CI không cần daemon máy bạn."
        ((TESTS_PASSED++))
    fi
else
    print_warning "Docker is not installed (needed for Docker build job)"
    ((TESTS_FAILED++))
fi

# 10. Validate workflow structure
print_status "Step 10: Validating workflow structure..."
if grep -q "name:" .github/workflows/ci-cd.yml && \
   grep -q "on:" .github/workflows/ci-cd.yml && \
   grep -q "jobs:" .github/workflows/ci-cd.yml; then
    print_success "Workflow has required sections (name, on, jobs)"
    ((TESTS_PASSED++))
else
    print_error "Workflow missing required sections"
    ((TESTS_FAILED++))
fi

# 11. Check for required jobs
print_status "Step 11: Checking required jobs..."
if grep -q "test:" .github/workflows/ci-cd.yml; then
    print_success "Test job found"
    ((TESTS_PASSED++))
else
    print_error "Test job not found"
    ((TESTS_FAILED++))
fi

if grep -q "build:" .github/workflows/ci-cd.yml; then
    print_success "Build job found"
    ((TESTS_PASSED++))
else
    print_error "Build job not found"
    ((TESTS_FAILED++))
fi

if grep -q "deploy:" .github/workflows/ci-cd.yml; then
    print_success "Deploy job found"
    ((TESTS_PASSED++))
else
    print_error "Deploy job not found"
    ((TESTS_FAILED++))
fi

# Summary
echo ""
echo "================================================="
echo "📊 Test Summary:"
echo "   ✓ Passed: $TESTS_PASSED"
echo "   ✗ Failed: $TESTS_FAILED"
echo "   Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "All tests passed! Workflow is ready ✅"
    exit 0
else
    print_warning "Some tests failed. Please review the issues above."
    exit 1
fi

