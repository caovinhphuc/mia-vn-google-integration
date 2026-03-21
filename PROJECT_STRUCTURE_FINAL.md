# 📁 CẤU TRÚC DỰ ÁN CUỐI CÙNG

## 🎯 TỔNG QUAN DỰ ÁN

Dự án được tổ chức flat tại root — **không có** thư mục `main-project`. Root `react-oas-inntegration-x` chính là main project:

```
react-oas-inntegration-x/      # ROOT = Main Project
├── src/                       # Frontend React (Port 3000)
├── backend/                   # Backend Node.js (Port 3001)
├── ai-service/                # AI Service Python (Port 8000)
├── automation/                # Automation Service Python
├── google-sheets-project/     # Dự án Google Sheets (Port 3002, 3003)
├── package.json
├── .venv/                     # Python venv thống nhất
└── start.sh                   # Khởi động tất cả
```

## 🏗️ CẤU TRÚC CHI TIẾT

### 1️⃣ MAIN PROJECT (Root)

```
react-oas-inntegration-x/
├── src/                    # Frontend React (Port 3000)
│   ├── components/
│   ├── services/
│   ├── store/
│   └── ...
├── backend/                # Backend Node.js (Port 3001)
│   ├── src/
│   │   ├── routes/
│   │   └── ...
│   └── package.json
├── ai-service/             # AI Service Python (Port 8000)
│   ├── main_simple.py      # FastAPI entry point
│   └── requirements.txt
├── automation/             # Automation Service
├── package.json
├── .env                    # Config (hoặc backend/config)
└── start.sh                # Wrapper → scripts/start-stop/start-all.sh
```

### 2️⃣ GOOGLE SHEETS PROJECT

```
google-sheets-project/
├── src/                   # Frontend (Port 3002)
├── server.js              # Backend (Port 3003)
├── env.config.js
└── start.sh
```

### 3️⃣ SHARED / SCRIPTS

```
scripts/
├── start-stop/start-all.sh
├── activate-venv.sh
└── config/
```

## 🔄 LUỒNG DỮ LIỆU

### Main Project

```
User → Frontend (3000) → Backend (3001) → AI Service (8000)
                    ↓
              Google Sheets API
                    ↓
              Automation Service
```

### Google Sheets Project

```
User → Frontend (3002) → Backend (3003) → Google Sheets API
```

## 🚀 CÁCH KHỞI ĐỘNG

### Khởi động dự án chính (tất cả services)

```bash
# Ở project root
./start.sh
# hoặc
npm run dev
```

### Khởi động từng service riêng

```bash
# Frontend (port 3000)
npm start

# Backend (port 3001)
npm run backend

# AI Service (port 8000)
npm run ai-service
```

### Khởi động Google Sheets Project

```bash
cd google-sheets-project
./start.sh
# hoặc
cd google-sheets-project && node server.js &
cd google-sheets-project && PORT=3002 npm start
```

### Khởi động cả hai dự án

```bash
# Terminal 1: Main
./start.sh

# Terminal 2: Google Sheets
cd google-sheets-project && ./start.sh
```

## 🌐 PORTS

| Service                | Port | URL                     |
| ---------------------- | ---- | ----------------------- |
| Main Frontend          | 3000 | <http://localhost:3000> |
| Main Backend           | 3001 | <http://localhost:3001> |
| Google Sheets Frontend | 3002 | <http://localhost:3002> |
| Google Sheets Backend  | 3003 | <http://localhost:3003> |
| AI Service             | 8000 | <http://localhost:8000> |

## ✅ LỢI ÍCH

1. **Flat structure** — Không cần `cd main-project`
2. **venv thống nhất** — `.venv` tại root cho Python
3. **npm scripts** — `npm run dev` chạy 3 services
4. **start.sh** — Wrapper gọn để khởi động tất cả
