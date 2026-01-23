# 📚 HƯỚNG DẪN SỬ DỤNG SCRIPTS - React OAS Integration v4.0

> **Version**: 4.0
> **Ngày cập nhật**: 2025-01-27
> **Mục đích**: Hướng dẫn sử dụng các scripts trong dự án

---

## 📋 MỤC LỤC

1. [Setup Scripts](#1-setup-scripts)
2. [Start/Stop Scripts](#2-startstop-scripts)
3. [Deployment Scripts](#3-deployment-scripts)
4. [Fix/Troubleshooting Scripts](#4-fixtroubleshooting-scripts)
5. [Utility Scripts](#5-utility-scripts)
6. [Git Scripts](#6-git-scripts)
7. [Sub-projects Scripts](#7-sub-projects-scripts)

---

## 1️⃣ SETUP SCRIPTS

### 🎯 Setup chính (Root level)

#### `setup.sh`

**Mục đích**: Setup toàn bộ hệ thống
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./setup.sh
```

**Chức năng**:

- Kiểm tra system requirements
- Cài đặt dependencies
- Cấu hình môi trường
- Setup Python venv

---

#### `setup_ide.sh`

**Mục đích**: Setup IDE (VSCode, etc.)
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./setup_ide.sh
```

---

#### `setup-https.sh`

**Mục đích**: Setup HTTPS certificates
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./setup-https.sh
```

---

### 📁 Setup trong scripts/

#### `scripts/setup.sh`

**Mục đích**: Setup script trong scripts folder
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/setup.sh
```

---

#### `scripts/install.sh`

**Mục đích**: Install dependencies
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/install.sh
```

---

#### `scripts/verify-setup.sh`

**Mục đích**: Verify setup đã đúng chưa
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/verify-setup.sh
```

---

## 2️⃣ START/STOP SCRIPTS

### 🚀 Start Scripts

#### `start_dev_servers.sh` ⭐ **KHUYẾN NGHỊ**

**Mục đích**: Start tất cả development servers
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./start_dev_servers.sh
```

**Chức năng**:

- Start Frontend (Port 3000)
- Start Backend (Port 3001)
- Start AI Service (Port 8000) - Optional
- Start Automation (Port 8001) - Optional

**Output**:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- AI Service: http://localhost:8000
- Automation: http://localhost:8001

---

#### `deploy_platform.sh` ⭐ **KHUYẾN NGHỊ**

**Mục đích**: Deploy platform với start/stop/restart
**Chạy từ**: Root directory
**Cách dùng**:

```bash
# Start all services
./deploy_platform.sh start

# Stop all services
./deploy_platform.sh stop

# Restart all services
./deploy_platform.sh restart
```

---

#### `start_ai_platform.sh` ⚠️ **CẦN CẬP NHẬT**

**Mục đích**: Start AI platform (v3.0 - cần cập nhật)
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./start_ai_platform.sh
```

**Lưu ý**: Script này vẫn nói v3.0, cần cập nhật

---

#### `start_data_flow.sh`

**Mục đích**: Start data flow
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./start_data_flow.sh
```

---

### 📁 Start trong scripts/

#### `scripts/start_all.sh`

**Mục đích**: Start all services
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/start_all.sh
```

---

#### `scripts/start_backend.sh` hoặc `scripts/start-backend.sh`

**Mục đích**: Start backend only
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/start_backend.sh
# hoặc
./scripts/start-backend.sh
```

**Lưu ý**: Có 2 scripts tương tự, nên gộp lại

---

#### `scripts/stop_all.sh`

**Mục đích**: Stop all services
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/stop_all.sh
```

---

## 3️⃣ DEPLOYMENT SCRIPTS

### 🚀 Deployment chính

#### `deploy.sh` ⭐ **KHUYẾN NGHỊ**

**Mục đích**: Deploy lên Netlify + Render
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./deploy.sh "Commit message"
# hoặc
./deploy.sh  # Sẽ prompt cho commit message
```

**Chức năng**:

- Build frontend
- Commit changes
- Push to GitHub
- Auto-deploy to Netlify (Frontend)
- Auto-deploy to Render (Backend)

---

#### `deploy-production.sh` ⭐ **KHUYẾN NGHỊ**

**Mục đích**: Production deployment
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./deploy-production.sh
```

**Chức năng**:

- System requirements check
- Clean install
- Lint check
- Build optimization
- Deploy to production

---

#### `quick-deploy.sh` ⭐ **KHUYẾN NGHỊ**

**Mục đích**: Quick deploy lên Vercel + Railway
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./quick-deploy.sh "Commit message"
# hoặc
./quick-deploy.sh  # Sẽ dùng default message
```

**Lưu ý**: Có `quick_deploy.sh` (underscore) - nên gộp lại

---

#### `deploy-vercel.sh` hoặc `deployVercel.sh`

**Mục đích**: Deploy chỉ lên Vercel
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./deploy-vercel.sh
# hoặc
./deployVercel.sh
```

**Lưu ý**: Có 2 scripts tương tự, nên gộp lại

---

#### `deployNetlify.sh`

**Mục đích**: Deploy lên Netlify
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./deployNetlify.sh
```

---

#### `deployGCP.sh`

**Mục đích**: Deploy lên Google Cloud Platform
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./deployGCP.sh
```

---

#### `serve-build.sh`

**Mục đích**: Serve production build locally
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./serve-build.sh
# hoặc
./serve-build.sh 8080  # Custom port
```

---

## 4️⃣ FIX/TROUBLESHOOTING SCRIPTS

### 🔧 Fix Scripts

#### `scripts/fix-port-conflict.sh`

**Mục đích**: Fix port conflicts
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/fix-port-conflict.sh
```

---

#### `scripts/fix-chunk-errors.sh`

**Mục đích**: Fix chunk errors
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/fix-chunk-errors.sh
```

---

#### `fix-chunk-error.sh` (Root level)

**Mục đích**: Fix chunk error (singular)
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./fix-chunk-error.sh
```

**Lưu ý**: Có thể trùng với `scripts/fix-chunk-errors.sh`

---

#### `scripts/fix-api-connection.sh`

**Mục đích**: Fix API connection issues
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/fix-api-connection.sh
```

---

#### `scripts/fix-automation-path.sh`

**Mục đích**: Fix automation path issues
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/fix-automation-path.sh
```

---

#### `fix-branch-sync.sh`

**Mục đích**: Fix branch sync issues
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./fix-branch-sync.sh
```

---

#### `fix-missing-files.sh`

**Mục đích**: Fix missing files
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./fix-missing-files.sh
```

---

## 5️⃣ UTILITY SCRIPTS

### 🛠️ Utility Scripts

#### `scripts/check-ports.sh`

**Mục đích**: Check port availability
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/check-ports.sh
```

---

#### `scripts/check-env.sh`

**Mục đích**: Check environment variables
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/check-env.sh
```

**Lưu ý**: Có `scripts/check-env copy.sh` - nên xóa

---

#### `scripts/check-backend.sh`

**Mục đích**: Check backend health
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/check-backend.sh
```

---

#### `scripts/kill-port.sh`

**Mục đích**: Kill process on port
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/kill-port.sh 3000
```

---

#### `verify_port_config.sh`

**Mục đích**: Verify port configuration
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./verify_port_config.sh
```

---

#### `securityAudit.sh`

**Mục đích**: Security audit
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./securityAudit.sh
```

---

## 6️⃣ GIT SCRIPTS

### 📝 Git Operations

#### `sync-to-main.sh`

**Mục đích**: Sync branch to main
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./sync-to-main.sh
```

---

#### `create-repo-and-push.sh`

**Mục đích**: Create repo and push
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./create-repo-and-push.sh
```

---

#### `scripts/push_to_github.sh`

**Mục đích**: Push to GitHub
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/push_to_github.sh
```

---

#### `scripts/prepare_github_repo.sh`

**Mục đích**: Prepare GitHub repo
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/prepare_github_repo.sh
```

---

#### `scripts/setup-github.sh`

**Mục đích**: Setup GitHub
**Chạy từ**: Root directory
**Cách dùng**:

```bash
./scripts/setup-github.sh
```

**Lưu ý**: Có `scripts/setup-github copy.sh` - nên xóa

---

## 7️⃣ SUB-PROJECTS SCRIPTS

### 🤖 Automation

#### `automation/start.sh`

**Mục đích**: Start automation
**Chạy từ**: Root directory hoặc `automation/`
**Cách dùng**:

```bash
./automation/start.sh
# hoặc
cd automation && ./start.sh
```

---

#### `automation/setup.sh`

**Mục đích**: Setup automation
**Chạy từ**: Root directory hoặc `automation/`
**Cách dùng**:

```bash
./automation/setup.sh
# hoặc
cd automation && ./setup.sh
```

---

### 🧠 AI Service

#### `ai-service/setup_venv.sh`

**Mục đích**: Setup Python virtual environment
**Chạy từ**: Root directory hoặc `ai-service/`
**Cách dùng**:

```bash
./ai-service/setup_venv.sh
# hoặc
cd ai-service && ./setup_venv.sh
```

---

### 🛒 MIA Logistics Manager

#### `mia-logistics-manager/start-mia.sh`

**Mục đích**: Start MIA Logistics Manager
**Chạy từ**: Root directory hoặc `mia-logistics-manager/`
**Cách dùng**:

```bash
./mia-logistics-manager/start-mia.sh
# hoặc
cd mia-logistics-manager && ./start-mia.sh
```

---

### 📊 Google Sheets Project

#### `google-sheets-project/start.sh`

**Mục đích**: Start Google Sheets project
**Chạy từ**: Root directory hoặc `google-sheets-project/`
**Cách dùng**:

```bash
./google-sheets-project/start.sh
# hoặc
cd google-sheets-project && ./start.sh
```

---

## 🎯 QUICK REFERENCE

### ⚡ Development Workflow

```bash
# 1. Setup lần đầu
./setup.sh

# 2. Start development servers
./start_dev_servers.sh
# hoặc
./deploy_platform.sh start

# 3. Stop servers
./deploy_platform.sh stop
# hoặc
./scripts/stop_all.sh
```

---

### 🚀 Deployment Workflow

```bash
# Quick deploy (Vercel + Railway)
./quick-deploy.sh "Your commit message"

# Production deploy
./deploy-production.sh

# Deploy to specific platform
./deploy-vercel.sh
./deployNetlify.sh
./deployGCP.sh
```

---

### 🔧 Troubleshooting

```bash
# Check ports
./scripts/check-ports.sh

# Fix port conflicts
./scripts/fix-port-conflict.sh

# Check backend
./scripts/check-backend.sh

# Verify setup
./scripts/verify-setup.sh
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Chạy từ đâu?

- **Hầu hết scripts**: Chạy từ **Root directory**
- **Sub-projects scripts**: Có thể chạy từ root hoặc trong thư mục sub-project

### 2. Permissions

Một số scripts cần quyền execute:

```bash
chmod +x script-name.sh
```

### 3. Environment Variables

Một số scripts cần environment variables. Kiểm tra:

```bash
./scripts/check-env.sh
```

### 4. Ports

Đảm bảo ports không bị conflict:

```bash
./scripts/check-ports.sh
```

---

## 📝 RECOMMENDATIONS

### Scripts nên sử dụng (Khuyến nghị):

1. **Setup**: `./setup.sh`
2. **Start**: `./start_dev_servers.sh` hoặc `./deploy_platform.sh start`
3. **Deploy**: `./deploy.sh` hoặc `./quick-deploy.sh`
4. **Production**: `./deploy-production.sh`
5. **Troubleshooting**: `./scripts/check-ports.sh`, `./scripts/fix-port-conflict.sh`

### Scripts cần cập nhật:

1. `start_ai_platform.sh` - Cần cập nhật từ v3.0 → v4.0
2. Các scripts trùng lặp - Nên gộp lại

### Scripts có thể xóa:

1. `scripts/check-env copy.sh`
2. `scripts/setup-github copy.sh`
3. `quick_deploy.sh` (nếu có `quick-deploy.sh`)
4. Các scripts duplicate khác

---

## 🔗 LIÊN KẾT

- [SCRIPTS_ANALYSIS.md](./SCRIPTS_ANALYSIS.md) - Phân tích chi tiết
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Hướng dẫn deployment
- [README.md](./README.md) - Tổng quan dự án

---

**Last Updated**: 2025-01-27
**Version**: 4.0
