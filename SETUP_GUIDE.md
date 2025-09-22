# 🚀 Hướng dẫn Setup React Google Integration App

## Tổng quan

Ứng dụng React này tích hợp với Google Sheets và Google Drive APIs để tạo ra một dashboard test hoàn chỉnh. Bạn có thể test các chức năng đọc/ghi dữ liệu Google Sheets và upload/quản lý files trên Google Drive.

## ✅ Checklist Setup

### 1. Google Cloud Setup

- [ ] Tạo Google Cloud Project
- [ ] Enable Google Sheets API
- [ ] Enable Google Drive API
- [ ] Tạo Service Account
- [ ] Download Service Account JSON key
- [ ] Ghi chú Service Account email: `_______________________`

### 2. Google Sheets Setup

- [ ] Tạo Google Sheet mới
- [ ] Copy Sheet ID từ URL: `_______________________`
- [ ] Chia sẻ Sheet với Service Account email (quyền Editor)

### 3. Google Drive Setup

- [ ] Tạo thư mục trên Google Drive
- [ ] Copy Folder ID từ URL: `_______________________`
- [ ] Chia sẻ thư mục với Service Account email (quyền Editor)

### 4. Cài đặt Project

- [ ] Copy file `env.example` thành `.env`
- [ ] Cấu hình tất cả biến môi trường trong `.env`
- [ ] Chạy: `npm install`

### 5. Test & Run

- [ ] Test kết nối: `npm run test:google`
- [ ] Chạy ứng dụng: `npm start`
- [ ] Test từng tab: Sheets, Drive

## 📋 Chi tiết từng bước

### Bước 1: Google Cloud Console Setup

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Library**
4. Tìm và kích hoạt:
   - **Google Sheets API**
   - **Google Drive API**

### Bước 2: Tạo Service Account

1. Vào **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **Service account**
3. Điền thông tin:
   - **Service account name**: `react-google-integration`
   - **Description**: `Service account for React Google integration`
4. Click **CREATE AND CONTINUE**
5. Gán role **Editor** cho service account
6. Skip phần **Grant users access**
7. Click **DONE**

### Bước 3: Tải xuống Service Account Key

1. Trong danh sách Service Accounts, click vào service account vừa tạo
2. Vào tab **Keys**
3. Click **ADD KEY** > **Create new key**
4. Chọn **JSON** format
5. Click **CREATE** - file JSON sẽ được tải xuống

### Bước 4: Cấu hình Google Sheet

1. Tạo Google Sheet mới hoặc sử dụng sheet hiện có
2. Lấy Sheet ID từ URL:

   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit#gid=0
   ```

3. Click **Share** trên Google Sheet
4. Thêm email service account (từ file JSON: `client_email`)
5. Chọn quyền **Editor**

### Bước 5: Cấu hình Google Drive

1. Tạo thư mục mới trên Google Drive
2. Lấy Folder ID từ URL:

   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

3. Click **Share** trên thư mục
4. Thêm email service account
5. Chọn quyền **Editor**

### Bước 6: Cấu hình Environment Variables

1. Copy file `env.example` thành `.env`:

   ```bash
   cp env.example .env
   ```

2. Mở file `.env` và điền thông tin từ file JSON service account:

   ```env
   # Lấy từ file JSON service account
   REACT_APP_GOOGLE_PRIVATE_KEY_ID=your_private_key_id
   REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   REACT_APP_GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id
   REACT_APP_GOOGLE_PROJECT_ID=your_project_id

   # Lấy từ Google Sheet và Drive
   REACT_APP_GOOGLE_SHEET_ID=your_sheet_id
   REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
   ```

### Bước 7: Cài đặt và Test

1. Cài đặt dependencies:

   ```bash
   npm install
   ```

2. Chạy ứng dụng demo (không cần cấu hình):

   ```bash
   npm start
   ```

3. Mở trình duyệt tại `http://localhost:3000` để xem demo

4. Sau khi cấu hình xong .env, test kết nối Google APIs:

   ```bash
   npm run test:google
   ```

5. Chuyển sang test mode bằng cách sửa `src/App.js`:

   ```javascript
   // Thay đổi từ DemoDashboard sang TestDashboard
   import TestDashboard from "./components/Dashboard/TestDashboard";
   ```

## 🧪 Testing Features

### Google Sheets Tab

- **Get Sheet Metadata**: Lấy thông tin về sheet
- **Read Sheet Data**: Đọc dữ liệu từ sheet
- **Write Sample Data**: Ghi dữ liệu mẫu
- **Append New Row**: Thêm dòng mới

### Google Drive Tab

- **List Files**: Liệt kê files trong thư mục
- **Create Test Folder**: Tạo thư mục test
- **Generate Test Report**: Tạo và upload báo cáo JSON
- **Upload File**: Upload file từ máy tính

## 🔧 Troubleshooting

### Lỗi thường gặp

1. **❌ Configuration error**: Kiểm tra file `.env` có đầy đủ biến môi trường
2. **❌ 403 Forbidden**: Service account chưa được share quyền truy cập
3. **❌ API not enabled**: Chưa kích hoạt Google Sheets/Drive API
4. **❌ Invalid credentials**: Sai thông tin trong file service account key

### Giải pháp

1. **Kiểm tra .env**: Đảm bảo tất cả biến môi trường được điền đúng
2. **Kiểm tra quyền**: Xác nhận service account đã được share với quyền Editor
3. **Kiểm tra APIs**: Xác nhận Google Sheets API và Drive API đã được kích hoạt
4. **Kiểm tra format**: Đảm bảo private key được format đúng với `\n`

## 📚 Tài liệu tham khảo

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [React Documentation](https://reactjs.org/docs)

## 🎉 Kết luận

Sau khi setup thành công, bạn sẽ có:

- ✅ Dashboard test hoàn chỉnh
- ✅ Tích hợp Google Sheets (đọc/ghi dữ liệu)
- ✅ Tích hợp Google Drive (upload/quản lý files)
- ✅ Error handling và logging
- ✅ UI thân thiện và responsive

**Chúc bạn phát triển ứng dụng thành công! 🚀**
