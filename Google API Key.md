# 🔑 Hướng Dẫn Sử Dụng Google API Key

## ⚠️ CẢNH BÁO BẢO MẬT QUAN TRỌNG

**API Key đã được chia sẻ: `AIzaSyDXl_kaJ2lsthek_buP_Vsdwh2NGnUq8zk`**

🚨 **HÀNH ĐỘNG NGAY LẬP TỨC CẦN THIẾT:**

1. **THU HỒI API Key này ngay lập tức** - Key đã bị lộ công khai
2. **TẠO MỚI API Key** và cấu hình bảo mật chặt chẽ
3. **KIỂM TRA usage logs** để phát hiện việc sử dụng trái phép

---

## 📋 Mục Lục

1. [Cấu Hình API Key](#1-cấu-hình-api-key)
2. [Bảo Mật API Key](#2-bảo-mật-api-key)
3. [Quản Lý Trong Google Cloud Console](#3-quản-lý-trong-google-cloud-console)
4. [Troubleshooting](#4-troubleshooting)
5. [Best Practices](#5-best-practices)

---

## 1. Cấu Hình API Key

### 1.1 Frontend Applications

#### React.js / Next.js

```bash
# File: .env.local (Next.js) hoặc .env (React)
REACT_APP_GOOGLE_API_KEY=your_new_api_key_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_new_api_key_here

# Google Maps API
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key_here

# YouTube API
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key_here
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

#### Vue.js

```bash
# File: .env.local
VUE_APP_GOOGLE_API_KEY=your_new_api_key_here
VUE_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key_here
```

#### Angular

```bash
# File: .env
NG_APP_GOOGLE_API_KEY=your_new_api_key_here
```

### 1.2 Backend Applications

#### Node.js / Express

```bash
# File: .env
GOOGLE_API_KEY=your_new_api_key_here
GOOGLE_CLOUD_API_KEY=your_cloud_api_key_here
GOOGLE_MAPS_SERVER_KEY=your_server_side_maps_key_here
```

#### Python (Django/Flask)

```bash
# File: .env
GOOGLE_API_KEY=your_new_api_key_here
GOOGLE_MAPS_API_KEY=your_maps_api_key_here
```

### 1.3 Sử Dụng Trong Code

#### JavaScript/TypeScript

```javascript
// Frontend - sử dụng public key
const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
const mapsKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Sử dụng với Google Maps
const initMap = () => {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 10.8231, lng: 106.6297 }, // TP.HCM
    zoom: 13,
    key: mapsKey,
  });
};

// Sử dụng với YouTube API
const fetchYouTubeVideos = async (query) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${apiKey}`
  );
  return response.json();
};
```

#### Node.js Backend

```javascript
// Backend - sử dụng server key
const { GoogleAuth } = require("google-auth-library");
require("dotenv").config();

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  credentials: {
    // Sử dụng service account thay vì API key cho backend
  },
});

// Hoặc sử dụng API key cho các API đơn giản
const apiKey = process.env.GOOGLE_API_KEY;
```

---

## 2. Bảo Mật API Key

### 2.1 Nguyên Tắc Cơ Bản

#### ✅ ĐÚNG

- Sử dụng biến môi trường
- Giới hạn referrer/domain
- Thiết lập IP restrictions
- Định kỳ rotate keys
- Sử dụng service accounts cho backend

#### ❌ SAI

- Hard-code trực tiếp trong source code
- Commit vào Git repository
- Chia sẻ qua email/chat
- Sử dụng chung key cho tất cả services
- Không giới hạn quyền hạn

### 2.2 Application Restrictions

#### HTTP Referrers (Web Apps)

```
# Chỉ cho phép từ domain của bạn
https://yourdomain.com/*
https://www.yourdomain.com/*
https://staging.yourdomain.com/*

# Localhost cho development
http://localhost:3000/*
http://127.0.0.1:3000/*
```

#### IP Addresses (Server Apps)

```
# Production server
203.113.XXX.XXX/32

# Development server
192.168.1.XXX/32

# Office network
203.113.XXX.0/24
```

### 2.3 API Restrictions

#### Chỉ Enable APIs Cần Thiết

- ✅ Maps JavaScript API (nếu dùng Google Maps)
- ✅ YouTube Data API v3 (nếu dùng YouTube)
- ✅ Places API (nếu cần tìm kiếm địa điểm)
- ❌ Tắt tất cả APIs không sử dụng

---

## 3. Quản Lý Trong Google Cloud Console

### 3.1 Truy Cập Console

1. Đi tới [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. Vào **APIs & Services > Credentials**

### 3.2 Tạo API Key Mới

```bash
# Bước 1: Click "CREATE CREDENTIALS" > "API key"
# Bước 2: Copy key ngay lập tức
# Bước 3: Click "RESTRICT KEY" ngay sau khi tạo
```

### 3.3 Thu Hồi API Key Cũ

```bash
# Bước 1: Tìm key bị lộ: AIzaSyDXl_kaJ2lsthek_buP_Vsdwh2NGnUq8zk
# Bước 2: Click vào key đó
# Bước 3: Click "DELETE" và xác nhận
# Bước 4: Kiểm tra usage logs trước khi xóa
```

### 3.4 Monitoring & Logging

```bash
# Kiểm tra Usage:
APIs & Services > Dashboard > View quotas & limits

# Kiểm tra Logs:
Logging > Logs Explorer
# Filter: resource.type="api"
# Filter: protoPayload.authenticationInfo.principalEmail="YOUR_KEY"
```

---

## 4. Troubleshooting

### 4.1 Lỗi Phổ Biến

#### "API key not valid"

```bash
# Nguyên nhân:
- Key bị restrict quá chặt
- Key đã bị disable/delete
- Sai format khi sử dụng

# Giải pháp:
1. Kiểm tra key trong Console
2. Verify restrictions settings
3. Test với curl:
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Vietnam&key=YOUR_KEY"
```

#### "This API project is not authorized"

```bash
# Nguyên nhân:
- API chưa được enable
- Billing chưa được setup
- Quota đã hết

# Giải pháp:
1. Enable API trong Console
2. Setup billing account
3. Check quota limits
```

#### "Requests from this referer are blocked"

```bash
# Nguyên nhân:
- Domain không nằm trong whitelist
- Referer header bị missing/sai

# Giải pháp:
1. Thêm domain vào HTTP referrers
2. Check browser developer tools
3. Verify referer header
```

### 4.2 Debug Steps

```javascript
// 1. Log environment variables
console.log("API Key exists:", !!process.env.REACT_APP_GOOGLE_API_KEY);
console.log("Key length:", process.env.REACT_APP_GOOGLE_API_KEY?.length);

// 2. Test API directly
const testAPI = async () => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Vietnam&key=${apiKey}`
    );
    const data = await response.json();
    console.log("API Test Result:", data);
  } catch (error) {
    console.error("API Test Error:", error);
  }
};

