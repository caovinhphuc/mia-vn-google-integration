# 🔌 Port — làm rõ (canonical)

Tài liệu này là **nguồn chuẩn** cho cổng dịch vụ local; đồng bộ với `package.json`, `ENV_SETUP.md`, `Document/AI_SERVICE_GUIDE.md`.

## Kiến trúc & cổng

| Dịch vụ                                   | Port     | Bắt buộc?       | Ghi chú                                     |
| ----------------------------------------- | -------- | --------------- | ------------------------------------------- |
| Frontend (CRA)                            | **3000** | Có (cho UI dev) | `npm start`                                 |
| Backend (Node/Express)                    | **3001** | Có (cho API)    | `npm run backend` — `BACKEND_PORT` / `PORT` |
| **AI Service** (FastAPI, `ai-service/`)   | **8000** | Tuỳ chọn        | `npm run ai-service` — `main_simple:app`    |
| **Automation** (FastAPI, `automation/` …) | **8001** | Tuỳ chọn        | Service Python automation / one system      |

**Hai process Python khác nhau:** 8000 ≠ 8001. Frontend gọi AI qua `REACT_APP_AI_SERVICE_URL` (mặc định `http://localhost:8000`); automation dùng biến riêng (vd. `REACT_APP_AUTOMATION_API_URL` → 8001).

## Health / kiểm tra nhanh

- `npm run health:quick` → `scripts/health-quick.sh` (bảng màu: 3000, 3001, 8000, 8001).
- `npm run health-check` — Node đầy đủ.
- `npm run test:api` — phân tách URL AI vs Automation.

## Lệnh port

- `npm run fix:ports` — giải phóng **3000, 3001, 8000** (xem `package.json`; cổng **8001** không nằm trong lệnh mặc định).
- `npm run check:ports` — kiểm tra listen trên 3000/3001/8000.

## Gỡ nhầm (tài liệu cũ)

Một số bản ghi cũ từng viết: _chỉ có Automation, không có AI_ hoặc _8001 = AI_ — **không còn đúng** với monorepo hiện tại (đã có `ai-service` trên **8000**).

---

_Cập nhật: 2026-04-22 — đồng bộ `QUICK_REFERENCE.md`, `ENV_SETUP.md`, `scripts/test-api-endpoints.js`._
