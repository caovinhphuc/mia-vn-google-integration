# 🚀 Hướng dẫn sử dụng LoginPage - MIA Warehouse System

## ✅ Đã hoàn thành tích hợp

LoginPage đã được tích hợp thành công vào App.jsx với đầy đủ tính năng:

### 🔧 Các thay đổi đã thực hiện

1. **Import LoginPage vào App.jsx**
   - Thêm import `LoginPage` từ `./pages/Login/LoginPage`
   - Thay thế component `AuthLogin` đơn giản bằng `LoginPage` chuyên nghiệp

2. **Tạo Context Providers**
   - **AuthProvider**: Quản lý trạng thái xác thực
   - **ThemeProvider**: Quản lý chế độ dark/light mode
   - **useAuth hook**: Cung cấp `isAuthenticated`, `isLoading`, `user`, `serviceAccount`
   - **useTheme hook**: Cung cấp `isDarkMode`, `toggleTheme`

3. **Tạo unifiedGoogleSheetsService.js**
   - `testConnection()`: Kiểm tra kết nối Google Sheets
   - `verifyCredentials()`: Xác thực thông tin đăng nhập
   - `logAuditEvent()`: Ghi log hoạt động
   - Hỗ trợ cả development và production mode

4. **Sửa lỗi linting và import paths**
   - Loại bỏ tất cả `console.log` statements
   - Tuân thủ quy tắc ESLint
   - Sửa import paths: `../App` → `../../App`
   - Sửa import paths: `../services/` → `../../services/`

## 🎯 Cách sử dụng

### 1. Truy cập trang đăng nhập

```
http://localhost:3000/auth/login
```

### 2. Tài khoản demo (Development Mode)

```
Username: admin
Password: admin123
Role: Administrator

Username: user
Password: user123
Role: Regular User

Username: demo
Password: demo123
Role: Demo User
```

### 3. Tính năng chính

#### 🔐 Authentication

- Xác thực qua Google Sheets (production)
- Fallback với tài khoản demo (development)
- Rate limiting (3 lần thử, khóa 5 phút)
- Audit logging

#### 🎨 UI/UX

- Dark/Light mode toggle
- Responsive design
- Loading states
- Error handling
- Connection status indicator

#### 🔒 Security

- Password visibility toggle
- Remember me functionality
- Session management
- Secure token generation

## 🛠️ Cấu hình Production

### 1. Google Sheets Setup

Để sử dụng với Google Sheets thực tế, cần:

1. **Tạo Google Cloud Project**
2. **Enable APIs**: Google Sheets API, Google Drive API
3. **Tạo Service Account** và download JSON key
4. **Cấu hình environment variables**:

   ```env
   REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
   REACT_APP_GOOGLE_PROJECT_ID=your_project_id
   REACT_APP_GOOGLE_CLIENT_EMAIL=your_service_account_email
   REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   ```

### 2. Google Sheets Structure

Tạo sheet "Users" với cấu trúc:

```
A: username
B: password
C: role
D: name
E: email
```

Ví dụ:

```
admin    | admin123 | admin | Administrator | admin@mia.vn
user     | user123  | user  | Regular User  | user@mia.vn
```

## 🚀 Chạy ứng dụng

```bash
cd /Users/phuccao/Downloads/mia-vn-google-integration-main
npm start
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

## 📱 Responsive Design

LoginPage được thiết kế responsive cho:

- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🎨 Theme Support

- **Light Mode**: Giao diện sáng, thân thiện
- **Dark Mode**: Giao diện tối, chuyên nghiệp
- **Auto-save**: Lưu preference trong localStorage

## 🔄 State Management

- **Redux**: Quản lý authentication state
- **Context**: Theme và Auth providers
- **localStorage**: Persistent data
- **sessionStorage**: Session tokens

## ✅ Testing

Để test chức năng đăng nhập:

1. Mở `http://localhost:3000/auth/login`
2. Sử dụng tài khoản demo: `admin` / `admin123`
3. Kiểm tra:
   - ✅ Connection status hiển thị "Kết nối Google Sheets thành công"
   - ✅ Dark/Light mode toggle hoạt động
   - ✅ Form validation
   - ✅ Loading states
   - ✅ Error handling
   - ✅ Successful login redirect

## 🎯 Kết quả

LoginPage đã được tích hợp hoàn chỉnh với:

- ✅ Giao diện chuyên nghiệp
- ✅ Authentication system
- ✅ Theme support
- ✅ Responsive design
- ✅ Error handling
- ✅ Security features
- ✅ Development & Production modes

Hệ thống sẵn sàng để sử dụng! 🚀
