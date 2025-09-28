# 📧 Email Service Configuration Guide

## 🎯 Tổng quan

Dự án MIA.vn Google Integration hỗ trợ 2 phương thức gửi email:

1. **SendGrid API** (Khuyến nghị)
2. **SMTP** (Fallback)

## 🔧 SendGrid Configuration

### Bước 1: Tạo SendGrid API Key

1. Truy cập [SendGrid Console](https://app.sendgrid.com/)
2. Đăng nhập vào tài khoản
3. Vào **Settings > API Keys**
4. Click **Create API Key**
5. Chọn **Full Access** hoặc tạo custom permissions
6. Copy API key (bắt đầu với `SG.`)

### Bước 2: Cập nhật Environment Variables

Trong file `.env`, thay thế:

```env
# Email - SendGrid (Preferred)
SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=kho.1@mia.vn
SENDGRID_FROM_NAME=MIA Logistics Manager
EMAIL_FROM=kho.1@mia.vn
```

### Bước 3: Verify Domain (Tùy chọn nhưng khuyến nghị)

1. Trong SendGrid Console, vào **Settings > Sender Authentication**
2. Verify domain `mia.vn` để tăng deliverability
3. Hoặc verify riêng email `kho.1@mia.vn`

## 🔧 SMTP Configuration (Alternative)

Nếu không sử dụng SendGrid, có thể cấu hình SMTP:

```env
# Email - SMTP (Alternative)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### Gmail SMTP Setup:

1. Bật 2FA cho Gmail account
2. Tạo App Password:
   - Google Account Settings > Security > App passwords
   - Chọn "Mail" và thiết bị
   - Copy generated password
3. Sử dụng App Password làm `SMTP_PASS`

## 🧪 Testing

### Test Email Service

```bash
# Test riêng email service
npm run test:email

# Test đầy đủ
npm run test:integration

# Health check
npm run health-check
```

### Expected Results

**SendGrid Success:**

```
✅ environment-check: Email service configured: SendGrid API
✅ sendgrid-connection: SendGrid API connection successful
✅ sendgrid-test-email: Test email đã được gửi thành công qua SendGrid
```

**SMTP Success:**

```
✅ environment-check: Email service configured: SMTP
✅ smtp-connection: SMTP connection successful
✅ smtp-test-email: Test email đã được gửi thành công qua SMTP
```

## 🚨 Troubleshooting

### SendGrid Issues

**401 Unauthorized:**

- API key không hợp lệ hoặc hết hạn
- API key không bắt đầu bằng `SG.`
- Kiểm tra permissions của API key

**403 Forbidden:**

- Domain chưa được verify
- Email sender chưa được authenticate
- API key không có đủ permissions

### SMTP Issues

**Authentication Failed:**

- Sai username/password
- Chưa bật App Password (Gmail)
- 2FA chưa được setup

**Connection Timeout:**

- Sai SMTP host/port
- Firewall block connection
- ISP block SMTP ports

## 🎯 Production Best Practices

### SendGrid (Khuyến nghị):

- ✅ Reliable delivery rates
- ✅ Built-in analytics
- ✅ Reputation management
- ✅ Template support

### SMTP:

- ⚠️ Rate limits
- ⚠️ Deliverability issues
- ⚠️ No built-in analytics

## 📊 Current Status

```bash
# Kiểm tra status hiện tại
npm run health-check
```

**Healthy Email Service:**

- Kết nối thành công
- Có thể gửi test email
- No authentication errors

**Degraded Email Service:**

- Có service configured nhưng connection failed
- Cần kiểm tra credentials

**Warning Email Service:**

- Không có service nào được cấu hình
- Cần setup SendGrid hoặc SMTP

---

## 📞 Support

Nếu gặp vấn đề với email configuration, hãy kiểm tra:

1. **Environment variables** đã đúng chưa
2. **API key/credentials** còn hợp lệ không
3. **Network connectivity**
4. **Service provider status**

**Last Updated:** 2025-09-26
**Version:** 1.0.0
