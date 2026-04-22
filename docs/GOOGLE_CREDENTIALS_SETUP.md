# Cấu hình Google Drive & Sheets (Backend Node + .env)

Hướng dẫn để **backend** (`backend/src/server.js`, port **3001**) dùng **Service Account JSON** thật cho **Google Drive v3** và **Sheets v4**. Không có key → API trả **mock data** (log cảnh báo).

**Python / automation / `one_automation_system`:** resolve key và Sheets rộng hơn — xem [automation/GOOGLE_SHEETS_SETUP_GUIDE.md](../automation/GOOGLE_SHEETS_SETUP_GUIDE.md).

---

## 1. Bật API trên Google Cloud

Trong project GCP của service account:

1. **APIs & Services** → **Library**
2. Bật **Google Drive API** và **Google Sheets API**

Không bật Drive → lỗi khi gọi `drive.files.list` dù JSON đúng.

---

## 2. File JSON & thứ tự tìm (backend)

Hàm `initGoogleDrive()` / `initGoogleSheets()` dùng **danh sách cố định** (file đầu tiên tồn tại trên disk được dùng):

| Thứ tự | Nguồn                                    | Ghi chú                                                                                                                                                  |
| ------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | `GOOGLE_APPLICATION_CREDENTIALS`         | Nếu path **tương đối** → ghép với **root repo** (`path.join(projectRoot, …)`)                                                                            |
| 2      | `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`        | Nên dùng **đường dẫn tuyệt đối** (code không ghép thêm root)                                                                                             |
| 3      | `config/google-credentials.json`         | Khuyến nghị đặt file tại đây                                                                                                                             |
| 4      | `config/service_account.json`            | Cách đặt tên thường gặp                                                                                                                                  |
| 5      | `mia-logistics-*.json` ở root            | **Legacy** trong code — có thể bỏ qua                                                                                                                    |
| 6      | `automation/config/service_account.json` | **Drive:** bước cuối. **Sheets:** sau `config/` và **trước** file legacy root — xem `initGoogleDrive` / `initGoogleSheets` trong `backend/src/server.js` |

Không commit private key: thêm `config/*.json` vào `.gitignore` nếu chưa có.

---

## 3. Đặt file credentials

```bash
# Từ root repo
mkdir -p config
cp ~/Downloads/your-project-xxxx.json config/google-credentials.json
chmod 600 config/google-credentials.json
```

Lấy JSON: Cloud Console → **Credentials** → Service account → **Keys** → JSON.

---

## 4. Biến môi trường (root `.env`)

Backend load `.env` ở **root** (xem `backend/src/server.js` → `dotenv` path `../../.env`).

```env
# Một trong các cách trỏ tới JSON (ưu tiên dòng 1 hoặc 2)
GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json
# GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/absolute/path/to/service-account.json

# Drive: ID folder trong URL …/drive/folders/<FOLDER_ID>
GOOGLE_DRIVE_FOLDER_ID=YOUR_DRIVE_FOLDER_ID

# Sheets (backend đọc — ưu tiên theo DEFAULT_SPREADSHEET_ID trong code)
GOOGLE_SHEETS_SPREADSHEET_ID=YOUR_SPREADSHEET_ID
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=YOUR_SPREADSHEET_ID
# Tuỳ chọn frontend:
# REACT_APP_GOOGLE_DRIVE_FOLDER_ID=YOUR_DRIVE_FOLDER_ID
```

**Folder mặc định khi list file:** `DEFAULT_DRIVE_FOLDER_ID` = `GOOGLE_DRIVE_FOLDER_ID` → `REACT_APP_GOOGLE_DRIVE_FOLDER_ID` → fallback sang biến Sheet ID (xem `server.js`) → có thể `null` (list theo `root`).

---

## 5. Share Drive / Sheet với Service Account

1. Mở file JSON đang dùng → copy **`client_email`** (`…@….iam.gserviceaccount.com`).
2. **Google Drive:** mở folder cần đọc → **Share** → thêm `client_email` (**Viewer** hoặc **Editor** tùy nhu cầu).
3. **Google Sheets:** **Share** spreadsheet với cùng `client_email` (thường **Editor** nếu backend ghi).

Thiếu share → API trả 403 / list rỗng.

---

## 6. Kiểm tra sau khi chỉnh .env

```bash
cd backend && npm start
```

Log kỳ vọng (khi tìm được file key):

- `✅ Google Drive API initialized`
- `✅ Google Sheets API initialized with: …`

Nếu thấy:

- `⚠️ No Google Drive credentials file found, will use mock data`

→ Kiểm tra path env, file có tồn tại, và **Google Drive API** đã bật.

---

## 7. Gọi thử API (sau khi backend chạy)

```bash
# List file trong folder mặc định (.env GOOGLE_DRIVE_FOLDER_ID)
curl -s "http://localhost:3001/api/drive/files"

# Hoặc chỉ định folder
curl -s "http://localhost:3001/api/drive/files?folderId=YOUR_DRIVE_FOLDER_ID"

# Sheets (range tuỳ sheet thật)
curl -s "http://localhost:3001/api/sheets/read?range=Sheet1%21A1%3AZ10"
```

---

## 8. Tài liệu liên quan

- [GOOGLE_DRIVE_FOLDER_ID.md](../GOOGLE_DRIVE_FOLDER_ID.md) — lấy folder ID từ URL
- [ENV_SETUP.md](../ENV_SETUP.md) — `.env` root / CRA
- [automation/GOOGLE_SHEETS_SETUP_GUIDE.md](../automation/GOOGLE_SHEETS_SETUP_GUIDE.md) — Python, `~/.secrets`, health-check

**Last updated:** 2026-04-22 — đồng bộ `server.js`, Drive API, bỏ ví dụ ID/link thật trong doc.
