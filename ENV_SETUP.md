# Cài đặt lại môi trường (Environment & Terminal)

Hướng dẫn kiểm tra và cài đặt lại thư viện, config workspace, terminal.

## 1. Yêu cầu hệ thống

| Công cụ    | Phiên bản gợi ý | Ghi chú              |
|------------|------------------|----------------------|
| Node.js    | 18 hoặc 20 LTS   | Dùng `.nvmrc`: `nvm use` |
| npm        | 10.x             | `packageManager` trong package.json |
| Python     | 3.10+            | Cho `ai-service`, automation |
| Git        | bất kỳ           | Version control      |

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

- **Workspace**: Mở `React-OAS-Integration-v4.0.code-workspace` trong Cursor/VS Code.
- **Terminal mặc định**: Mở tại `${workspaceFolder}` (root). Profile: zsh (macOS).
- **Extensions khuyến nghị**: Prettier, ESLint, Tailwind, Python, GitLens — Cursor sẽ gợi ý khi mở workspace.

Sau khi cài xong, mở **Terminal mới** để áp dụng `.nvmrc` / env.

## 4. Biến môi trường (.env)

- Copy `.env.example` → `.env` (root) và điền giá trị thật.
- **Backend load `.env` từ project root** (không cần `backend/.env`).
- Xem chi tiết: [docs/GOOGLE_CREDENTIALS_SETUP.md](docs/GOOGLE_CREDENTIALS_SETUP.md)

```bash
cp .env.example .env
# Chỉnh .env: PORT, JWT_SECRET, Google credentials, SMTP, ...
```

### Google Drive/Sheets (dữ liệu thật)

| Biến | Mô tả |
|------|-------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path tới `config/google-credentials.json` |
| `GOOGLE_DRIVE_FOLDER_ID` | Folder ID (vd: `1OpCHA1Qnf3AHYZqzRjzeiMxODoAeV4_V`) |
| `GOOGLE_SHEETS_ID` | Spreadsheet ID |

→ Đặt file `config/google-credentials.json` (Service Account JSON từ Google Cloud).

## 5. Kiểm tra sau khi cài

```bash
# Công cụ (Node, npm, Python, git)
npm run tools:check

# Scripts và setup
npm run verify:setup

# Backend health (cần chạy backend trước)
npm run check:backend
```

## 6. Lệnh hữu ích

| Lệnh                | Mô tả                          |
|---------------------|--------------------------------|
| `npm run dev`       | Frontend + Backend + AI service |
| `npm run start`     | Chỉ frontend (port 3000)       |
| `npm run backend`   | Chỉ backend (port 3001)        |
| `npm run ai-service`| Chỉ AI service (port 8000)     |
| `npm run fix:ports` | Giải phóng port 3000/3001/8000 |
| `npm run health:quick` | Kiểm tra nhanh các service   |

## 7. Cập nhật môi trường sau này

- **Cập nhật dependencies**: `npm update` (root và backend); `pip install -r requirements.txt -U` (ai-service).
- **Đồng bộ Node**: Luôn chạy `nvm use` (hoặc dùng Node đúng bản trong `.nvmrc`) trước khi `npm install`/`npm run`.
