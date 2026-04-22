# 🔌 Tóm tắt cấu hình port (theo code hiện tại)

## Ports chính (local dev)

| Port     | Service                          | Ghi chú                                                                                                                                                                   |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3000** | Frontend (CRA `npm start`)       | Mặc định khi **không** set `PORT` trong `.env` gốc.                                                                                                                       |
| **3001** | Backend Node + **Socket.IO**     | `backend/src/server.js`: `process.env.PORT \|\| process.env.BACKEND_PORT \|\| 3001`. Trong `.env` root dùng **`BACKEND_PORT=3001`**, tránh `PORT=` (CRA cũng đọc `PORT`). |
| **3002** | WebSocket thuần (`ws-server.js`) | **Tuỳ chọn**; dev: `src/setupProxy.js` proxy `/ws` → 3002; `src/utils/websocket.js` dùng `ws://<host>/ws` trong development.                                              |
| **8000** | AI Service (FastAPI / uvicorn)   | `npm run ai-service`                                                                                                                                                      |
| **8001** | Automation API (uvicorn)         | Khi chạy script start-all / one_automation bridge                                                                                                                         |

## `.env` root (monorepo)

- **`BACKEND_PORT=3001`**: cổng Express + Socket.IO.
- **Không** đặt `PORT=3001` cho “backend” trong cùng file — Create React App dùng `PORT` làm cổng dev server → xung đột 3001.
- **Deploy (PaaS):** platform inject `PORT` → backend vẫn listen đúng (`PORT` được ưu tiên trước `BACKEND_PORT` trong code).

## Script / dọn port

- `npm run fix:ports` — thường dọn 3000, 3001, 8000 (và tương thích 8001 nếu có trong script).

## Tài liệu liên quan

- [ENV_SETUP.md](./ENV_SETUP.md) — cách đặt biến `.env` root
- [PORT_CONFLICT_GUIDE.md](./PORT_CONFLICT_GUIDE.md) — xử lý trùng port
- [PORT_ISSUE_FIXED.md](./PORT_ISSUE_FIXED.md) — ghi chú sửa `PORT` vs CRA