// 3. Check browser network tab
// Verify request headers và response codes
```

---

## 5. Best Practices

### 5.1 Development Workflow

```bash
# 1. Separate keys for environments
DEV_GOOGLE_API_KEY=dev_key_here
STAGING_GOOGLE_API_KEY=staging_key_here
PROD_GOOGLE_API_KEY=prod_key_here

# 2. Use different projects
- my-app-development
- my-app-staging
- my-app-production

# 3. Version control
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
```

### 5.2 Security Checklist

- [ ] API key được store trong environment variables
- [ ] Không commit keys vào Git
- [ ] Setup application restrictions
- [ ] Enable chỉ APIs cần thiết
- [ ] Monitor usage regularly
- [ ] Rotate keys định kỳ (3-6 tháng)
- [ ] Sử dụng service accounts cho backend
- [ ] Setup alerts cho unusual usage

### 5.3 Performance Optimization

```javascript
// 1. Cache API responses
const cache = new Map();
const getCachedData = async (key, fetcher) => {
  if (cache.has(key)) return cache.get(key);
  const data = await fetcher();
  cache.set(key, data);
  return data;
};

// 2. Implement retry logic
const retryAPI = async (fn, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return retryAPI(fn, retries - 1);
    }
    throw error;
  }
};
```

---

## 📞 Hỗ Trợ

Nếu bạn gặp lỗi liên quan đến Google API, vui lòng cung cấp:

1. **Error logs** chính xác
2. **API được sử dụng** (Maps, YouTube, etc.)
3. **Environment** (dev/staging/prod)
4. **Browser/Platform** thông tin
5. **Request URL** và headers (remove API key)

### Template Báo Lỗi

```markdown
**Lỗi**: [Mô tả lỗi ngắn gọn]
**API**: [Maps/YouTube/Places/etc.]
**Environment**: [Development/Staging/Production]
**Browser**: [Chrome 120, Safari 17, etc.]
**Error Message**:
```

[Copy exact error message here]

```

**Request Details**:
- URL: https://maps.googleapis.com/...
- Method: GET/POST
- Headers: [relevant headers without API key]

**Expected Behavior**: [Mô tả kết quả mong muốn]
**Actual Behavior**: [Mô tả kết quả thực tế]
```

---

## 🔄 Cập Nhật

- **Version**: 1.0.0
- **Last Updated**: 19/06/2025
- **Next Review**: 19/09/2025

**Changelog**:

- 19/06/2025: Tạo hướng dẫn ban đầu với cảnh báo bảo mật
