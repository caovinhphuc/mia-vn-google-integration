# Cấu hình Google Drive & Sheets - Dữ liệu thật

Hướng dẫn cấu hình để Backend đọc dữ liệu thật từ Google Drive và Google Sheets.

## 1. Tổng quan

Backend cần **Google Service Account credentials** để gọi Google APIs. Nếu không có, sẽ dùng **mock data**.

| Thành phần    | Credentials                    | Fallback  |
| ------------- | ------------------------------ | --------- |
| Google Sheets | config/google-credentials.json | Mock data |
| Google Drive  | Cùng file                      | Mock data |

## 2. File credentials

### Vị trí tìm kiếm (theo thứ tự)

1. `GOOGLE_APPLICATION_CREDENTIALS` (env) → path tương đối hoặc tuyệt đối
2. `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` (env)
3. `config/google-credentials.json` ← **Khuyến nghị**
4. `config/service_account.json`
5. `mia-logistics-469406-eec521c603c0.json` (project root)
6. `automation/config/service_account.json`

### Cách lấy Service Account JSON

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project (hoặc tạo mới)
3. **APIs & Services** → **Credentials** → **Create Credentials** → **Service Account**
4. Tạo service account, tải JSON key
5. Đổi tên file thành `google-credentials.json` và copy vào `config/`:

```bash
cp ~/Downloads/your-project-xxxx.json config/google-credentials.json
```

## 3. Cấu hình .env

Thêm vào `.env` (project root):

```env
# Google credentials (relative to project root)
GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json

# Drive folder ID - folder "mia-logistics"
# https://drive.google.com/drive/folders/1OpCHA1Qnf3AHYZqzRjzeiMxODoAeV4_V
GOOGLE_DRIVE_FOLDER_ID=1OpCHA1Qnf3AHYZqzRjzeiMxODoAeV4_V

# Spreadsheet ID — backend đọc (ưu tiên):
GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
# Legacy / frontend (googleConfig.js) — nên trùng ID với trên:
# GOOGLE_SHEETS_ID=...
# REACT_APP_GOOGLE_SHEET_ID=...
```

Chi tiết biến `.env` root vs backend: [`ENV_SETUP.md`](../ENV_SETUP.md).

## 4. Backend load .env

Backend **tự động load** `.env` từ project root khi start:

```javascript
// backend/src/server.js
require("dotenv").config({
  path: require("path").join(__dirname, "../../.env"),
});
```

→ Chạy `cd backend && npm start` vẫn đọc được `.env` ở root.

## 5. Share folder với Service Account

**Bắt buộc** để đọc dữ liệu Drive:

1. Mở file `config/google-credentials.json`
2. Tìm field `client_email` (dạng `xxx@xxx.iam.gserviceaccount.com`)
3. Mở [folder mia-logistics](https://drive.google.com/drive/folders/1OpCHA1Qnf3AHYZqzRjzeiMxODoAeV4_V)
4. Chuột phải → **Share** → Thêm `client_email` → Chọn **Editor** hoặc **Viewer**

## 6. Kiểm tra

```bash
# Restart backend
cd backend && npm start
```

Log thành công:

```
✅ Google Drive API initialized
✅ Google Sheets API initialized with: .../config/google-credentials.json
```

Nếu vẫn thấy mock data:

```
⚠️ No Google Drive credentials file found, will use mock data
```

→ Kiểm tra lại path, file tồn tại, và đã share folder.

## 7. Test API

```bash
# List files trong Drive folder
curl "http://localhost:3001/api/drive/files"

# Đọc Google Sheets
curl "http://localhost:3001/api/sheets/read?range=A1:Z10"
```

---

**Tài liệu liên quan:**

- [GOOGLE_DRIVE_FOLDER_ID.md](../GOOGLE_DRIVE_FOLDER_ID.md) - Chi tiết folder ID
- [ENV_SETUP.md](../ENV_SETUP.md) - Cài đặt môi trường
