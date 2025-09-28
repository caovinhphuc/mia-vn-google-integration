#!/bin/bash

# =============================================================================
# ONE AUTOMATION SYSTEM - PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Configuration
readonly PROJECT_NAME="one-automation-system"
readonly BACKUP_DIR="backups"
readonly DEPLOY_ENV=${1:-production}
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${CYAN}[DEBUG]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    fi
}

# Error handling
error_exit() {
    log_error "$1"
    exit 1
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    # Add cleanup logic here if needed
}

# Set trap for cleanup
trap cleanup EXIT

# Banner
show_banner() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                🚀 ONE AUTOMATION SYSTEM                     ║${NC}"
    echo -e "${CYAN}║              PRODUCTION DEPLOYMENT SCRIPT                   ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo -e "Environment: ${YELLOW}${DEPLOY_ENV}${NC}"
    echo -e "Timestamp: ${YELLOW}${TIMESTAMP}${NC}"
    echo ""
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."

    local missing_deps=()

    # Check Python
    if ! command -v python3 &> /dev/null; then
        missing_deps+=("python3")
    else
        local python_version=$(python3 --version | cut -d' ' -f2)
        log_info "✅ Python $python_version found"
    fi

    # Check Docker
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        log_info "✅ Docker $docker_version found"
        DOCKER_AVAILABLE=true
    else
        log_warn "Docker not found (optional)"
        DOCKER_AVAILABLE=false
    fi

    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        local compose_version=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        log_info "✅ Docker Compose $compose_version found"
        COMPOSE_AVAILABLE=true
    else
        log_warn "Docker Compose not found"
        COMPOSE_AVAILABLE=false
    fi

    # Check git
    if command -v git &> /dev/null; then
        log_info "✅ Git found"
    else
        log_warn "Git not found"
    fi

    # Check available disk space (minimum 2GB)
    local available_space=$(df . | tail -1 | awk '{print $4}')
    if [[ $available_space -lt 2097152 ]]; then  # 2GB in KB
        log_warn "Low disk space: $(($available_space / 1024 / 1024))GB available"
    else
        log_info "✅ Sufficient disk space available"
    fi

    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error_exit "Missing required dependencies: ${missing_deps[*]}"
    fi
}

# Security checks
security_checks() {
    log_info "Running security checks..."

    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        log_warn "Running as root user"
        if [[ "${FORCE_ROOT:-false}" != "true" ]]; then
            read -p "Continue as root? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                error_exit "Deployment cancelled"
            fi
        fi
    fi

    # Check file permissions
    if [[ -f ".env" ]]; then
        local env_perms=$(stat -c "%a" .env 2>/dev/null || stat -f "%A" .env 2>/dev/null)
        if [[ $env_perms -gt 600 ]]; then
            log_warn "Environment file has loose permissions ($env_perms)"
            chmod 600 .env
            log_info "Fixed .env permissions"
        fi
    fi

    # Check for sensitive data in logs
    if [[ -d "logs" ]]; then
        if grep -r -i "password\|secret\|key" logs/ 2>/dev/null | head -1; then
            log_warn "Potential sensitive data found in logs"
        fi
    fi

    log_info "✅ Security checks completed"
}

