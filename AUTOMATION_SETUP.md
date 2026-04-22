# 🤖 Automation & Google Sheets — Setup (entry)

File này thay cho tên cũ trong index; dùng làm **mục lục** tới tài liệu và lệnh thật trong repo.

---

## Cổng liên quan (nhớ tách với CRA)

| Cổng     | Service                          | Bắt buộc?                           |
| -------- | -------------------------------- | ----------------------------------- |
| **3000** | React (`npm start`)              | Có (dev UI)                         |
| **3001** | Backend Node + Socket.IO         | Có (API)                            |
| **8000** | AI Service (FastAPI)             | Tuỳ chọn — `npm run ai-service`     |
| **8001** | Automation API (uvicorn)         | Tuỳ chọn — bridge / Sheets nâng cao |
| **3002** | WebSocket thuần (`ws-server.js`) | Tuỳ chọn                            |

Chi tiết: [PORT_CONFIGURATION_SUMMARY.md](./PORT_CONFIGURATION_SUMMARY.md), [ENV_SETUP.md](./ENV_SETUP.md) (`BACKEND_PORT` vs `PORT` khi chạy CRA).

---

## 1. Python venv + dependencies (`automation/`)

```bash
cd automation
npm run setup:automation   # từ root — hoặc: ./setup.sh
# hoặc: bash setup.sh --force   # backup venv + tạo lại
```

Hoặc thủ công: `requirements-minimal.txt` / `requirements-basic.txt` — xem [automation/setup.sh](./automation/setup.sh).

---

## 2. Cấu hình `.env` (automation + Google)

- File mẫu: [automation/.env.example](./automation/.env.example)
- Kiểm tra tích hợp (Sheets, Drive, Telegram, Email): [automation/INTEGRATIONS_SETUP.md](./automation/INTEGRATIONS_SETUP.md)

```bash
cd automation && source venv/bin/activate && python verify_integrations.py
```

Google Sheets (root / backend): [GOOGLE_CLOUD_API_KEY_GUIDE.md](./GOOGLE_CLOUD_API_KEY_GUIDE.md), [shared-md/GOOGLE_SHEETS_SETUP_GUIDE.md](./shared-md/GOOGLE_SHEETS_SETUP_GUIDE.md).

---

## 3. Một lệnh setup + seed (tuỳ chọn)

```bash
cd automation && ./setup-and-seed.sh
```

---

## 4. `one_automation_system` (bộ automation đầy đủ hơn)

- [one_automation_system/README.md](./one_automation_system/README.md)
- Venv riêng + `requirements.txt` — tránh nhầm với `automation/.venv`.

---

## 5. Test & health

- Script test: [TEST_SCRIPTS_GUIDE.md](./TEST_SCRIPTS_GUIDE.md)
- Health (Google env): `node scripts/health-check.cjs` (từ root, có `.env`)

---

**Cập nhật:** 2026-04-22 — đồng bộ với `PORT_CONFIGURATION_SUMMARY.md` và cấu trúc `automation/` hiện tại.
