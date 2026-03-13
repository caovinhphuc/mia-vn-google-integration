# 🚀 Deployment Guide - React OAS Integration v4.0

## 📋 Tổng quan

Dự án có nhiều cách deployment khác nhau tùy theo môi trường và nhu cầu.

---

## 🎯 Quick Start

### 1️⃣ Development (Local)

```bash
# Chạy development server
npm start

# Hoặc chạy full stack
./deploy_platform.sh start
```

**Truy cập:**

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:3001>
- AI Service: <http://localhost:8000>

---

### 2️⃣ Production Build (Local)

```bash
# Build và deploy local
./deploy-production.sh

# Serve build
npm run serve:deployed
# hoặc
./serve-build.sh 3000
```

**Truy cập:** <http://localhost:3000>

**Build location:** `~/Sites/mia-vn-integration`

---

### 3️⃣ Cloud Deployment (Vercel + Railway)

```bash
# Deploy lên cloud (tự động commit + push + deploy)
./quick-deploy.sh "Your commit message"

# Hoặc chỉ deploy Vercel
./deploy-vercel.sh
```

**Truy cập:**

- Frontend: <https://your-app.vercel.app>
- Backend: <https://your-app.railway.app>

---

## 📂 Deployment Scripts

### `deploy-production.sh` - Production Build

**Mục đích:** Build và deploy production-ready application

**Tính năng:**

- ✅ System requirements check
- ✅ Clean install dependencies
- ✅ Lint check (ESLint)
- ✅ Build optimization
- ✅ OS-aware deployment (macOS/Linux)
- ✅ Deployment verification

**Sử dụng:**

```bash
./deploy-production.sh
```

**Output (macOS):**

- Build directory: `./build`
- Deploy directory: `~/Sites/mia-vn-integration`
- Không cần sudo

**Output (Linux):**

- Build directory: `./build`
- Deploy directory: `/opt/mia-vn-integration`
- Setup nginx
- Cần sudo

---

### `deploy_platform.sh` - Local Full Stack

**Mục đích:** Deploy tất cả services local (Frontend + Backend + AI)

**Tính năng:**

- ✅ Port management (3000, 3001, 8000)
- ✅ Kill existing processes
- ✅ Start all services
- ✅ Health checks

**Sử dụng:**

```bash
# Start all services
./deploy_platform.sh start

# Stop all services
./deploy_platform.sh stop

# Restart all services
./deploy_platform.sh restart
```

---

### `quick-deploy.sh` - Cloud Deployment

**Mục đích:** Commit + Deploy nhanh lên Vercel + Railway

**Tính năng:**

- ✅ Auto commit changes
- ✅ Push to GitHub
- ✅ Deploy frontend to Vercel
- ✅ Deploy backend to Railway
- ✅ Handle secret scanning errors

**Sử dụng:**

```bash
# Deploy với commit message mặc định
./quick-deploy.sh

# Deploy với custom commit message
./quick-deploy.sh "🎨 Update UI design"
```

---

### `deploy-vercel.sh` - Vercel Only

**Mục đích:** Deploy chỉ frontend lên Vercel

**Tính năng:**

- ✅ Check prerequisites
- ✅ Install Vercel CLI
- ✅ Build application
- ✅ Deploy to Vercel
- ✅ Environment variables setup

**Sử dụng:**

```bash
./deploy-vercel.sh
```

---

### Git Deployment Workflow

**Mục đích:** Commit và push code lên GitHub

**Tính năng:**

- ✅ Auto-format và lint trước khi commit (Husky)
- ✅ Pull latest changes trước khi push
- ✅ Resolve merge conflicts
- ✅ Push to GitHub

**Sử dụng:**

```bash
# Add và commit changes
git add .
git commit -m "Your commit message"
# Pre-commit hook sẽ tự động chạy lint-staged

# Pull latest changes
git pull origin main --no-rebase

# Resolve conflicts nếu có, rồi commit
git add .
git commit -m "Merge: Resolve conflicts"

# Push to GitHub
git push origin main
```

**Note:** Pre-commit hook đã được cấu hình với Husky và lint-staged để tự động format và lint code.

---

### `serve-build.sh` - Serve Production Build

**Mục đích:** Serve production build locally

**Tính năng:**

- ✅ Auto-detect server tool (npx, Python)
- ✅ Custom port
- ✅ Custom build directory

