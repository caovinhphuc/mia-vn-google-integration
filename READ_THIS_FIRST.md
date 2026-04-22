# Đọc file này trước

Hub ngắn cho repo **mia-vn-google-integration** (React + Node backend + AI FastAPI + Python `automation/` + `one_automation_system/`). Mục tiêu: **đúng cổng**, **đúng lệnh canonical**, **đúng file tài liệu** — tránh nhầm với template cũ (`mia-logistics-manager`, `make start`, v.v.).

---

## Cổng dịch vụ (đồng bộ code hiện tại)

| Port     | Dịch vụ                                               | Bắt buộc?                                                      |
| -------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| **3000** | Frontend (CRA)                                        | Có — luồng UI chính                                            |
| **3001** | Backend Node + Socket.IO                              | Có                                                             |
| **8000** | AI Service (`ai-service`, FastAPI)                    | Tuỳ chọn — `npm run ai-service`                                |
| **8001** | One Automation API (`one_automation_system`, uvicorn) | Tuỳ chọn — Sheets / bridge; `./start.sh` có thể bật khi đủ env |
| **3002** | WebSocket thuần (`ws-server`)                         | Tuỳ chọn                                                       |

**Không dùng 8002** cho kiến trúc mặc định. Tránh đặt `PORT=` trong `.env` gốc nếu làm trùng cổng CRA — xem [ENV_SETUP.md](ENV_SETUP.md).

---

## Đọc theo thứ tự

1. [START_HERE.md](START_HERE.md) — điều hướng theo vai trò + link Sheets.
2. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) — hub lệnh canonical (`./start.sh`, `npm run dev`, bảng port).
3. [QUICK_SCRIPTS_REFERENCE.md](QUICK_SCRIPTS_REFERENCE.md) — chi tiết npm + automation (`bash scripts/health-check.sh` trong `automation/`).
4. [README.md](README.md) — kiến trúc đầy đủ, bảng lệnh team.
5. Google Sheets / Python: [automation/GOOGLE_SHEETS_SETUP_GUIDE.md](automation/GOOGLE_SHEETS_SETUP_GUIDE.md), [automation/docs/Google_Sheets_Integration_Checklist.md](automation/docs/Google_Sheets_Integration_Checklist.md).

### Lịch sử / phân tích port (tuỳ chọn)

- [PORT_CLARIFICATION.md](PORT_CLARIFICATION.md), [PORT_CONFIGURATION_SUMMARY.md](PORT_CONFIGURATION_SUMMARY.md)
- [FINAL_FIX_REPORT.md](FINAL_FIX_REPORT.md), [DOCUMENTATION_FIX_SUMMARY.md](DOCUMENTATION_FIX_SUMMARY.md)
- [AUTOMATION_SETUP.md](AUTOMATION_SETUP.md)

---

## Lệnh bắt đầu nhanh (từ root repo)

```bash
npm install
./verify_port_config.sh          # kiểm tra cổng / cấu hình (nếu có)
./start.sh                       # khuyến nghị — wrapper → scripts/start-stop/start-all.sh
# Hoặc chỉ stack npm:
npm run dev
# Hoặc script dev song song khác (legacy, vẫn có trong repo):
./start_dev_servers.sh
```

Health nhanh:

```bash
npm run health:quick
```

Automation + Google Sheets (trong thư mục `automation/`):

```bash
cd automation
bash scripts/health-check.sh     # chú ý: scripts/health-check.sh (có dấu /)
python3 test_sheets_connection.py
```

Test kết nối frontend (nếu cần):

```bash
node scripts/tests/frontend_connection_test.js
```

---

## FAQ ngắn

**8000 vs 8001?**  
8000 = AI analytics (`ai-service`). 8001 = FastAPI `one_automation_system` (automation API / Sheets bridge). Hai service khác nhau.

**Máy chỉ có Python 3.14 trên PATH?**  
Tạo venv bằng 3.11/3.12: xem bảng đầy đủ [PYTHON_VENV_GUIDE.md](PYTHON_VENV_GUIDE.md). Ví dụ nhanh: `brew install python@3.12` rồi `PYTHON_BIN=/opt/homebrew/opt/python@3.12/bin/python3.12 bash ai-service/setup_venv.sh --force`. `./start.sh` ưu tiên `*/venv/bin/python` và cảnh báo nếu probe ≥3.14.

**Chỉ cần UI + API?**  
Chạy frontend + backend (ví dụ `npm start` + `npm run backend`, hoặc phần tương ứng trong `./start.sh`). AI và 8001 là tuỳ chọn.

**File `QUICK_REFERENCE.md` vs `QUICK_SCRIPTS_REFERENCE.md`?**  
`QUICK_REFERENCE` = mục lục + bảng canonical; `QUICK_SCRIPTS_REFERENCE` = cheat sheet npm + bash chi tiết.

---

## Bản đồ tài liệu (rút gọn)

```
READ_THIS_FIRST.md
    ├─→ START_HERE.md
    ├─→ QUICK_REFERENCE.md → QUICK_SCRIPTS_REFERENCE.md
    ├─→ README.md
    └─→ automation/GOOGLE_SHEETS_SETUP_GUIDE.md
```

---

**Đọc tiếp:** [START_HERE.md](START_HERE.md) hoặc [QUICK_REFERENCE.md](QUICK_REFERENCE.md).

**Last updated:** 2026-04-22
