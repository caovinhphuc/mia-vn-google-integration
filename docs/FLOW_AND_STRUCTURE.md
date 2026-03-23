# Cấu trúc và luồng chạy hiện tại

## 1. Lệnh chạy chính

```bash
npm run dev
```

Chạy **3 process song song**:

| Process    | Lệnh                                                           | Port |
| ---------- | -------------------------------------------------------------- | ---- |
| Frontend   | `react-scripts start`                                          | 3000 |
| Backend    | `cd backend && npm start`                                      | 3001 |
| AI Service | `cd ai-service && uvicorn main:app --host 0.0.0.0 --port 8000` | 8000 |

---

## 2. Sơ đồ luồng

```
┌─────────────┐
│   User      │
│   (Browser) │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend (React) - Port 3000                            │
│  • Giao diện dashboard                                   │
│  • Gọi API qua REACT_APP_API_URL (3001)                  │
│  • WebSocket kết nối Backend (3001)                      │
└──────┬──────────────────────────────────────────────────┘
       │ HTTP / WebSocket
       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend (Node + Express) - Port 3001                    │
│  • Auth (JWT), RBAC                                      │
│  • /api/sheets/*  - Google Sheets                        │
│  • /api/drive/*   - Google Drive                         │
│  • Socket.IO - real-time updates                         │
└──────┬──────────────────────────────────────────────────┘
       │
       ├──► Google Sheets API (credentials từ .env)
       │
       ├──► AI Service (8001) - khi cần insights/predictions
       │    • /api/ml/insights
       │    • /api/ml/predict
       │    • /api/ml/optimize
       │
       └──► Email, Telegram (gửi thông báo)
```

---

## 3. Automation (chạy riêng)

**Automation** không nằm trong `npm run dev`. Chạy riêng:

```bash
# Từ start_dev_servers.sh hoặc thủ công:
cd automation && python -m uvicorn main:app --port 8001
```

✅ **Lưu ý:** AI **8000** và Automation **8001** — cổng khác nhau, có thể chạy song song nếu cần.

| Khi cần         | Chạy gì                                                    |
| --------------- | ---------------------------------------------------------- |
| Dev (FE+BE+AI)  | `npm run dev` (+ AI nếu script có)                         |
| Thêm automation | `start_dev_servers.sh` hoặc `automation-service` cổng 8001 |

---

## 4. Luồng dữ liệu chính

### 4.1 User xem Dashboard

```
Frontend → GET /api/reports (Backend 3001)
Backend  → Đọc Google Sheets (hoặc cache)
Backend  → Trả JSON → Frontend render
```

### 4.2 Real-time (WebSocket)

```
Frontend kết nối Socket.IO → Backend:3001
Backend emit 'data_update', 'ai_result' khi có thay đổi
Frontend lắng nghe và cập nhật UI
```

### 4.3 AI Insights (nếu dùng)

```
Frontend → Backend /api/analytics/...
Backend  → Gọi AI Service (8000) /api/ml/insights
AI       → Trả kết quả → Backend → Frontend
```

### 4.4 Automation (Selenium)

```
Scheduler/Cron → automation/main.py
  → Login ONE Page
  → Scrape orders
  → Ghi Google Sheets
  → (Optional) Gửi Telegram/Email
```

---

## 5. File cấu hình quan trọng

| File                             | Vai trò                                                                |
| -------------------------------- | ---------------------------------------------------------------------- |
| `.env`                           | Biến môi trường (ports, Google, Telegram, Email). Backend load từ root |
| `config/google-credentials.json` | Service Account Google (Drive, Sheets)                                 |
| `package.json`                   | Scripts `dev`, `start`, `backend`, `ai-service`                        |

**Google dữ liệu thật:** Xem [docs/GOOGLE_CREDENTIALS_SETUP.md](GOOGLE_CREDENTIALS_SETUP.md).

**AI Service (chi tiết API, env, troubleshooting):** [Document/AI_SERVICE_GUIDE.md](../Document/AI_SERVICE_GUIDE.md).

---

## 6. Kiểm tra nhanh

```bash
# Tất cả service đang chạy?
npm run health:quick

# Hoặc thủ công:
curl http://localhost:3000    # Frontend
curl http://localhost:3001/health   # Backend
curl http://localhost:8000/health   # AI Service
curl http://localhost:8001/health   # Automation (optional)
```
