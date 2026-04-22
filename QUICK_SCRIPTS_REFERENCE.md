# Quick Scripts Reference

Tài liệu tham chiếu lệnh **npm** và **bash** cho repo **mia-vn-google-integration** (React OAS / Google integration). Chạy mọi lệnh `npm` từ **thư mục gốc repo** — nơi có `package.json`. Điều hướng: [START_HERE.md](START_HERE.md). **Phiên bản Python / venv:** [PYTHON_VENV_GUIDE.md](PYTHON_VENV_GUIDE.md).

---

## Đúng thư mục làm việc

```bash
pwd
# Kỳ vọng: thư mục gốc clone (cùng cấp với package.json, README.md, start.sh)

ls package.json start.sh
```

Nếu clone ở `~/Projects/mia-vn-google-integration`:

```bash
cd ~/Projects/mia-vn-google-integration
```

Đừng hard-code path máy khác; dùng đường dẫn clone của bạn.

---

## Khởi động & dev (npm)

```bash
npm install

# Frontend + backend + AI (8000) — xem concurrently trong package.json
npm run dev

# Từng phần
npm start              # React → http://localhost:3000
npm run backend        # Express → http://localhost:3001
npm run ai-service     # FastAPI AI → http://localhost:8000 (cần venv ai-service)

# Wrapper shell (frontend + backend + AI + automation API nếu cấu hình)
./start.sh
```

Setup Python phụ (lần đầu):

```bash
npm run setup:ai-service
npm run setup:automation
```

---

## Cổng & health

```bash
npm run check:ports    # 3000, 3001, 8000 đang LISTEN
npm run fix:ports      # kill process trên 3000, 3001, 8000 (cẩn thận: đóng hết service đang dev)

# Health nhanh (curl core + AI hoặc 8001)
npm run health:quick

npm run check:backend  # curl localhost:3001/health
npm run health-check   # node scripts/health-check.js
```

**Port 8001** (`one_automation_system`): không nằm trong `fix:ports` mặc định. Nếu kẹt: `lsof -i :8001` rồi `kill` PID tương ứng.

**Kill một cổng** (script dùng biến `npm_config_port`):

```bash
npm run kill:port --port=3000
# Hoặc (ổn định trên mọi shell):
npm_config_port=3000 npm run kill:port
```

---

## Kiểm thử (npm scripts)

```bash
npm run test:websocket
npm run test:complete-system
npm run test:frontend-connection
npm run check:backend
npm run test:api
npm run test:automation
npm run test:google-sheets
npm run test:google-drive
npm run test:telegram
npm run test:email
npm run test:complete    # test:ci + test:scripts
```

Liệt kê đầy đủ:

```bash
npm run
```

---

## Automation / Google Sheets (Python)

Chạy từ **`automation/`** (không phải root):

```bash
cd automation
source venv/bin/activate   # sau khi đã python3 -m venv venv && pip install -r requirements.txt

bash scripts/health-check.sh
python3 test_sheets_connection.py
python3 verify_sheets.py
```

**Lưu ý đường dẫn:** `bash scripts/health-check.sh` — có dấu **`/`** giữa `scripts` và `health-check.sh`.

Tài liệu: [automation/GOOGLE_SHEETS_SETUP_GUIDE.md](automation/GOOGLE_SHEETS_SETUP_GUIDE.md), [START_HERE.md](START_HERE.md).

---

## Lint / format (frontend)

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run type:check
```

---

## Troubleshooting

### `npm error Missing script: "..."`

1. `pwd` + `test -f package.json`
2. `npm run` — xem danh sách script thực tế
3. `npm install` nếu vừa pull thay đổi `package.json`

### Backend / AI không lên

- `npm run check:ports`
- Đọc [README.md](README.md) mục **Cài đặt và khởi chạy**
- [ENV_SETUP.md](ENV_SETUP.md), `automation/.env` cho Sheets / ONE

---

## Cheat sheet (rút gọn)

| Việc                         | Lệnh                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Cài dependency               | `npm install`                                                                    |
| Dev full stack (npm)         | `npm run dev`                                                                    |
| Start theo script repo       | `./start.sh`                                                                     |
| Xóa kẹt cổng 3000/3001/8000  | `npm run fix:ports`                                                              |
| Health nhanh                 | `npm run health:quick`                                                           |
| Test Sheets (Node)           | `npm run test:google-sheets`                                                     |
| Test Drive qua API backend   | `npm run test:google-drive` (backend **3001** phải chạy)                         |
| Complete system (Node)       | `npm run test:complete-system` → `scripts/tests/complete_system_test.js`         |
| Frontend ↔ API checks        | `npm run test:frontend-connection` → `scripts/tests/frontend_connection_test.js` |
| Health automation + path key | `cd automation && bash scripts/health-check.sh`                                  |

---

**Last updated:** 2026-04-22