**Sử dụng:**

```bash
# Serve trên port 3000 (default)
./serve-build.sh

# Serve trên port custom
./serve-build.sh 8080

# Serve từ directory custom
./serve-build.sh 8080 /path/to/build
```

---

## 🛠️ NPM Scripts

### Development

```bash
npm start              # Start development server
npm run dev            # Start full stack (Frontend + Backend + AI)
npm run backend        # Start backend only
npm run ai-service     # Start AI service only
```

### Build

```bash
npm run build          # Build for production
npm run build:prod     # Build for production (alias)
```

### Serve

```bash
npm run serve:build     # Serve ./build directory
npm run serve:deployed  # Serve deployed build
```

### Testing

```bash
npm test                    # Run tests
npm run lint               # Run ESLint
npm run lint:check         # Check linting (no warnings)
npm run lint:fix           # Auto-fix linting issues
npm run format             # Format code with Prettier
npm run format:check       # Check code formatting
```

### Utilities

```bash
npm run fix:ports          # Fix port conflicts
npm run kill:port          # Kill process on port
npm run check:ports        # Check port availability
npm run check:backend      # Check backend health
npm run verify:setup       # Verify project setup
```

---

## 🌐 Deployment Targets

### Local Development

- **Frontend:** <http://localhost:3000>
- **Backend:** <http://localhost:3001>
- **AI Service:** <http://localhost:8000>

### Local Production Build

- **Location:** `~/Sites/mia-vn-integration`
- **Access:** <http://localhost:3000> (with serve)

### Cloud (Vercel + Railway)

- **Frontend:** <https://your-app.vercel.app>
- **Backend:** <https://your-app.railway.app>

### Production Server (VPS/Linux)

- **Location:** `/opt/mia-vn-integration`
- **Nginx:** Port 80
- **Access:** <http://your-domain.com>

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000

# Kill process on port
npm run kill:port 3000

# Or use the script
./scripts/fix-port-conflict.sh
```

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### Deployment Errors

```bash
# Check logs
cat logs/frontend.log
cat logs/backend.log
cat logs/ai-service.log

# Verify setup
npm run verify:setup
```

### Git Issues

**Issue: Git Remote Not Found**

```bash
# Add remote origin
git remote add origin https://github.com/caovinhphuc/React-OAS-Integration-v4.0.git

# Verify
git remote -v
```

**Issue: Non-Fast-Forward Push**

```bash
# Pull latest changes first
git pull origin main --no-rebase

# Resolve conflicts if any
git add .
git commit -m "Merge: Resolve conflicts"

# Push again
git push origin main
```

**Issue: Prettier EACCES Error (Pre-commit Hook)**

- ✅ Đã fix: Cấu hình `.lintstagedrc.json` sử dụng `npx prettier` thay vì `prettier`

---

## 📝 Environment Variables

### Frontend (.env)

```bash
PORT=3000
REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_AI_SERVICE_URL=http://localhost:8000
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

### Backend (backend/.env)

```bash
PORT=3001
NODE_ENV=development
```

---

## 🎯 Recommended Workflow

### Development

1. Start services: `./deploy_platform.sh start`
2. Develop and test
3. Stop services: `./deploy_platform.sh stop`

### Testing Production Build

1. Build: `./deploy-production.sh`
2. Serve: `npm run serve:deployed`
3. Test at <http://localhost:3000>

### Deploy to Cloud

1. Test locally first
2. Commit changes:

   ```bash
   git add .
   git commit -m "message"
   # Pre-commit hook tự động chạy lint-staged
   ```

3. Pull latest:

   ```bash
   git pull origin main --no-rebase
   ```

4. Push to GitHub:

   ```bash
   git push origin main
   ```

5. Deploy: `./quick-deploy.sh "Deploy message"`

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment)

---

## 🆘 Support

Nếu gặp vấn đề, kiểm tra:

1. Logs trong thư mục `logs/`
2. Port conflicts với `npm run check:ports`
3. Backend health với `npm run check:backend`
4. Environment variables trong `.env`

---

**Last Updated:** January 21, 2026
**Version:** 4.0
**Status:** ✅ **Complete & Verified**
**Recent Updates:**

- ✅ Git remote origin configured
- ✅ Pre-commit hooks with Husky & lint-staged
- ✅ Prettier EACCES error fixed
- ✅ Git deployment workflow added
