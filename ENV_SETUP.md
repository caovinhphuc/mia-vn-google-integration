# Cài đặt lại môi trường (Environment & Terminal)

Hướng dẫn kiểm tra và cài đặt lại thư viện, config workspace, terminal.

## 1. Yêu cầu hệ thống

| Công cụ | Phiên bản gợi ý                                | Ghi chú                                                    |
| ------- | ---------------------------------------------- | ---------------------------------------------------------- |
| Node.js | **20** (theo `.nvmrc`)                         | `nvm use` — có thể thử 18 LTS nếu cần, repo khuyến nghị 20 |
| npm     | **10.x** (`npm@10.0.0` trong `packageManager`) |                                                            |
| Python  | 3.10+                                          | Cho `ai-service` (`uvicorn`), automation nếu dùng          |
| Git     | bất kỳ                                         | Version control                                            |

## 2. Cài đặt lại dependencies

**Từ workspace root** (thư mục chứa `package.json`):

```bash
# Node version (nếu dùng nvm)
nvm use   # hoặc nvm install

# Root – frontend + scripts
npm ci
# hoặc nếu không có package-lock đúng: npm install

# Backend
cd backend && npm ci && cd ..

# AI service (Python)
cd ai-service && pip install -r requirements.txt && cd ..
# hoặc: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
```

## 3. Config workspace & terminal

- **Workspace**: Mở `React-OAS-Integration-v4.0.code-workspace` (ở **root repo**) trong Cursor/VS Code.
- **Terminal mặc định**: Mở tại `${workspaceFolder}` (root). Profile: zsh (macOS).
- **Extensions khuyến nghị**: Prettier, ESLint, Tailwind, Python, GitLens — Cursor sẽ gợi ý khi mở workspace.

Sau khi cài xong, mở **Terminal mới** để áp dụng `.nvmrc` / env.

## 4. Biến môi trường (.env)

- Copy `.env.example` → `.env` (**root repo**) và điền giá trị thật.
- **Backend** (`backend/src/server.js`) dùng `dotenv` với path **`../../.env`** tức là **cùng file `.env` ở root** — không bắt buộc `backend/.env`.
- **CRA frontend**: chỉ biến có tiền tố `REACT_APP_*` được embed vào bundle (xem `.env.example`).
- Chi tiết Google: [docs/GOOGLE_CREDENTIALS_SETUP.md](docs/GOOGLE_CREDENTIALS_SETUP.md)

```bash
cp .env.example .env
# Chỉnh .env: PORT (backend 3001), JWT_SECRET, Google, SMTP, REACT_APP_* …
# Lưu ý: đừng đặt PORT=3001 trong .env nếu muốn `npm start` chạy CRA trên 3000 — CRA đọc PORT.
```

### Google Drive/Sheets (dữ liệu thật)

| Biến                                                                                 | Mô tả                                                                                    |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `GOOGLE_APPLICATION_CREDENTIALS`                                                     | Path tới JSON service account (vd: `./config/google-credentials.json`, relative từ root) |
| `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`                                                    | (Tuỳ chọn) path thay thế mà backend thử                                                  |
| `GOOGLE_DRIVE_FOLDER_ID` hoặc `REACT_APP_GOOGLE_DRIVE_FOLDER_ID`                     | Folder Drive                                                                             |
| **`GOOGLE_SHEETS_SPREADSHEET_ID`** hoặc **`REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID`** | **Spreadsheet ID — backend đọc hai tên này** (ưu tiên theo thứ tự trong `server.js`)     |

**Tên cũ / chỗ khác trong repo:** `GOOGLE_SHEETS_ID`, `REACT_APP_GOOGLE_SHEET_ID` (singular) dùng ở **frontend** (`src/config/googleConfig.js`) hoặc **một số script** — nên **đồng bộ cùng một ID** với bảng trên để tránh lệch môi trường.

→ Đặt file `config/google-credentials.json` (Service Account JSON từ Google Cloud).

## 5. Kiểm tra sau khi cài

```bash
# Công cụ (Node, npm, Python, git) — alias: npm run check:tools
npm run tools:check

# Scripts và setup (bash scripts/verify-setup.sh)
npm run verify:setup

# Backend health (cần backend đang chạy trên 3001)
npm run check:backend
```

## 6. Lệnh hữu ích

| Lệnh                   | Mô tả                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `npm run dev`          | Frontend + Backend + AI service                                                     |
| `npm run start`        | Chỉ frontend (port 3000)                                                            |
| `npm run backend`      | Chỉ backend (port 3001)                                                             |
| `npm run ai-service`   | Chỉ AI service (port 8000)                                                          |
| `npm run fix:ports`    | Giải phóng port 3000/3001/8000                                                      |
| `npm run health:quick` | Kiểm tra nhanh: 3000 + 3001/health; AI **8000** hoặc automation **8001** (optional) |

## 7. Cập nhật môi trường sau này

- **Cập nhật dependencies**: `npm update` (root và `backend/`); `pip install -r requirements.txt -U` trong `ai-service/`.
- **Đồng bộ Node**: Luôn chạy `nvm use` (theo `.nvmrc` = **20**) trước khi `npm install` / `npm run`.

## 8. Automation / subproject (tuỳ mục đích)

- Thư mục `automation/`, `one_automation_system/` có **`.env.example` riêng** — không gộp vào bảng trên.
- Chỉ cần khi bạn chạy pipeline Python/automation đó; frontend + backend chính vẫn dùng `.env` root.

---

_Cập nhật theo repo: Node 20 (`.nvmrc`), `backend` load root `.env`, biến spreadsheet backend `GOOGLE_SHEETS_SPREADSHEET_ID`. Công cụ dev: [DEVELOPMENT_TOOLS_SETUP.md](./DEVELOPMENT_TOOLS_SETUP.md). Artefact Lighthouse/bundle gitignored: [Document/DEV_SCRIPTS_NOTES.md](./Document/DEV_SCRIPTS_NOTES.md)._
