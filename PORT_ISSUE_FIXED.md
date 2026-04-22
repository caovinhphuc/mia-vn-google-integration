# 🔧 Port Configuration Issue - FIXED

## 📋 Vấn đề

File `.env` ở **root** dùng chung cho CRA và backend. Đặt:

```bash
PORT=3001  # ❌ Sai — Create React App (`npm start`) CŨNG đọc PORT → dev server đòi 3001, trùng Express
```

## ✅ Giải pháp (khuyến nghị hiện tại)

### 1. Backend dùng `BACKEND_PORT`, không dùng `PORT` ở root khi dev full-stack

```bash
BACKEND_PORT=3001   # ✅ API Node — xem backend/src/server.js (PORT || BACKEND_PORT || 3001)
# Bỏ hẳn dòng PORT=… khỏi .env gốc — CRA mặc định chạy :3000
```

### 2. Cấu hình mẫu (root `.env`)

```bash
# Không cần PORT= cho frontend — mặc định CRA = 3000
BACKEND_PORT=3001

REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_BASE_URL=http://localhost:3001/api

# AI Service (tuỳ chọn)
REACT_APP_AI_SERVICE_URL=http://localhost:8000
```

**Deploy:** Nền tảng thường set `PORT` — backend vẫn ưu tiên `process.env.PORT` trước `BACKEND_PORT`.

## 🚀 Services hiện tại

| Service  | Port | Status     | URL                     |
| -------- | ---- | ---------- | ----------------------- |
| Frontend | 3000 | ✅ Running | <http://localhost:3000> |
| Backend  | 3001 | ✅ Running | <http://localhost:3001> |

## 🎯 Khởi động lại services

```bash
# Dừng tất cả services
pkill -f "react-scripts"
pkill -f "node server.js"

# Khởi động Backend
cd backend && npm start > ../logs/backend.log 2>&1 &

# Khởi động Frontend (sau 3 giây)
sleep 3 && npm start > logs/frontend.log 2>&1 &
```

## ⚠️ Warning về Ant Design

Warning này không ảnh hưởng đến chức năng:

```
Warning: [antd: message] Static function can not consume context like dynamic theme.
Please use 'App' component instead.
```

**Giải thích:**

- Ant Design khuyến nghị sử dụng `message` API thông qua `App` component
- Hiện tại code đang dùng static function `message.warning()`
- Chức năng vẫn hoạt động bình thường, chỉ là best practice warning

**Cách fix (nếu cần):**

```jsx
// Thay vì
import { message } from "antd";
message.warning("...");

// Nên dùng
import { App } from "antd";
const { message } = App.useApp();
message.warning("...");
```

## 📝 Login Credentials

```
Email:    admin@mia.vn
Password: admin123
```

## ✅ Kết quả

- ✅ Frontend chạy đúng port 3000
- ✅ Backend chạy đúng port 3001
- ✅ Không còn xung đột port
- ✅ Login flow hoạt động bình thường
- ⚠️ Warning về Ant Design message (không ảnh hưởng chức năng)

---

**Ngày fix:** 2025-12-11
**Status:** ✅ RESOLVED
