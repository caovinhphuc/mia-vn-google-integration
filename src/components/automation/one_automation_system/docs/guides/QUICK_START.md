# 🚀 Quick Start Guide - ONE Automation System

## 📋 Checklist trước khi bắt đầu

- [ ] Python 3.7+ đã được cài đặt
- [ ] Google Chrome browser đã được cài đặt
- [ ] Có thông tin đăng nhập hệ thống ONE
- [ ] Có email Gmail với App Password (cho thông báo)

## ⚡ Cài đặt nhanh (5 phút)

### 1. Khởi tạo môi trường

```bash
# Chạy script setup tự động
chmod +x setup.sh
./setup.sh
```

### 2. Cấu hình credentials

```bash
# Tạo file .env từ template
cp env_template.txt .env

# Chỉnh sửa .env với thông tin thực tế
nano .env
```

**Nội dung .env cần điền:**

```env
ONE_USERNAME=your_actual_username
ONE_PASSWORD=your_actual_password
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_gmail_app_password
HEADLESS=true
```

### 3. Kiểm tra hệ thống

```bash
# Chạy test để đảm bảo mọi thứ hoạt động
python run_tests.py

# Kiểm tra sức khỏe hệ thống
python health_check.py
```

### 4. Chạy thử nghiệm

```bash
# Kích hoạt virtual environment
source venv/bin/activate

# Chạy một lần để test
python automation.py --run-once
```

## 🎯 Các lệnh thường dùng

```bash
# Chạy automation một lần
python automation.py --run-once

# Chạy theo lịch (daemon mode)
python automation.py --schedule

# Xem hiệu suất 7 ngày qua
python utils.py --performance 7

# Tạo dashboard HTML
python utils.py --dashboard

# Dọn dẹp file cũ (30 ngày)
python utils.py --cleanup 30

# Kiểm tra sức khỏe hệ thống
python health_check.py
```

## 🐳 Triển khai với Docker

```bash
# Build và chạy với Docker Compose
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng service
docker-compose down
```

## 🔧 Triển khai Production

```bash
# Chạy script deployment tự động
chmod +x deploy.sh
./deploy.sh

# Hoặc với Docker
./deploy.sh docker
```

## 📊 Monitoring

- **Dashboard**: <http://localhost:8080> (nếu dùng Docker)
- **Logs**: `tail -f logs/automation.log`
- **Reports**: Xem trong thư mục `reports/`

## 🚨 Troubleshooting

### Lỗi Chrome/ChromeDriver

```bash
# Cài đặt Chrome trên Ubuntu/Debian
sudo apt-get update
sudo apt-get install google-chrome-stable

# Hoặc cài đặt ChromeDriver thủ công
wget https://chromedriver.chromium.org/downloads
```

### Lỗi Python dependencies

```bash
# Cài đặt lại dependencies
pip install -r requirements.txt --force-reinstall
```

### Lỗi permission

```bash
# Cấp quyền cho scripts
chmod +x *.sh *.py
```

### Debug mode

```bash
# Chạy với browser hiển thị (không headless)
export HEADLESS=false
python automation.py --run-once
```

## 📞 Hỗ trợ

- 📧 **Email**: <support@company.com>
- 📱 **Slack**: #automation-support
- 📖 **Full Documentation**: [README.md](README.md)

---

**💡 Tip**: Luôn chạy `python health_check.py` trước khi triển khai production!
