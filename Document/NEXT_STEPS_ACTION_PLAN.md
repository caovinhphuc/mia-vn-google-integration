# 🎯 Kế Hoạch Hành Động - Chức Năng Còn Lại

> **Phân tích từ ARCHITECTURE_GUIDE.md** | Cập nhật: Mar 2026

---

## 📊 Trạng Thái Hiện Tại

### ✅ Đã hoàn thành (97%)

| Component                 | Trạng thái           | Ghi chú                           |
| ------------------------- | -------------------- | --------------------------------- |
| Frontend (React)          | ✅ Stable            | Dashboard, AI, Analytics, Alerts  |
| Backend (Node.js)         | ✅ Stable            | Auth, API, Reports, Sheets, Drive |
| AI Service                | ✅ Stable            | main_simple.py, mia_models        |
| Automation                | ✅ Stable            | automation.py, Selenium           |
| Google Sheets             | ✅ Active            | Proxy qua backend                 |
| Security (MFA, SSO, RBAC) | ✅ Implemented       |                                   |
| WebSocket Real-time       | ✅ Active            | ai:update, notify:alert, metrics  |
| Dev Workflow              | ✅ Active            | Husky, Prettier, ESLint           |
| Deploy                    | ✅ Netlify + Railway | Frontend + Backend                |

### 🚧 Còn thiếu / Chưa hoàn thiện

| Hạng mục            | Mô tả                                                  | Ưu tiên    |
| ------------------- | ------------------------------------------------------ | ---------- |
| Recommendations API | Backend endpoint `/api/recommendations` thống nhất     | **Cao**    |
| Netlify Link        | `npx netlify link` để deploy CLI thành công            | Cao        |
| Data Pipeline E2E   | Automation → Sheets → AI → Analytics (end-to-end test) | Trung bình |
| AI ↔ Google Sheets  | AI Service đọc trực tiếp từ Sheets                     | Trung bình |
| Monitoring/Alerts   | Prometheus, health metrics chi tiết                    | Thấp       |

---

## 🔥 Các Bước Tiếp Theo (Ưu tiên)

### Phase 1: Hoàn thiện Deploy & Kết nối (1–2 ngày)

#### 1.1 Sửa Netlify deploy

```bash
cd /Users/phuccao/Projects/mia/oas-integration
npx netlify login
npx netlify link   # Chọn site leafy-baklava-595711
./quick-deploy.sh "Fix Netlify deploy"
```

#### 1.2 Lấy Railway backend URL

```bash
cd backend
railway domain
# Hoặc: railway status  # xem thông tin service
```

Copy URL dạng `https://react-oas-integration-backend-production.up.railway.app` (không có `/api` cuối).

#### 1.3 Thêm biến môi trường trên Netlify

1. Vào https://app.netlify.com → Site **leafy-baklava-595711** → **Site settings**
2. **Environment variables** → **Add a variable** / **Edit variables**
3. Thêm:

| Key                      | Value                       | Scopes                      |
| ------------------------ | --------------------------- | --------------------------- |
| `REACT_APP_API_URL`      | `https://[railway-url]`     | Production, Deploy previews |
| `REACT_APP_API_BASE_URL` | `https://[railway-url]/api` | Production, Deploy previews |

4. **Save** → **Trigger deploy** (Deploys → Trigger deploy)

#### 1.4 Kiểm tra Production

- Frontend: https://leafy-baklava-595711.netlify.app/
- Backend: `https://[railway-domain]/health`
- Sau khi thêm env, Netlify cần **rebuild** (Deploy mới) để áp dụng

---

### Phase 2: Recommendations API (2–3 ngày)

**Mục tiêu:** Endpoint thống nhất cho frontend gọi recommendations.

#### 2.1 Thêm endpoint Backend

```javascript
// backend/src/server.js
app.get("/api/recommendations", async (req, res) => {
  const { source = "ai", limit = 5 } = req.query;
  // Gọi AI Service /aggregate hoặc logic local
  // Trả về { recommendations: [...] }
});
```

#### 2.2 Kết nối AI Service

- Backend proxy đến `AI_SERVICE_URL/ai/recommendations`
- Hoặc dùng logic từ `automation/generate_summary.py`

#### 2.3 Cập nhật Frontend AIDashboard

- Thay `generateSmartRecommendations` local → gọi `GET /api/recommendations`

---

### Phase 3: Data Pipeline E2E (3–5 ngày)

#### 3.1 Luồng chuẩn

```
Automation (8001) → Google Sheets
     ↓
AI Service (8000) đọc Sheets → Phân tích
     ↓
Backend (3001) /api/analytics, /api/recommendations
     ↓
Frontend hiển thị real-time
```

#### 3.2 Công việc

- [ ] AI Service: thêm route đọc từ Google Sheets API (hoặc qua Backend proxy)
- [ ] Scheduler: node-cron trigger Automation mỗi ngày 6:00
- [ ] E2E test: `npm run test:integration` pass đầy đủ

---

### Phase 4: Tối ưu & Monitoring (tuỳ chọn)

- [ ] Thêm `/api/metrics` cho Prometheus
- [ ] Caching (Redis) cho Sheets/API calls nặng
- [ ] React Query cho client-side cache

---

## 📋 Checklist Ngắn Hạn

### Tuần này

- [ ] `npx netlify link` → deploy frontend CLI thành công
- [ ] Cập nhật env Netlify (REACT_APP_API_URL → Railway)
- [ ] Thêm `GET /api/recommendations` trong backend
- [ ] AIDashboard gọi API thay vì generate local

### Tuần sau

- [ ] AI Service kết nối đọc Google Sheets (qua backend)
- [ ] Scheduler cron cho Automation
- [ ] E2E test pass

### Tháng này

- [ ] Monitoring/alerting cơ bản
- [ ] Docs cập nhật (DEPLOYMENT_LINKS, README)

---

## 🔗 Tài liệu liên quan

- [ARCHITECTURE_GUIDE.md](../ARCHITECTURE_GUIDE.md)
- [REMAINING_ISSUES.md](../REMAINING_ISSUES.md)
- [ROADMAP_NEXT_STEPS.md](../ROADMAP_NEXT_STEPS.md)
- [DEPLOYMENT_LINKS.md](../DEPLOYMENT_LINKS.md)
