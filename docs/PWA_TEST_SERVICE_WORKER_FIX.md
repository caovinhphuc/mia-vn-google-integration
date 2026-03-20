# Sửa lỗi khi chạy test-service-worker.sh (PWA)

## Các lỗi trong Console

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `:3003/api/sheets/metadata` ERR_CONNECTION_REFUSED | Build dùng `.env.production` → API = 3003, nhưng không có service chạy trên 3003 | Chạy Backend hoặc build với API = 3001 |
| `ws://localhost:3002/ws` failed | WebSocket mặc định = 3002, nhưng port 3002 đang dùng cho `serve` (static), không có WS server | Chạy ws-server hoặc dùng Backend Socket.IO |
| `Unexpected token '<', "<!doctype "` (AI) | AI Service không chạy → trả HTML 404 thay vì JSON | Chạy `npm run ai-service` hoặc bỏ qua AI |
| Chart width/height -1 | Recharts container chưa có kích thước khi render | Thêm `minHeight` cho container chart |

## Kiến trúc hiện tại

```
.env.production:
  REACT_APP_API_BASE_URL = http://localhost:3003/api  (Google Sheets Backend)
  (Không có REACT_APP_WS_URL) → mặc định ws://localhost:3002/ws

src/utils/websocket.js:
  WebSocketClient default = ws://localhost:3002/ws  (raw WebSocket)
  → Cần standalone ws-server (backend/ws-server.js) chạy trên 3002

Backend (3001):
  - REST API: /api/reports, /api/sheets/*, ...
  - Socket.IO (khác protocol với raw WebSocket)
```

**Xung đột:** `test-service-worker.sh` chạy `serve` trên 3002 → chiếm port → WebSocket không thể kết nối.

---

## Cách sửa nhanh (local PWA test)

### Bước 1: Build với env local (API = 3001)

```bash
cp .env.test-pwa .env.production.local
npm run build
```

### Bước 2: Chạy Backend + WebSocket server

```bash
# Terminal 1: Backend (API port 3001)
cd backend && npm start

# Terminal 2: Raw WebSocket server (port 3002) - cho dashboard
node server/websocket-server.js
```

### Bước 3: Chạy test PWA

```bash
./test-service-worker.sh
```

→ App mở tại http://localhost:3005 (hoặc 3006/3007 nếu 3005 bận)

### Bước 2: Chạy Backend trước khi test PWA

```bash
# Terminal 1: Backend (port 3001)
cd backend && npm start

# Terminal 2: PWA test
./test-service-worker.sh
```

### Bước 3: Đổi port cho serve (tránh đụng 3002)

Sửa `test-service-worker.sh` dùng port 3005 thay vì 3002, để 3002 dành cho ws-server nếu cần.

---

## Checklist khi test PWA

- [ ] Backend đang chạy (3001)
- [ ] Build dùng API URL = 3001 (hoặc 3003 nếu chạy Google Sheets Backend)
- [ ] WebSocket: Dashboard dùng Socket.IO (Backend) hoặc ws-server chạy riêng
- [ ] AI Service (8001): optional, có thể bỏ qua

---

## Gợi ý fix dài hạn

1. **Thống nhất WebSocket:** Dùng Socket.IO (Backend) cho tất cả, bỏ raw WebSocketClient.
2. **test-service-worker.sh:** Thêm option `--with-backend` để tự start Backend trước khi serve.
3. **Chart:** Thêm `minHeight={200}` cho Recharts `ResponsiveContainer`.
