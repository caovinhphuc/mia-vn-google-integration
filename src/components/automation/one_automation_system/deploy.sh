#!/bin/bash

# =============================================================================
# ONE AUTOMATION SYSTEM - DEPLOYMENT SCRIPT
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="one-automation-system"
BACKUP_DIR="backups"
DEPLOY_ENV=${1:-production}

echo -e "${BLUE}🚀 ONE Automation System - Deployment Script${NC}"
echo -e "${BLUE}=================================================${NC}"
echo -e "Environment: ${YELLOW}${DEPLOY_ENV}${NC}"
echo ""

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warn "Đang chạy với quyền root. Khuyến nghị sử dụng user thường."
        read -p "Tiếp tục? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check system requirements
check_requirements() {
    log_info "Kiểm tra system requirements..."

    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 không được cài đặt"
        exit 1
    fi

    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        log_info "✅ Docker đã được cài đặt"
        DOCKER_AVAILABLE=true
    else
        log_warn "Docker chưa được cài đặt (tùy chọn)"
        DOCKER_AVAILABLE=false
    fi

    # Check git
    if ! command -v git &> /dev/null; then
        log_warn "Git chưa được cài đặt"
    fi
}

# Create backup
create_backup() {
    if [ -d "data" ] || [ -d "logs" ] || [ -d "reports" ]; then
        log_info "Tạo backup dữ liệu..."

        mkdir -p $BACKUP_DIR
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"

        tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
            --exclude='venv' \
            --exclude='__pycache__' \
            --exclude='*.pyc' \
            data/ logs/ reports/ config/ 2>/dev/null || true

        log_info "✅ Backup tạo tại: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
    fi
}

# Setup environment
setup_environment() {
    log_info "Thiết lập môi trường..."

    # Create virtual environment if not exists
    if [ ! -d "venv" ]; then
        log_info "Tạo Python virtual environment..."
        python3 -m venv venv
    fi

    # Activate virtual environment
    source venv/bin/activate

    # Upgrade pip
    pip install --upgrade pip

    # Install requirements
    log_info "Cài đặt Python dependencies..."
    pip install -r requirements.txt

    # Create directories
    mkdir -p data logs reports config

    log_info "✅ Môi trường đã được thiết lập"
}

# Setup configuration
setup_config() {
    log_info "Thiết lập cấu hình..."

    # Check if .env exists
    if [ ! -f ".env" ]; then
        if [ -f "env_template.txt" ]; then
            log_warn "File .env chưa tồn tại"
            cp env_template.txt .env
            log_info "✅ Đã tạo .env từ template"
            log_warn "⚠️  Vui lòng chỉnh sửa file .env với thông tin thực tế"
        else
            log_error "Không tìm thấy env_template.txt"
            exit 1
        fi
    fi

    # Set permissions
    chmod 600 .env
    chmod +x *.sh

    log_info "✅ Cấu hình đã được thiết lập"
}

# Test system
test_system() {
    log_info "Chạy system tests..."

    if [ -f "run_tests.py" ]; then
        python run_tests.py
        if [ $? -eq 0 ]; then
            log_info "✅ System tests passed"
        else
            log_error "❌ System tests failed"
            exit 1
        fi
    else
        log_warn "Không tìm thấy run_tests.py, bỏ qua tests"
    fi
}

# Deploy with Docker
deploy_docker() {
    log_info "Triển khai với Docker..."

    if [ "$DOCKER_AVAILABLE" = true ]; then
        # Build image
        log_info "Building Docker image..."
        docker build -t $PROJECT_NAME:latest .

        # Stop existing container
        docker stop $PROJECT_NAME 2>/dev/null || true
        docker rm $PROJECT_NAME 2>/dev/null || true

        # Run with docker-compose if available
        if [ -f "docker-compose.yml" ]; then
            log_info "Sử dụng Docker Compose..."
            docker-compose down
            docker-compose up -d
        else
            # Run standalone container
            docker run -d \
                --name $PROJECT_NAME \
                --restart unless-stopped \
                -v $(pwd)/data:/app/data \
                -v $(pwd)/logs:/app/logs \
                -v $(pwd)/reports:/app/reports \
                -v $(pwd)/config:/app/config \
                --env-file .env \
                $PROJECT_NAME:latest
        fi

        log_info "✅ Docker deployment hoàn thành"
    else
        log_error "Docker không khả dụng"
        exit 1
    fi
}

# Deploy traditional
deploy_traditional() {
    log_info "Triển khai truyền thống..."

    # Setup systemd service (if systemd available)
    if command -v systemctl &> /dev/null; then
        setup_systemd_service
    fi

    # Start the application
    log_info "Khởi động ứng dụng..."

    # Kill existing processes
    pkill -f "python.*automation.py" || true

    # Start in background
    nohup python automation.py --schedule > logs/automation.log 2>&1 &

    log_info "✅ Ứng dụng đã được khởi động"
}

# Setup systemd service
setup_systemd_service() {
    log_info "Thiết lập systemd service..."

    SERVICE_FILE="/etc/systemd/system/one-automation.service"

    # Create service file
    sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=ONE Automation System
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/venv/bin/python $(pwd)/automation.py --schedule
Restart=always
RestartSec=10
Environment=PATH=$(pwd)/venv/bin
EnvironmentFile=$(pwd)/.env

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable one-automation.service

    log_info "✅ Systemd service đã được thiết lập"
    log_info "Sử dụng: sudo systemctl start/stop/status one-automation"
}

# Main deployment flow
main() {
    echo -e "${BLUE}Bắt đầu quá trình deployment...${NC}"

    check_root
    check_requirements
    create_backup
    setup_environment
    setup_config
    test_system

    # Choose deployment method
    if [ "$DEPLOY_ENV" = "docker" ] && [ "$DOCKER_AVAILABLE" = true ]; then
        deploy_docker
    else
        deploy_traditional
    fi

    echo ""
    echo -e "${GREEN}🎉 Deployment hoàn thành thành công!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo -e "📊 Dashboard: http://localhost:8080 (nếu sử dụng Docker)"
    echo -e "📁 Logs: $(pwd)/logs/"
    echo -e "📈 Reports: $(pwd)/reports/"
    echo ""
    echo -e "${YELLOW}Lệnh hữu ích:${NC}"
    echo -e "  • Xem logs: tail -f logs/automation.log"
    echo -e "  • Chạy một lần: python automation.py --run-once"
    echo -e "  • Tạo dashboard: python utils.py --dashboard"
    echo -e "  • Kiểm tra trạng thái: python utils.py --performance 7"
}

# Run main function
main "$@"
