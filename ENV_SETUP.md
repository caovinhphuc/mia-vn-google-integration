# Cài đặt môi trường (Environment & Terminal)

Hướng dẫn **đúng với repo hiện tại**: dependencies, file `.env`, thứ tự merge biến, backend/scripts, health check.

## 1. Yêu cầu hệ thống

| Công cụ | Phiên bản trong repo                                                                                    | Ghi chú                                      |
| ------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Node.js | **20** (`.nvmrc`)                                                                                       | `nvm use` trước khi `npm install`            |
| npm     | **10.x** (`packageManager`: `npm@10.0.0`)                                                               |                                              |
| Python  | **3.11** (`.python-version`); venv automation/ai-service nên **3.11**; tránh **3.14+** khi tạo venv mới | [PYTHON_VENV_GUIDE.md](PYTHON_VENV_GUIDE.md) |
| Git     | bất kỳ                                                                                                  |                                              |

## 2. Cài đặt dependencies

**Luôn từ root repo** (thư mục có `package.json` gốc):

```bash
nvm use

npm ci
# hoặc: npm install

cd backend && npm ci && cd ..
```

**Python (tuỳ tác vụ):**

```bash
cd ai-service && pip install -r requirements.txt && cd ..
# hoặc: npm run setup:ai-service
# Automation: npm run setup:automation
```

## 3. Workspace & terminal

- Mở **một** file workspace ở root, ví dụ: `React-OAS-Integration-v4.0.code-workspace`, `mia-oas.code-workspace`, hoặc `react-oas-integration.code-workspace`.
- Terminal mặc định: **root** (`${workspaceFolder}`), zsh (macOS).
- Extensions gợi ý: Prettier, ESLint, Python, GitLens.

## 4. Biến môi trường — file nào, merge thế nào

### 4.1 Khởi tạo

```bash
cp .env.example .env
# Chỉnh giá trị thật; có thể thêm backend/.env, automation/.env, .env.local
```

**Không** đặt `PORT=` ở `.env` root nếu chạy CRA (`npm start`) — `react-scripts` dùng `PORT` làm cổng frontend (mặc định 3000). Backend dùng `BACKEND_PORT=3001` hoặc `PORT` do PaaS inject.

### 4.2 Backend Node (`backend/src/server.js`)

Nạp theo thứ tự (file sau **ghi đè** biến trùng tên):

1. `.env` (root)
2. `backend/.env`
3. `automation/.env`
4. `.env.local` (root)

Nhiều script Node trong `scripts/` dùng **cùng kiểu** (health check, test email/Telegram, test API, v.v.) — đặt ID Sheet / token ở `automation/.env` vẫn được backend đọc sau khi restart.

### 4.3 Frontend (CRA)

Chỉ biến `REACT_APP_*` được embed vào bundle build. Vite dùng `VITE_*` — xem `.env.example`.

### 4.4 Google — credentials (một trong các cách)

| Biến / vị trí                                                                               | Mô tả                                                                                                                                                  |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GOOGLE_APPLICATION_CREDENTIALS`                                                            | Path tới JSON service account (tương đối từ **root** hoặc absolute)                                                                                    |
| `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`, `GOOGLE_CREDENTIALS_PATH`, `GOOGLE_SERVICE_ACCOUNT_FILE` | Alias path (script/checker khác nhau có thể dùng tên khác)                                                                                             |
| File mặc định thường dùng                                                                   | `config/service_account.json`, `config/google-credentials.json`, `automation/config/service_account.json`, `automation/config/google-credentials.json` |

Chi tiết: [docs/GOOGLE_CREDENTIALS_SETUP.md](docs/GOOGLE_CREDENTIALS_SETUP.md)

### 4.5 Google — Spreadsheet ID (backend đã **chuẩn hóa**)

Backend resolve ID theo thứ tự, **bỏ placeholder** (`YOUR_SHEET_ID`, `your_*`, …):

`GOOGLE_SHEETS_ID` → `GOOGLE_SHEET_ID` → `GOOGLE_SHEETS_SPREADSHEET_ID` → `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID` → `REACT_APP_GOOGLE_SHEET_ID` → `REACT_APP_GOOGLE_SHEETS_ID` → `VITE_GOOGLE_SHEETS_SPREADSHEET_ID` → fallback demo trong code.

**Khuyến nghị:** giữ **một** ID thật trùng ở `GOOGLE_SHEETS_ID` hoặc `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID` để frontend + backend + script không lệch.

### 4.6 Google Drive folder (tuỳ chọn)

`GOOGLE_DRIVE_FOLDER_ID` hoặc `REACT_APP_GOOGLE_DRIVE_FOLDER_ID` (và có thể fallback theo spreadsheet ID trong server).

### 4.7 API & service URLs

| Biến                                           | Mặc định / ghi chú                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| `REACT_APP_API_URL` / `REACT_APP_API_BASE_URL` | Backend API; script test dùng `.../api`                                       |
| `REACT_APP_AI_SERVICE_URL`                     | **AI FastAPI** — `http://localhost:8000` (không nhầm với automation **8001**) |
| `REACT_APP_AUTOMATION_API_URL`                 | Automation HTTP — `http://localhost:8001`                                     |