# Create backup
create_backup() {
    log_info "Creating backup..."

    mkdir -p "$BACKUP_DIR"
    local backup_name="backup_${TIMESTAMP}"

    # Create backup of important directories
    local backup_files=()
    [[ -d "data" ]] && backup_files+=("data")
    [[ -d "logs" ]] && backup_files+=("logs")
    [[ -d "reports" ]] && backup_files+=("reports")
    [[ -d "config" ]] && backup_files+=("config")
    [[ -f ".env" ]] && backup_files+=(".env")

    if [[ ${#backup_files[@]} -gt 0 ]]; then
        tar -czf "$BACKUP_DIR/${backup_name}.tar.gz" \
            --exclude='venv' \
            --exclude='__pycache__' \
            --exclude='*.pyc' \
            --exclude='.git' \
            "${backup_files[@]}" 2>/dev/null || true

        log_info "✅ Backup created: $BACKUP_DIR/${backup_name}.tar.gz"

        # Keep only last 5 backups
        ls -t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
    else
        log_warn "No data to backup"
    fi
}

# Setup environment
setup_environment() {
    log_info "Setting up environment..."

    # Create virtual environment if not exists
    if [[ ! -d "venv" ]]; then
        log_info "Creating Python virtual environment..."
        python3 -m venv venv
    fi

    # Activate virtual environment
    source venv/bin/activate

    # Upgrade pip
    pip install --upgrade pip

    # Install requirements
    log_info "Installing Python dependencies..."
    pip install -r requirements.txt

    # Create necessary directories
    mkdir -p data logs reports config backups

    # Set proper permissions
    chmod 755 data logs reports config backups
    chmod 600 .env 2>/dev/null || true
    chmod +x *.sh 2>/dev/null || true

    log_info "✅ Environment setup completed"
}

# Setup configuration
setup_config() {
    log_info "Setting up configuration..."

    # Check if .env exists
    if [[ ! -f ".env" ]]; then
        if [[ -f "env_template.txt" ]]; then
            log_warn "Environment file not found"
            cp env_template.txt .env
            log_info "✅ Created .env from template"
            log_warn "⚠️  Please edit .env with actual credentials"
            return 1
        else
            error_exit "No environment template found"
        fi
    fi

    # Validate required environment variables
    local required_vars=("ONE_USERNAME" "ONE_PASSWORD")
    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env || grep -q "^${var}=$" .env; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_warn "Missing or empty environment variables: ${missing_vars[*]}"
        log_warn "Please update .env file before deployment"
        return 1
    fi

    log_info "✅ Configuration validated"
}

# Run tests
run_tests() {
    log_info "Running system tests..."

    source venv/bin/activate

    # Run health check
    if [[ -f "health_check.py" ]]; then
        python health_check.py
        if [[ $? -eq 0 ]]; then
            log_info "✅ Health check passed"
        else
            log_warn "Health check failed"
        fi
    fi

    # Run automation tests
    if [[ -f "run_tests.py" ]]; then
        python run_tests.py
        if [[ $? -eq 0 ]]; then
            log_info "✅ System tests passed"
        else
            log_error "System tests failed"
            return 1
        fi
    else
        log_warn "No test suite found, skipping tests"
    fi
}

# Deploy with Docker
deploy_docker() {
    log_info "Deploying with Docker..."

    if [[ "$DOCKER_AVAILABLE" != "true" ]]; then
        error_exit "Docker not available"
    fi

    # Build image
    log_info "Building Docker image..."
    docker build -t "${PROJECT_NAME}:${TIMESTAMP}" .
    docker tag "${PROJECT_NAME}:${TIMESTAMP}" "${PROJECT_NAME}:latest"

    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down 2>/dev/null || true

    # Start new deployment
    log_info "Starting new deployment..."
    docker-compose up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    local max_attempts=30
    local attempt=0

    while [[ $attempt -lt $max_attempts ]]; do
        if docker-compose ps | grep -q "healthy\|Up"; then
            log_info "✅ Services are healthy"
            break
        fi
        sleep 2
        ((attempt++))
    done

    if [[ $attempt -eq $max_attempts ]]; then
        log_warn "Services may not be fully healthy"
    fi

    log_info "✅ Docker deployment completed"
}

# Deploy traditional
deploy_traditional() {
    log_info "Deploying traditional method..."

    source venv/bin/activate

    # Kill existing processes
    pkill -f "python.*automation.py" 2>/dev/null || true

    # Start application
    log_info "Starting application..."
    nohup python automation.py --schedule > logs/automation.log 2>&1 &
    local pid=$!

    # Wait a moment and check if process is running
    sleep 3
    if kill -0 $pid 2>/dev/null; then
        log_info "✅ Application started with PID: $pid"
    else
        error_exit "Failed to start application"
    fi

    # Setup systemd service if available
    if command -v systemctl &> /dev/null; then
        setup_systemd_service
    fi
}

# Setup systemd service
setup_systemd_service() {
    log_info "Setting up systemd service..."

    local service_file="/etc/systemd/system/one-automation.service"
    local current_dir=$(pwd)

    sudo tee "$service_file" > /dev/null <<EOF
[Unit]
Description=ONE Automation System
After=network.target
Wants=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$current_dir
ExecStart=$current_dir/venv/bin/python $current_dir/automation.py --schedule
Restart=always
RestartSec=10
Environment=PATH=$current_dir/venv/bin
EnvironmentFile=$current_dir/.env
StandardOutput=journal
StandardError=journal
SyslogIdentifier=one-automation

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable one-automation.service

    log_info "✅ Systemd service configured"
    log_info "Use: sudo systemctl start/stop/status one-automation"
}

# Post-deployment verification
verify_deployment() {
    log_info "Verifying deployment..."

    # Check if services are running
    if [[ "$DOCKER_AVAILABLE" == "true" && "$COMPOSE_AVAILABLE" == "true" ]]; then
        docker-compose ps
    else
        pgrep -f "python.*automation.py" > /dev/null && log_info "✅ Automation process is running"
    fi

    # Check log files
    if [[ -f "logs/automation.log" ]]; then
        log_info "✅ Log file exists"
        local log_size=$(wc -l < logs/automation.log)
        log_info "Log file has $log_size lines"
    fi

    # Check data directory
    if [[ -d "data" ]]; then
        local data_files=$(find data -type f | wc -l)
        log_info "✅ Data directory has $data_files files"
    fi

    log_info "✅ Deployment verification completed"
}

# Show deployment summary
show_summary() {
    echo ""
    echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo -e "Environment: ${YELLOW}${DEPLOY_ENV}${NC}"
    echo -e "Timestamp: ${YELLOW}${TIMESTAMP}${NC}"
    echo -e "Backup: ${YELLOW}${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz${NC}"
    echo ""

    if [[ "$DOCKER_AVAILABLE" == "true" && "$COMPOSE_AVAILABLE" == "true" ]]; then
        echo -e "${BLUE}🐳 Docker Services:${NC}"
        echo -e "  • Web Interface: http://localhost:8000"
        echo -e "  • Monitoring: http://localhost:8080"
        echo -e "  • Reports: http://localhost:8080/reports/"
    else
        echo -e "${BLUE}🖥️  Traditional Deployment:${NC}"
        echo -e "  • Logs: $(pwd)/logs/automation.log"
        echo -e "  • Data: $(pwd)/data/"
        echo -e "  • Reports: $(pwd)/reports/"
    fi

    echo ""
    echo -e "${YELLOW}📋 Useful Commands:${NC}"
    echo -e "  • View logs: tail -f logs/automation.log"
    echo -e "  • Run once: python automation.py --run-once"
    echo -e "  • Generate dashboard: python utils.py --dashboard"
    echo -e "  • Check performance: python utils.py --performance 7"
    echo -e "  • Health check: python health_check.py"

    if [[ "$DOCKER_AVAILABLE" == "true" && "$COMPOSE_AVAILABLE" == "true" ]]; then
        echo -e "  • View containers: docker-compose ps"
        echo -e "  • View logs: docker-compose logs -f"
        echo -e "  • Stop services: docker-compose down"
        echo -e "  • Restart services: docker-compose restart"
    fi

    echo ""
    echo -e "${CYAN}🔗 Quick Links:${NC}"
    echo -e "  • Dashboard: http://localhost:8080"
    echo -e "  • API Health: http://localhost:8080/health"
    echo -e "  • System Status: http://localhost:8080/status"
}

# Main deployment function
main() {
    show_banner

    # Pre-deployment checks
    check_requirements
    security_checks

    # Setup phase
    create_backup
    setup_environment

    # Configuration
    if ! setup_config; then
        log_error "Configuration setup failed"
        exit 1
    fi

    # Testing
    if ! run_tests; then
        log_error "Tests failed"
        exit 1
    fi

    # Deployment
    if [[ "$DEPLOY_ENV" == "docker" && "$DOCKER_AVAILABLE" == "true" && "$COMPOSE_AVAILABLE" == "true" ]]; then
        deploy_docker
    else
        deploy_traditional
    fi

    # Post-deployment
    verify_deployment
    show_summary
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [environment]"
        echo ""
        echo "Environments:"
        echo "  production  - Production deployment (default)"
        echo "  docker      - Docker-based deployment"
        echo "  staging     - Staging deployment"
        echo ""
        echo "Environment Variables:"
        echo "  DEBUG=true  - Enable debug output"
        echo "  FORCE_ROOT=true - Allow root user deployment"
        echo ""
        exit 0
        ;;
    --version|-v)
        echo "ONE Automation System - Production Deployment Script v1.0.0"
        exit 0
        ;;
esac

# Run main function
main "$@"
