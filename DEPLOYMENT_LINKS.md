# 🌐 Deployment Links - React OAS Integration v4.0

> Refreshed: 2026-03-18. Ưu tiên command canonical qua npm scripts và root wrappers.

## 📍 Thông Tin Repository

- **GitHub Repository**: `https://github.com/caovinhphuc/React-OAS-Integration-v4.0`
- **Branch**: `main`
- **Remote**: `origin` → `https://github.com/caovinhphuc/React-OAS-Integration-v4.0`

---

## 🚀 Vercel (Frontend)

### Thông Tin Project

- **Project ID**: `prj_BXxEXaTvE6rots5H7qXDR4tcsn18`
- **Organization ID**: `team_6EDR6K8jQ0bK7bji7eGz9PWs`
- **Project Name**: `react-oas-integration-v4`
- **Nguồn**: File `.vercel/project.json` (thư mục root của project)

### URLs

- **Production URL**: `https://mia-vn-google-integration.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

### Cấu Hình

- **Config File**: `.vercel/project.json`
- **Build Config**: `vercel.json`
- **Framework**: Create React App
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `build`

---

## 🚂 Railway (Backend)

### URLs

- **Production URL**: `https://mia-backend-production-7e56.up.railway.app`
- **Health Check**: `https://mia-backend-production-7e56.up.railway.app/health`
- **Railway Dashboard**: `https://railway.app/dashboard`

### Lưu Ý

- Railway project chưa được link trong local (cần chạy `railway link`)
- URL được hardcode trong script `scripts/deploy/quick-deploy.sh`

---

## 📝 Scripts Deploy

### Quick Deploy

```bash
npm run deploy:prep
npm run deploy:vercel
# hoặc wrapper legacy-compatible
./quick-deploy.sh
```

Flow khuyến nghị:

1. ✅ Validate + build (`deploy:prep`)
2. ✅ Deploy frontend (`deploy:vercel`)
3. ℹ️ Backend deploy theo platform riêng (Railway/manual pipeline)

---

## 🔍 Cách Kiểm Tra Link Thực Tế

### Vercel

```bash
# Xem danh sách deployments
vercel ls

# Xem thông tin project
vercel inspect

# Xem URL production
vercel ls --prod
```

### Railway

```bash
# Link project (nếu chưa link)
railway link

# Xem thông tin service
railway status

# Xem URL
railway domain
```

---

## ⚙️ Environment Variables

### Frontend (Vercel)

Cần cấu hình trong Vercel Dashboard:

- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID`
- `REACT_APP_GOOGLE_DRIVE_FOLDER_ID`

### Backend (Railway)

Cần cấu hình trong Railway Dashboard:

- `PORT` - Port cho backend
- `DATABASE_URL` - Database connection string
- Các biến môi trường khác từ `.env`

---

## 📊 Commit Gần Nhất

> Mục này là snapshot lịch sử, có thể không còn phản ánh commit hiện tại.

- **Commit Hash**: `90f7795c7aa9fc83b39daf267b429948c8e34d85`
- **Message**: `🔧 Update: Auto commit and deploy`
- **Author**: Phuc Cao <phuccao@mia.vn>
- **Date**: Fri Jan 23 08:42:56 2026 +0700
- **Files Changed**: `logs/ai-service.log`

---

## 🔗 Quick Links

- **Frontend**: https://mia-vn-google-integration.vercel.app
- **Backend Health**: https://mia-backend-production-7e56.up.railway.app/health
- **GitHub Repo**: https://github.com/caovinhphuc/React-OAS-Integration-v4.0
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard

---

## ⚠️ Lưu Ý

1. **Vercel Project**: Đã được link và cấu hình đầy đủ
2. **Railway Project**: Cần xác minh `railway link` theo môi trường máy hiện tại
3. **Environment Variables**: Cần kiểm tra và cập nhật trong cả Vercel và Railway dashboards
4. **Script standards**: Root `*.sh` nên chỉ là wrapper, xem `SHELL_SCRIPT_STANDARDS.md`