Xem thêm: [Document/AI_SERVICE_GUIDE.md](Document/AI_SERVICE_GUIDE.md)

### 4.8 Telegram

| Biến                                                     | Ghi chú                                                                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN` hoặc `REACT_APP_TELEGRAM_BOT_TOKEN` | Token dạng `123456789:AAH...` — **không** thêm tiền tố `bot`; không dán full URL (health-check/script sẽ chuẩn hoá) |
| `TELEGRAM_CHAT_ID` / `REACT_APP_TELEGRAM_CHAT_ID`        | Chat / group để test                                                                                                |

### 4.9 Email

SMTP: `SMTP_HOST`, `SMTP_USER`, **`SMTP_PASS` hoặc `SMTP_PASSWORD`** (cả hai tên đều được script test nhận). SendGrid: `SENDGRID_API_KEY` + `SENDGRID_FROM_EMAIL` hoặc `EMAIL_FROM`.

### 4.10 Công cụ đồng bộ / kiểm tra env

| Lệnh / file                          | Mục đích                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `./scripts/check-env.sh`             | Bash checker; `CHECK_ENV_STRICT=1` cho deploy; `CHECK_ENV_LIST_OPTIONAL=1` liệt kê optional |
| `node scripts/list-env-variables.js` | Liệt kê biến từ `.env.example` (đối chiếu checker)                                          |
| `node scripts/merge-env.js`          | Gộp / chuẩn hoá env (xem `--help` trong file)                                               |

Setup một lần: [AUTOMATED_SETUP.md](AUTOMATED_SETUP.md) — `node scripts/setup.js`

## 5. Kiểm tra sau khi cài

```bash
npm run tools:check      # Node, npm, Python, git (alias: npm run check:tools)
npm run verify:setup     # bash scripts/verify-setup.sh
npm run check:backend    # curl :3001/health (backend phải đang chạy)
npm run health-check     # node scripts/health-check.js
npm run health:full      # bash scripts/utils/comprehensive-health-check.sh
npm run health:quick     # scripts/health-quick.sh — bảng màu + ms (3000, 3001, 8000/8001 optional)
```

**Health check (`npm run health-check`):**

- Google Sheets / Drive + credentials: phần lõi thường được kiểm tra kỹ.
- Email / Telegram: **coi là optional** khi **chưa cấu hình** token/key → `skipped: true`, không làm fail overall.
- Nếu **đã** set token Telegram / SendGrid nhưng **sai** (401/404): service đó báo **error** → overall có thể **UNHEALTHY** — sửa token/key hoặc gỡ biến để coi như chưa cấu hình.
- `HEALTH_CHECK_WARN_OPTIONAL=1`: thêm cảnh báo gộp biến optional chưa set (tránh spam từng dòng).

## 6. Lệnh npm hữu ích

| Lệnh                    | Mô tả                                                             |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run dev`           | Frontend + backend + AI (8000)                                    |
| `npm run start`         | Chỉ CRA (3000)                                                    |
| `npm run backend`       | Backend (3001)                                                    |
| `npm run ai-service`    | AI FastAPI (8000)                                                 |
| `npm run fix:ports`     | Giải phóng **3000, 3001, 8000** (không kill 8001 mặc định)        |
| `npm run test:api`      | `scripts/test-api-endpoints.js` (tách AI 8000 vs Automation 8001) |
| `npm run test:telegram` | `scripts/testTelegramConnection.js`                               |

Danh sách script: [scripts/README.md](scripts/README.md)

## 7. Cập nhật sau này

- `npm update` (root + `backend/`); Python: `pip install -r requirements.txt -U` trong `ai-service/` hoặc venv automation.
- Luôn `nvm use` (Node **20**) trước khi cài npm.

## 8. Automation & subproject

- `automation/`, `one_automation_system/` có **`.env.example` riêng** cho pipeline Python.
- **Backend** đã merge `automation/.env` — biến Google/Telegram đặt ở automation vẫn có hiệu lực sau **restart** `backend`.
- Chỉ chạy Python automation: làm theo README / setup trong từng thư mục đó.

## 9. Tài liệu liên quan

| Tài liệu                                                       | Nội dung                         |
| -------------------------------------------------------------- | -------------------------------- |
| [AUTOMATED_SETUP.md](AUTOMATED_SETUP.md)                       | `node scripts/setup.js`          |
| [HEALTH_CHECK_GUIDE.md](HEALTH_CHECK_GUIDE.md)                 | Health / monitoring              |
| [GOOGLE_SHEETS_SETUP_GUIDE.md](GOOGLE_SHEETS_SETUP_GUIDE.md)   | Sheet ID, share SA               |
| [DEVELOPMENT_TOOLS_SETUP.md](DEVELOPMENT_TOOLS_SETUP.md)       | Công cụ dev                      |
| [Document/DEV_SCRIPTS_NOTES.md](Document/DEV_SCRIPTS_NOTES.md) | Lighthouse / bundle (gitignored) |

---

_Cập nhật: 2026-04-22 — đồng bộ `backend/src/server.js`, `scripts/check-env.sh`, `scripts/health-check.js`, `package.json`._
