# 🚀 ONE Automation System - Production Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deployment](#quick-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Traditional Deployment](#traditional-deployment)
5. [Configuration](#configuration)
6. [Security](#security)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

## 🔧 Prerequisites

### System Requirements

- **OS**: Linux (Ubuntu 20.04+), macOS (10.15+), or Windows 10+
- **Python**: 3.9+ (3.11 recommended)
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: Minimum 10GB free space
- **Network**: Internet connection for automation tasks

### Software Dependencies

```bash
# Required
- Python 3.9+
- Google Chrome browser
- Git (optional)

# Optional (for Docker deployment)
- Docker 20.10+
- Docker Compose 2.0+
```

### Credentials Required

- ONE system username and password
- Email credentials (for notifications)
- Optional: Slack webhook URL
- Optional: Telegram bot token

## ⚡ Quick Deployment

### 1. Clone and Setup

```bash
# Clone repository
git clone <repository-url>
cd one-automation-system

# Make scripts executable
chmod +x *.sh

# Run automated setup
./setup.sh
```

### 2. Configure Environment

```bash
# Copy production environment template
cp env.production .env

# Edit with your credentials
nano .env
```

### 3. Deploy

```bash
# Production deployment
./deploy-production.sh

# Or Docker deployment
./deploy-production.sh docker
```

## 🐳 Docker Deployment

### Prerequisites

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Deployment Steps

#### 1. Environment Setup

```bash
# Copy environment template
cp env.production .env

# Edit configuration
nano .env
```

#### 2. Build and Deploy

```bash
# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### 3. Verify Deployment

```bash
# Check health
curl http://localhost:8080/health

# Check status
curl http://localhost:8080/status

# View dashboard
open http://localhost:8080
```

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| one-automation | - | Main automation service |
| web-interface | 8000 | Web API interface |
| monitoring | 8080 | Nginx monitoring dashboard |
| redis | 6379 | Cache service (optional) |

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f one-automation

# Update services
docker-compose pull
docker-compose up -d

# Clean up
docker-compose down -v
docker system prune -a
```

## 🖥️ Traditional Deployment

### 1. System Setup

```bash
# Create user (recommended)
sudo useradd -m -s /bin/bash automation
sudo usermod -aG sudo automation
su - automation

# Create application directory
mkdir -p /opt/one-automation
cd /opt/one-automation
```

### 2. Install Dependencies

```bash
# Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install Chrome (Ubuntu/Debian)
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google.list
sudo apt-get update
sudo apt-get install google-chrome-stable
```

### 3. Configure and Deploy

```bash
# Copy configuration
cp env.production .env
nano .env

# Create directories
mkdir -p data logs reports config backups

# Deploy
./deploy-production.sh
```

### 4. Systemd Service

The deployment script automatically creates a systemd service:

```bash
# Service management
sudo systemctl start one-automation
sudo systemctl stop one-automation
sudo systemctl restart one-automation
sudo systemctl status one-automation

# Enable auto-start
sudo systemctl enable one-automation

# View logs
sudo journalctl -u one-automation -f
```

## ⚙️ Configuration

### Environment Variables

Key configuration variables in `.env`:

```bash
# System credentials
ONE_USERNAME=your_username
ONE_PASSWORD=your_password

# Email notifications
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_TO=admin@company.com

# Performance settings
MEMORY_LIMIT=2G
CPU_LIMIT=1.0
BATCH_SIZE=50

# Security settings
ENCRYPT_LOGS=true
ENCRYPT_DATA=true
RATE_LIMITING_ENABLED=true

# Monitoring
HEALTH_CHECK_INTERVAL=30
ALERTING_ENABLED=true
DASHBOARD_ENABLED=true
```

### Configuration Files

| File | Purpose |
|------|---------|
| `config/config.json` | Main configuration |
| `config/production.json` | Production settings |
| `.env` | Environment variables |
| `nginx.conf` | Web server configuration |

### Feature Flags

Enable/disable features in `.env`:

```bash
FEATURE_WEB_INTERFACE=true
FEATURE_API_ENDPOINTS=true
FEATURE_DASHBOARD=true
FEATURE_MONITORING=true
FEATURE_ALERTING=true
FEATURE_BACKUP=true
```

## 🔒 Security

### Production Security Checklist

- [ ] Change default passwords
- [ ] Enable encryption for logs and data
- [ ] Configure firewall rules
- [ ] Set up SSL/TLS certificates
- [ ] Enable rate limiting
- [ ] Configure access control
- [ ] Set up monitoring and alerting
- [ ] Regular security updates

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8080/tcp  # Monitoring
sudo ufw allow 8000/tcp  # API (if external access needed)
sudo ufw enable

# iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### SSL/TLS Setup

```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot --nginx -d your-domain.com

# Or self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/automation.key \
  -out /etc/ssl/certs/automation.crt
```

## 📊 Monitoring

### Health Checks

```bash
# Manual health check
./monitor.sh

# Specific checks
./monitor.sh --check process
./monitor.sh --check disk
./monitor.sh --check memory

# Generate report
./monitor.sh --report
```

### Monitoring Endpoints

| Endpoint | Description |
|----------|-------------|
| `http://localhost:8080/health` | Health status |
| `http://localhost:8080/status` | System status |
| `http://localhost:8080/reports/` | Reports dashboard |

### Log Monitoring

```bash
# View real-time logs
tail -f logs/automation.log

# Search for errors
grep -i "error\|exception\|failed" logs/automation.log

# Log rotation
logrotate -f /etc/logrotate.d/one-automation
```

### Performance Monitoring

```bash
# System resources
htop
iotop
nethogs

# Docker resources
docker stats

# Application metrics
python utils.py --performance 7
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Chrome/ChromeDriver Issues

```bash
# Check Chrome version
google-chrome --version

# Update ChromeDriver
pip install --upgrade webdriver-manager

# Test browser
python -c "from selenium import webdriver; driver = webdriver.Chrome(); print('Chrome OK'); driver.quit()"
```

#### 2. Permission Issues

```bash
# Fix file permissions
chmod +x *.sh
chmod 600 .env
chmod 755 data logs reports config

# Fix ownership
sudo chown -R automation:automation /opt/one-automation
```

#### 3. Memory Issues

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Increase swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. Network Issues

```bash
# Test connectivity
curl -I https://one.tga.com.vn
ping google.com

# Check DNS
nslookup one.tga.com.vn
dig one.tga.com.vn
```

#### 5. Docker Issues

```bash
# Check Docker status
docker --version
docker-compose --version

# Clean up Docker
docker system prune -a
docker volume prune

# Restart Docker
sudo systemctl restart docker
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=DEBUG

# Run with verbose output
python automation.py --run-once --verbose

# Test mode
export TEST_MODE=true
python automation.py --run-once
```

### Log Analysis

```bash
# Error analysis
grep -i "error" logs/automation.log | tail -20

# Performance analysis
grep "duration" logs/automation.log | tail -20

# Success rate
grep -c "success" logs/automation.log
grep -c "failed" logs/automation.log
```

## 🔧 Maintenance

### Regular Maintenance Tasks

#### Daily
- [ ] Check system health: `./monitor.sh`
- [ ] Review error logs
- [ ] Verify automation success rate

#### Weekly
- [ ] Review performance metrics
- [ ] Check disk space usage
- [ ] Update system packages
- [ ] Backup configuration

#### Monthly
- [ ] Security updates
- [ ] Log rotation and cleanup
- [ ] Performance optimization
- [ ] Disaster recovery test

### Backup and Recovery

#### Automated Backup

```bash
# Configure backup in .env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Manual backup
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz data/ logs/ reports/ config/ .env
```

#### Recovery

```bash
# Restore from backup
tar -xzf backup_20240101_120000.tar.gz

# Restore Docker volumes
docker run --rm -v automation-data:/data -v $(pwd):/backup alpine tar -xzf /backup/backup.tar.gz -C /data
```

### Updates and Upgrades

#### Application Updates

```bash
# Pull latest changes
git pull origin main

# Update dependencies
pip install -r requirements.txt --upgrade

# Restart services
docker-compose restart
# or
sudo systemctl restart one-automation
```

#### System Updates

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade

# CentOS/RHEL
sudo yum update

# Restart if kernel updated
sudo reboot
```

### Performance Optimization

#### System Optimization

```bash
# Optimize system parameters
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Application Optimization

```bash
# Adjust batch size
export BATCH_SIZE=100

# Increase memory limit
export MEMORY_LIMIT=4G

# Enable caching
export CACHE_ENABLED=true
export REDIS_ENABLED=true
```

## 📞 Support

### Getting Help

1. **Check logs**: `tail -f logs/automation.log`
2. **Run health check**: `./monitor.sh`
3. **Review documentation**: `README.md`
4. **Check issues**: GitHub Issues
5. **Contact support**: support@company.com

### Useful Commands

```bash
# Quick status check
./monitor.sh --check process

# Generate system report
./monitor.sh --report

# View recent logs
tail -100 logs/automation.log

# Check Docker status
docker-compose ps

# View system resources
htop
df -h
free -h
```

### Emergency Procedures

#### Service Down

```bash
# Restart automation
sudo systemctl restart one-automation

# Or Docker
docker-compose restart one-automation

# Check status
sudo systemctl status one-automation
```

#### Data Recovery

```bash
# Restore from latest backup
ls -la backups/
tar -xzf backups/backup_latest.tar.gz

# Restart services
sudo systemctl restart one-automation
```

#### Complete Rebuild

```bash
# Stop all services
docker-compose down -v

# Clean up
docker system prune -a

# Redeploy
./deploy-production.sh docker
```

---

## 📝 Notes

- Always test in staging environment before production deployment
- Keep backups of configuration and data
- Monitor system resources regularly
- Update dependencies and security patches
- Document any custom configurations
- Train team members on maintenance procedures

**Last Updated**: $(date)
**Version**: 1.0.0
