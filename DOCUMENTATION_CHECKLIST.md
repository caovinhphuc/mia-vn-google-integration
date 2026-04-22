# 📋 Documentation checklist — Mia / React OAS Google Integration

> **Mục đích:** Quy trình ngắn để **không lệch** giữa markdown và code.  
> **Cập nhật:** 2026-04-22

---

## 1. Nguồn sự thật (đọc trước khi sửa doc)

| Nguồn                             | Dùng để                                                              |
| --------------------------------- | -------------------------------------------------------------------- |
| `package.json`                    | Phiên bản app, `dependencies`, script `npm run …`                    |
| `.nvmrc` / `.python-version`      | Node **20**, Python **3.11** (venv)                                  |
| `backend/src/server.js`           | Port backend, merge `.env`, Sheet ID resolve                         |
| `src/App.jsx` (và thư mục `src/`) | Route thật — **không** đoán route trong checklist                    |
| `PORT_CLARIFICATION.md`           | Bảng cổng canonical: **3000 / 3001 / 8000 (AI) / 8001 (automation)** |

---

## 2. Hub đã đồng bộ (ưu tiên đọc / giữ khớp)

| File                                                           | Nội dung chính                                |
| -------------------------------------------------------------- | --------------------------------------------- |
| [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)             | Mục lục toàn repo                             |
| [ENV_SETUP.md](./ENV_SETUP.md)                                 | `.env` đa file, Google, AI vs Automation URL  |
| [PORT_CLARIFICATION.md](./PORT_CLARIFICATION.md)               | Cổng & gỡ nhầm tài liệu cũ                    |
| [DOCUMENTATION_FIX_SUMMARY.md](./DOCUMENTATION_FIX_SUMMARY.md) | Lịch sử chỉnh port / AI                       |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)                     | Lệnh nhanh + bảng port                        |
| [HEALTH_CHECK_GUIDE.md](./HEALTH_CHECK_GUIDE.md)               | `health-check`, `health:quick`, `health:full` |
| [AUTOMATED_SETUP.md](./AUTOMATED_SETUP.md)                     | `node scripts/setup.js`                       |

Khi sửa một mục trên → kiểm tra **cùng ý** trong các file còn lại (đặc biệt port và tên script).

---

## 3. Bảng rà soát định kỳ

| Hạng mục       | Việc cần làm                                                                      | Tần suất gợi ý     |
| -------------- | --------------------------------------------------------------------------------- | ------------------ |
| Port / service | So khớp `PORT_CLARIFICATION.md` ↔ `package.json` (`dev`, `ai-service`, `backend`) | Mỗi lần đổi cổng   |
| Env            | So khớp `ENV_SETUP.md` ↔ `.env.example` ↔ `scripts/check-env.sh`                  | Khi thêm biến      |
| Health         | Chạy `npm run health:quick` + `npm run health-check`                              | Trước release      |
| Script path    | Doc ghi `node scripts/...` — file phải tồn tại (`ls scripts/…`)                   | Khi đổi tên script |
| Index          | Thêm/xóa doc lớn → cập nhật `DOCUMENTATION_INDEX.md`                              | Cùng PR doc        |
| README         | Link hub, Node version, lệnh start — khớp `README.md` đầu file                    | Theo sprint        |

---

## 4. File dài / legacy (rà khi có thời gian)

Các file sau **không** được coi là đã rà trong checklist 2026-04; khi chỉnh code liên quan thì mở và cập nhật tương ứng:

- `ARCHITECTURE.md`, `ARCHITECTURE_GUIDE.md`, `ARCHITECTURE_GUIDE_COMPARISON.md`
- `DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_LINKS.md`, `DEPLOYMENT_READY.md`
- `docs/CICD.md`, `docs/OPTIMIZATION_GUIDE.md` (nếu còn dùng)
- `GOOGLE_SHEETS_SETUP_GUIDE.md` — giữ khớp Sheet ID / SA với `docs/GOOGLE_CREDENTIALS_SETUP.md`

---

## 5. Sai lệch đã từng gặp (tránh lặp)

1. **Gộp AI (8000) với Automation (8001)** — hai service khác nhau (`ai-service/` vs `automation/`).
2. **Ghi React Router / version** không đọc `package.json` — luôn tra `dependencies` thật.
3. **Port frontend 8080** — CRA mặc định **3000** (trừ khi đặt `PORT=`).
4. **Chỉ nói “backend đọc root `.env`”** — backend còn merge `backend/.env`, `automation/.env`, `.env.local` (xem `ENV_SETUP.md`).

---

## 6. Lệnh kiểm tra nhanh

```bash
npm run health:quick
npm run tools:check
./scripts/check-env.sh
```

---

**Trạng thái:** Checklist vận hành — không thay thế `DOCUMENTATION_INDEX.md`.  
**Phiên bản tài liệu app:** lấy từ `package.json` → `"version"` (hiện **3.0.0**); mô tả marketing “v4.0” chỉ dùng khi đồng bộ toàn repo.
