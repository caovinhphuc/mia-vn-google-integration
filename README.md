# 🚀 MIA.vn Google Integration Platform

> **Nền tảng tích hợp và tự động hóa Google Services chuyên nghiệp**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/mia-vn/google-integration)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18.0+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.1.1-blue.svg)](https://reactjs.org/)

## 📋 Tổng Quan

**MIA.vn Google Integration** là nền tảng tích hợp toàn diện cho các dịch vụ Google, cung cấp giao diện trực quan và tự động hóa quy trình làm việc.

### ✨ Tính Năng Chính

- 🔗 **Google Sheets Integration** - Quản lý và thao tác dữ liệu
- 📁 **Google Drive Integration** - Quản lý file và thư mục
- 🤖 **Google Apps Script** - Tự động hóa quy trình
- 📱 **Telegram Bot** - Thông báo và điều khiển
- 🎯 **Automation System** - Tự động hóa nâng cao
- 📊 **AI Analytics** - Phân tích dữ liệu thông minh

## 🚀 Quick Start

### 1. Cài Đặt

```bash
# Clone repository
git clone https://github.com/mia-vn/google-integration.git
cd google-integration

# Cài đặt dependencies
npm install

# Cấu hình environment
cp env.example .env
nano .env
```

### 2. Khởi Chạy

```bash
# Development
npm start

# Production
npm run build:prod
./deploy-production.sh
```

### 3. Truy Cập

- **Frontend**: <http://localhost:3000>
- **Backend**: <http://localhost:8000>
- **Monitoring**: <http://localhost:8080>

## 📁 Cấu Trúc Dự Án

```
mia-vn-google-integration/
├── 📁 src/                    # Source code
│   ├── 📁 components/         # React components
│   ├── 📁 services/          # API services
│   ├── 📁 store/             # Redux store
│   └── 📁 utils/             # Utilities
├── 📁 docs/                  # Documentation
│   ├── 📁 guides/            # Hướng dẫn
│   ├── 📁 archive/           # Lưu trữ
│   └── 📁 summaries/         # Tóm tắt
├── 📁 scripts/               # Build scripts
├── 🐳 docker-compose.yml     # Docker services
├── 🐳 Dockerfile            # Docker build
└── 📄 package.json          # Dependencies
```

## 🛠️ Công Nghệ Sử Dụng

### Frontend

- **React 19.1.1** - UI Framework
- **Redux** - State Management
- **Ant Design** - UI Components
- **React Router** - Navigation
- **Recharts** - Data Visualization

### Backend

- **Node.js** - Runtime
- **Express.js** - Web Framework
- **Google APIs** - Google Services
- **Python** - Automation Scripts
- **Selenium** - Web Automation

### DevOps

- **Docker** - Containerization
- **Nginx** - Web Server
- **Redis** - Caching
- **PM2** - Process Management

## 📚 Documentation

### 📖 Hướng Dẫn

- [🚀 Quick Start Guide](docs/guides/QUICK_START.md)
- [🐳 Deployment Guide](docs/guides/DEPLOYMENT_GUIDE.md)
- [⚙️ Environment Setup](doc/user-guide/02-Dependencies-Environment-Setup.md)
- [🔧 Google Service Account](doc/user-guide/01-Google-Service-Account-Setup.md)

### 📊 Tài Liệu Kỹ Thuật

- [🏗️ System Architecture](doc/architecture/SYSTEM_ARCHITECTURE.md)
- [📋 API Reference](doc/user-guide/05-API-Reference-Best-Practices.md)
- [🛠️ Development Roadmap](doc/user-guide/04-Development-Roadmap.md)

## 🚀 Deployment

### Docker (Recommended)

```bash
# Quick deployment
./deploy-production.sh docker

# Manual deployment
docker-compose up -d
```

### Traditional

```bash
# System deployment
./deploy-production.sh

# Nginx + PM2
sudo systemctl start nginx
pm2 start ecosystem.config.js
```

## 🔧 Development

### Scripts

```bash
# Development
npm start                 # Start development server
npm run dev              # Start with backend

# Building
npm run build            # Production build
npm run build:prod       # Optimized build
npm run analyze          # Bundle analysis

# Testing
npm test                 # Run tests
npm run test:integration # Integration tests
npm run health-check     # Health check

# Deployment
./deploy-production.sh   # Production deployment
```

### Environment Variables

```bash
# Google Services
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=30000

# Features
REACT_APP_FEATURE_GOOGLE_SHEETS=true
REACT_APP_FEATURE_GOOGLE_DRIVE=true
REACT_APP_FEATURE_AUTOMATION=true
```

## 📊 Monitoring

### Health Checks

```bash
# Frontend
curl http://localhost:3000/health

# Backend
curl http://localhost:8000/health

# Monitoring Dashboard
open http://localhost:8080
```

### Logs

```bash
# Docker logs
docker-compose logs -f

# Application logs
tail -f logs/application.log

# Nginx logs
tail -f /var/log/nginx/access.log
```

## 🔒 Security

### Production Security

- ✅ **HTTPS Ready** - SSL/TLS configuration
- ✅ **Security Headers** - XSS, CSRF protection
- ✅ **Environment Security** - Secure env variables
- ✅ **Access Control** - IP restrictions
- ✅ **Input Validation** - XSS prevention

### Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Content Security Policy enabled
- [ ] Rate limiting configured

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

### Getting Help

1. **Check logs**: `tail -f logs/application.log`
2. **Run health checks**: `curl http://localhost:3000/health`
3. **Review documentation**: [docs/](docs/)
4. **Check issues**: [GitHub Issues](https://github.com/mia-vn/google-integration/issues)
5. **Contact support**: <support@mia-vn.com>

### Useful Commands

```bash
# Quick status check
docker-compose ps
pm2 status
sudo systemctl status nginx

# View logs
docker-compose logs -f
pm2 logs
tail -f /var/log/nginx/access.log

# Restart services
docker-compose restart
pm2 restart all
sudo systemctl restart nginx
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google APIs** - For providing excellent APIs
- **React Team** - For the amazing framework
- **Ant Design** - For beautiful UI components
- **Docker** - For containerization platform

---

**Made with ❤️ by MIA.vn Team**

*Last Updated: $(date)*
*Version: 1.0.0*
