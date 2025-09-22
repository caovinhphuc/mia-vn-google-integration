# Hướng dẫn thiết lập Google Service Account và cấu hình APIs

## 1. Tạo Google Service Account

### Bước 1: Truy cập Google Cloud Console

1. Đi tới [Google Cloud Console](https://console.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn
3. Tạo project mới hoặc chọn project hiện có

### Bước 2: Kích hoạt APIs cần thiết

1. Trong Google Cloud Console, đi tới **APIs & Services** > **Library**
2. Tìm và kích hoạt các APIs sau:
   - **Google Sheets API**
   - **Google Drive API**

### Bước 3: Tạo Service Account

1. Đi tới **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **Service account**
3. Điền thông tin:
   - **Service account name**: `react-google-integration`
   - **Service account ID**: sẽ tự động tạo
   - **Description**: `Service account for React Google integration`
4. Click **CREATE AND CONTINUE**

### Bước 4: Gán quyền cho Service Account

1. Trong phần **Grant this service account access to project**:
   - Role: **Editor** (hoặc tùy chỉnh quyền cụ thể)
2. Click **CONTINUE**
3. Skip phần **Grant users access to this service account**
4. Click **DONE**

### Bước 5: Tạo và tải xuống Key

1. Trong danh sách Service Accounts, click vào service account vừa tạo
2. Đi tới tab **Keys**
3. Click **ADD KEY** > **Create new key**
4. Chọn **JSON** format
5. Click **CREATE** - file JSON sẽ được tải xuống tự động

### Bước 6: Cấu hình quyền truy cập Google Sheet

1. Mở file JSON vừa tải xuống
2. Copy email trong trường `client_email`
3. Mở Google Sheet của bạn
4. Click **Share** và thêm email service account với quyền **Editor**

## 2. Cấu trúc file Service Account Key

File JSON tải xuống sẽ có cấu trúc như sau:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "react-google-integration@your-project-id.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## 3. Bảo mật thông tin Service Account

### Biến môi trường (.env)

Tạo file `.env` trong thư mục gốc của React app:

```env
# Google Service Account Configuration
REACT_APP_GOOGLE_PRIVATE_KEY_ID=your_private_key_id
REACT_APP_GOOGLE_PRIVATE_KEY=your_private_key
REACT_APP_GOOGLE_CLIENT_EMAIL=your_client_email
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
REACT_APP_GOOGLE_PROJECT_ID=your_project_id

# Google Sheet Configuration
REACT_APP_GOOGLE_SHEET_ID=your_sheet_id

# Google Drive Configuration
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
```

### Thêm vào .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Service Account Keys
service-account-key.json
google-credentials.json
```

## 4. Lấy Google Sheet ID

Google Sheet ID là phần trong URL của Google Sheet:

```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit#gid=0
```

Ví dụ:

- URL: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0`
- Sheet ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## 5. Tạo Google Drive folder để lưu files

1. Tạo folder mới trong Google Drive
2. Share folder với service account email (quyền Editor)
3. Lấy folder ID từ URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

## 6. Kiểm tra cấu hình

Sau khi hoàn thành các bước trên:

- ✅ Service Account đã được tạo và có key JSON
- ✅ Google Sheets API và Drive API đã được kích hoạt
- ✅ Service account có quyền truy cập Google Sheet
- ✅ Service account có quyền truy cập Google Drive folder
- ✅ Biến môi trường đã được cấu hình
- ✅ File .env đã được thêm vào .gitignore

## Lưu ý quan trọng

1. **Bảo mật**: Không bao giờ commit file service account key vào git repository
2. **Quyền truy cập**: Chỉ cấp quyền tối thiểu cần thiết cho service account
3. **Backup**: Lưu trữ an toàn file service account key, nếu mất sẽ phải tạo lại
4. **Môi trường**: Sử dụng biến môi trường khác nhau cho development và production

## Troubleshooting

### Lỗi thường gặp:

1. **403 Forbidden**: Service account chưa được share quyền truy cập
2. **API not enabled**: Chưa kích hoạt Google Sheets/Drive API
3. **Invalid credentials**: Sai thông tin trong file service account key
4. **CORS error**: Cần cấu hình proxy cho development (xem file tiếp theo)
