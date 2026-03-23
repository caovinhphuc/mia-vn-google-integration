# 🌐 Deployment Links - React OAS Integration v4.0

> Refreshed: 2026-03-21. Ưu tiên command canonical qua npm scripts và root wrappers.

## 📍 Thông Tin Repository

- **GitHub Repository**: `https://github.com/caovinhphuc/react-oas-integration-x`
- **Branch**: `main`
- **Remote**: `origin` → (kiểm tra `git remote -v` trên máy)

---

## 🚀 Vercel (Frontend)

### Thông Tin Project

- **Project ID**: `prj_7AjXluQWQGPIIyJ3qwnDrfAVeAO0`
- **Organization ID**: `team_2QxVAInW2KD0ATucWbe7WjVw`
- **Project Name**: `react-oas-integration-v4-0` (team `git-react`; production alias bên dưới)
- **Nguồn**: File `.vercel/project.json` (thư mục root của project)

### URLs & Domains

| Loại                                               | URL                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| **Production (domain chính)**                      | <https://react-oas-integration-v4-0.vercel.app>                            |
| **Deployment cụ thể** (mỗi lần build, có thể khác) | Ví dụ: `https://react-oas-integration-v4-0-jvnn1da6m-git-react.vercel.app` |
| **Dashboard**                                      | <https://vercel.com/dashboard>                                             |

- **Production** = alias ổn định trỏ bản **Ready** mới nhất.
- **Deployment URL** = link riêng từng lần deploy (preview/history); Vercel tạo slug theo branch/commit — **không** dùng làm “website chính” trên GitHub.

### Cập nhật hiển thị trên GitHub (About / Website)

GitHub **không** tự lấy domain từ Vercel. Sau mỗi lần đổi project/domain:

1. Vào repo → **Settings** → **General** → mục **Website** (hoặc phần **About** trên trang repo → ✏️ → **Website**).
2. Đặt: `https://react-oas-integration-v4-0.vercel.app` (hoặc custom domain nếu có).
3. Nếu vẫn thấy URL cũ (vd. `logistics-dashboard-final-xi.vercel.app`) — đó là project/link cũ; sửa tay như trên.

README/badge trong repo: cập nhật link production trong [`README.md`](./README.md) (mục Deploy production) cho đồng bộ với Vercel.

### Cấu Hình

- **Config File**: `.vercel/project.json`
- **Build Config**: `vercel.json`
- **Framework**: Create React App
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `build`

---

## 🚂 Railway (Backend)

### URLs (production — **không** có `:8080`)

| Mục                               | URL                                                         |
| --------------------------------- | ----------------------------------------------------------- |
| **Public API (ví dụ trong repo)** | `https://mia-backend-production-7e56.up.railway.app`        |
| **Health**                        | `https://mia-backend-production-7e56.up.railway.app/health` |
| **Dashboard**                     | <https://railway.app/dashboard>                             |

> **Xác minh URL đang chạy:** trong thư mục đã `railway link`, chạy `cd backend && railway domain` (hoặc xem tab **Settings → Networking** của service). Nếu Railway đổi domain, sửa bảng trên + env Vercel bên dưới.

### Log `port 8080` — khác gì URL public?

- Trong container Railway thường đặt **`PORT=8080`** (hoặc giá trị khác). Log kiểu `http://localhost:8080/health` là **bên trong container**.
- Trình duyệt / Vercel chỉ dùng **`https://…up.railway.app`** (cổng 443, HTTPS). **Không** thêm `:8080` vào `REACT_APP_API_URL`.

### Đồng bộ frontend (Vercel) → backend này

Đặt trong **Vercel → Environment Variables → Production**, rồi **Redeploy**:

| Biến                     | Ví dụ (khớp URL public ở trên)                           |
| ------------------------ | -------------------------------------------------------- |
| `REACT_APP_API_URL`      | `https://mia-backend-production-7e56.up.railway.app`     |
| `REACT_APP_API_BASE_URL` | `https://mia-backend-production-7e56.up.railway.app/api` |

(`getGoogleProxyApiBase()` trong `src/utils/apiBase.js` cần base kết thúc một segment `/api` cho route Sheets/Drive.)

### Quick deploy + Railway (`quick-deploy.sh`)

- **Mặc định:** `cd backend && railway up` (không `--service`) — dùng khi project **chỉ có một** service.
- **Nhiều service:** bắt buộc đặt tên khớp Dashboard (tab **Services**), ví dụ:
  `RAILWAY_SERVICE=mia-backend ./quick-deploy.sh "message"`
- Lỗi **`Service not found`:** trước đó script mặc định `--service backend` nhưng project bạn **không** có service tên đó — giờ đã bỏ mặc định; nếu vẫn lỗi, kiểm tra tên trên Dashboard hoặc unset `RAILWAY_SERVICE`.

Lần đầu trên máy: `railway login` → `cd backend && railway link`.

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

- `REACT_APP_API_URL` — origin backend public (HTTPS, **không** `:8080`)
- `REACT_APP_API_BASE_URL` — thường `…/api` cho proxy Sheets/Drive (xem bảng Railway ở trên)
- `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID`
- `REACT_APP_GOOGLE_DRIVE_FOLDER_ID`

### Backend (Railway)

Cần cấu hình trong Railway Dashboard:

- `PORT` — Railway thường gán sẵn (vd `8080` trong log); **không** đưa số port vào URL frontend
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

## 🔗 Quick Links (Production đang chạy)

- **Frontend**: <https://react-oas-integration-v4-0.vercel.app> (Vercel)
- **Backend**: <https://react-oas-integration-backend-production.up.railway.app> (Railway)
- **Backend Health**: <https://react-oas-integration-backend-production.up.railway.app/health>

### Setup legacy (Netlify đã ngừng – vượt giới hạn credit)

- ~~Frontend (Netlify)~~: <https://leafy-baklava-595711.netlify.app/> (paused)
- **GitHub Repo**: <https://github.com/caovinhphuc/react-oas-integration-x>
- **Vercel Dashboard**: <https://vercel.com/dashboard>
- **Railway Dashboard**: <https://railway.app/dashboard>

---

## ⚠️ Lưu Ý

1. **Vercel Project**: Production dùng **`react-oas-integration-v4-0`** → **<https://react-oas-integration-v4-0.vercel.app>**. Nếu CLI báo _Due to `builds` existing…_: xóa key `builds` (legacy) trong `vercel.json` trên repo đang deploy, chỉ giữ `framework` / `buildCommand` / `outputDirectory`.
2. **Railway Project**: Cần xác minh `railway link` theo môi trường máy hiện tại
3. **Environment Variables**: Cần kiểm tra và cập nhật trong cả Vercel và Railway dashboards
4. **Script standards**: Root `*.sh` nên chỉ là wrapper, xem `SHELL_SCRIPT_STANDARDS.md`
