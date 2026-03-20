# Hướng dẫn cấu hình Email & Telegram

## 1. Email — Chọn 1 trong 2: SendGrid hoặc SMTP

### Cách 1: SendGrid (khuyến nghị cho production)

1. Đăng ký: <https://signup.sendgrid.com/>
2. Vào **Settings → API Keys** → **Create API Key**
3. Đặt tên (vd: `mia-logistics`), chọn quyền **Full Access** hoặc **Restricted** (Mail Send: Full)
4. Copy API Key (chỉ hiện 1 lần)
5. Vào **Settings → Sender Authentication** → **Verify Single Sender**
   - Nhập email gửi (vd: `kho.1@mia.vn`), tên
   - Xác nhận qua email

6. Thêm vào `.env`:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=kho.1@mia.vn
SENDGRID_FROM_NAME=MIA Logistics Manager
EMAIL_FROM=kho.1@mia.vn
```

**Lưu ý**: Health-check hiện dùng SMTP để verify. Nếu chỉ dùng SendGrid, cần cấu hình thêm SMTP (hoặc bỏ qua test email trong health-check).

---

### Cách 2: SMTP (Gmail, Outlook, hosting…)

#### Gmail

**Lưu ý:** `SMTP_HOST` phải là `smtp.gmail.com` — không dùng tên bot Telegram hay tên hiển thị khác.

1. Bật **2-Step Verification**: <https://myaccount.google.com/security>
2. Tạo **App Password**: <https://myaccount.google.com/apppasswords>
   - Chọn app: Mail, thiết bị: Other → đặt tên
   - Copy mật khẩu 16 ký tự

3. Thêm vào `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

#### Outlook / Office 365

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Hosting riêng (vd: <warehouse@mia.vn>)

```bash
SMTP_HOST=mail.mia.vn
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=warehouse@mia.vn
SMTP_PASS=your-password
```

---

## 2. Telegram Bot

### Bước 1: Tạo Bot

1. Mở Telegram, tìm **@BotFather**
2. Gửi `/newbot`
3. Đặt tên bot (vd: `MIA Logistics Bot`)
4. Đặt username (phải kết thúc bằng `bot`, vd: `mia_logistics_bot`)
5. Copy **token** dạng: `123456789:ABCdefGHI...`

### Bước 2: Lấy Chat ID

**Cách A — Dùng @userinfobot**

1. Tìm **@userinfobot** trên Telegram
2. Bắt đầu chat → bot gửi lại **Id** (Chat ID của bạn)

**Cách B — Dùng API**

1. Gửi tin nhắn bất kỳ cho bot vừa tạo
2. Mở trình duyệt:

   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```

3. Trong JSON, tìm `"chat":{"id": -123456789}` → đó là Chat ID

**Chat ID nhóm** (nếu gửi vào group):

- Thêm bot vào group
- Gửi tin nhắn trong group
- Gọi `getUpdates` → `chat.id` sẽ âm (vd: `-4818209867`)

### Bước 3: Cấu hình .env

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-4818209867
TELEGRAM_WEBHOOK_URL=
```

### Lỗi 401 thường gặp

| Nguyên nhân | Cách xử lý |
|-------------|------------|
| Token sai / đã revoke | Tạo bot mới với @BotFather, dùng token mới |
| Copy thiếu ký tự | Kiểm tra token có dạng `số:chuỗi` đầy đủ |
| Không gửi tin cho bot | Phải gửi ít nhất 1 tin cho bot trước khi gọi API |

---

## Kiểm tra

```bash
# Email (SMTP)
npm run test:email

# Telegram
npm run test:telegram

# Health check
node scripts/health-check.cjs
```
