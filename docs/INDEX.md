# 📚 MIA.vn Google Integration - Documentation Index

> **Tài liệu hướng dẫn và tham khảo cho MIA.vn Google Integration Platform**

## 🗂️ Cấu Trúc Tài Liệu

### 📖 Hướng Dẫn (Guides)

- [🚀 Quick Start Guide](guides/QUICK_START.md) - Hướng dẫn khởi động nhanh
- [🐳 Deployment Guide](guides/DEPLOYMENT_GUIDE.md) - Hướng dẫn triển khai production
- [⚙️ Environment Setup](../doc/user-guide/02-Dependencies-Environment-Setup.md) - Cài đặt môi trường
- [🔧 Google Service Account](../doc/user-guide/01-Google-Service-Account-Setup.md) - Thiết lập Google Service Account

### 🏗️ Kiến Trúc (Architecture)

- [🏗️ System Architecture](../doc/architecture/SYSTEM_ARCHITECTURE.md) - Kiến trúc hệ thống
- [📋 API Reference](../doc/user-guide/05-API-Reference-Best-Practices.md) - Tham khảo API
- [🛠️ Development Roadmap](../doc/user-guide/04-Development-Roadmap.md) - Lộ trình phát triển

### 📊 Tóm Tắt (Summaries)

- [📋 Project Summary](../doc/PROJECT_SUMMARY.md) - Tóm tắt dự án
- [📁 File List](../doc/FILE_LIST.md) - Danh sách file
- [🔍 Quick Setup](../doc/QUICK_SETUP.md) - Thiết lập nhanh

### 📦 Lưu Trữ (Archive)

- [📄 Completion Report](archive/COMPLETION_REPORT.md) - Báo cáo hoàn thành
- [🔧 System Status](archive/SYSTEM_STATUS.md) - Trạng thái hệ thống

## 🚀 Quick Navigation

### Cho Người Mới Bắt Đầu

1. [🚀 Quick Start Guide](guides/QUICK_START.md)
2. [⚙️ Environment Setup](../doc/user-guide/02-Dependencies-Environment-Setup.md)
3. [🔧 Google Service Account](../doc/user-guide/01-Google-Service-Account-Setup.md)

### Cho Developer

1. [🏗️ System Architecture](../doc/architecture/SYSTEM_ARCHITECTURE.md)
2. [📋 API Reference](../doc/user-guide/05-API-Reference-Best-Practices.md)
3. [🛠️ Development Roadmap](../doc/user-guide/04-Development-Roadmap.md)

### Cho DevOps

1. [🐳 Deployment Guide](guides/DEPLOYMENT_GUIDE.md)
2. [⚙️ Environment Setup](../doc/user-guide/02-Dependencies-Environment-Setup.md)
3. [🔍 Quick Setup](../doc/QUICK_SETUP.md)

## 📋 Checklist

### Trước Khi Bắt Đầu

- [ ] Đọc [Quick Start Guide](guides/QUICK_START.md)
- [ ] Cài đặt [Environment Setup](../doc/user-guide/02-Dependencies-Environment-Setup.md)
- [ ] Thiết lập [Google Service Account](../doc/user-guide/01-Google-Service-Account-Setup.md)

### Trước Khi Deploy

- [ ] Đọc [Deployment Guide](guides/DEPLOYMENT_GUIDE.md)
- [ ] Kiểm tra [System Architecture](../doc/architecture/SYSTEM_ARCHITECTURE.md)
- [ ] Test [API Reference](../doc/user-guide/05-API-Reference-Best-Practices.md)

### Trong Quá Trình Phát Triển

- [ ] Theo dõi [Development Roadmap](../doc/user-guide/04-Development-Roadmap.md)
- [ ] Cập nhật [Project Summary](../doc/PROJECT_SUMMARY.md)
- [ ] Kiểm tra [File List](../doc/FILE_LIST.md)

## 🔍 Tìm Kiếm

### Theo Chủ Đề

- **Setup**: [Quick Start](guides/QUICK_START.md), [Environment Setup](../doc/user-guide/02-Dependencies-Environment-Setup.md)
- **Development**: [System Architecture](../doc/architecture/SYSTEM_ARCHITECTURE.md), [API Reference](../doc/user-guide/05-API-Reference-Best-Practices.md)
- **Deployment**: [Deployment Guide](guides/DEPLOYMENT_GUIDE.md), [Quick Setup](../doc/QUICK_SETUP.md)
- **Google Services**: [Google Service Account](../doc/user-guide/01-Google-Service-Account-Setup.md), [Sample Code Testing](../doc/user-guide/03-Sample-Code-Testing.md)

### Theo Vai Trò

- **Frontend Developer**: [System Architecture](../doc/architecture/SYSTEM_ARCHITECTURE.md), [API Reference](../doc/user-guide/05-API-Reference-Best-Practices.md)
- **Backend Developer**: [System Architecture](../doc/architecture/SYSTEM_ARCHITECTURE.md), [API Reference](../doc/user-guide/05-API-Reference-Best-Practices.md)
- **DevOps Engineer**: [Deployment Guide](guides/DEPLOYMENT_GUIDE.md), [Environment Setup](../doc/user-guide/02-Dependencies-Environment-Setup.md)
- **Project Manager**: [Project Summary](../doc/PROJECT_SUMMARY.md), [Development Roadmap](../doc/user-guide/04-Development-Roadmap.md)

## 📞 Hỗ Trợ

### Khi Cần Giúp Đỡ

1. **Kiểm tra logs**: `tail -f logs/application.log`
2. **Chạy health checks**: `curl http://localhost:3000/health`
3. **Xem tài liệu**: [docs/](.)
4. **Kiểm tra issues**: [GitHub Issues](https://github.com/mia-vn/google-integration/issues)
5. **Liên hệ support**: <support@mia-vn.com>

### Commands Hữu Ích

```bash
# Kiểm tra trạng thái
docker-compose ps
pm2 status
sudo systemctl status nginx

# Xem logs
docker-compose logs -f
pm2 logs
tail -f /var/log/nginx/access.log

# Khởi động lại services
docker-compose restart
pm2 restart all
sudo systemctl restart nginx
```

---

**📚 Tài liệu được cập nhật thường xuyên - Luôn kiểm tra phiên bản mới nhất!**

*Last Updated: $(date)*
*Version: 1.0.0*
