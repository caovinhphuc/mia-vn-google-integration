# 🏥 Health Check Guide

> **React OAS Integration v4.0**
> **Ngày cập nhật**: 2025-01-27

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Health Check Scripts ✅

- ✅ `scripts/health-check.js` - Full health check (Node.js)
- ✅ `scripts/utils/comprehensive-health-check.sh` - Comprehensive check (Shell)
- ✅ `scripts/health-check.cjs` - Alternative health check

### 2. NPM Scripts ✅

- ✅ `npm run health-check` - Full health check
- ✅ `npm run health:full` - Comprehensive check
- ✅ `npm run health:quick` - Quick check

---

## 🚀 CÁCH SỬ DỤNG

### Quick Health Check

```bash
# Quick check (curl)
npm run health:quick

# Output:
# ✅ All services healthy
# hoặc
# ❌ Some services down
```

### Full Health Check

```bash
# Full health check (Node.js)
npm run health-check

# Checks:
# - Environment variables
# - Google APIs
# - Email service
# - Telegram bot
# - Database connections
```

### Comprehensive Health Check

```bash
# Comprehensive check (Shell)
npm run health:full
# hoặc
./scripts/utils/comprehensive-health-check.sh

# Checks:
# - Dependencies (Node.js, npm, Python, Git)
# - Project structure
# - Port availability
# - Service health (Frontend, Backend, AI Service)
# - Environment variables
# - Build status
```

---

## 📋 HEALTH CHECK ENDPOINTS

### Services

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:3001/health`
- **AI Service**: `http://localhost:8000/health`
- **Automation**: `http://localhost:8001/health`

### Manual Checks

```bash
# Frontend
curl http://localhost:3000

# Backend
curl http://localhost:3001/health

# AI Service
curl http://localhost:8000/health

# Automation
curl http://localhost:8001/health
```

---

## 🔍 CHECKS PERFORMED

### 1. Dependencies

- ✅ Node.js version
- ✅ npm version
- ✅ Python 3 version
- ✅ Git version

### 2. Project Structure

- ✅ Frontend source directory
- ✅ Backend directory
- ✅ AI Service directory
- ✅ Automation directory
- ✅ package.json files

### 3. Port Availability

- ✅ Port 3000 (Frontend)
- ✅ Port 3001 (Backend)
- ✅ Port 8000 (AI Service)
- ✅ Port 8001 (Automation)

### 4. Service Health

- ✅ Frontend running
- ✅ Backend API responding
- ✅ AI Service responding
- ✅ Automation Service responding

### 5. Environment

- ✅ .env file exists
- ✅ Key environment variables configured

### 6. Build Status

- ✅ Frontend build directory
- ✅ Dependencies installed

---

## 📊 OUTPUT FORMAT

### Comprehensive Health Check Output

```
================================================================================
🏥 Comprehensive Health Check
================================================================================

📋 Dependencies
--------------------------------------------------------------------------------
✅ Node.js: v18.x.x
✅ npm: 9.x.x
✅ Python 3: 3.x.x
✅ Git: 2.x.x

📋 Project Structure
--------------------------------------------------------------------------------
✅ Frontend source: Exists
✅ Backend directory: Exists
...

📊 Summary
--------------------------------------------------------------------------------
Total Checks: 20
✅ Passed: 18
⚠️  Warnings: 2
❌ Failed: 0

✅ All systems operational!
```

---

## ⚠️ TROUBLESHOOTING

### Service Not Running

```bash
# Check if service is running
lsof -i :3001

# Start service
./start.sh
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Health Check Fails

```bash
# Check service logs
tail -f logs/backend.log
tail -f logs/ai-service.log

# Restart service
./stop.sh
./start.sh
```

---

## 📝 NOTES

### Health Check Scripts Location

- `scripts/health-check.js` - Main health check
- `scripts/utils/comprehensive-health-check.sh` - Comprehensive check
- `scripts/health-check.cjs` - Alternative check

### Reports

Health check reports are saved to:

- `reports/health/health-report-YYYY-MM-DD.json`

---

## ✅ CHECKLIST

- [x] Create comprehensive health check script
- [x] Add NPM scripts
- [x] Test all endpoints
- [x] Document usage
- [x] Add troubleshooting guide

---

**Status**: ✅ Complete
**Last Updated**: 2025-01-27
