# 📚 SCRIPTS INDEX - React OAS Integration

> **Quick Reference (đã refresh theo repo hiện tại - Mar 2026)**

---

## 🚀 QUICK START (Canonical)

### Development

```bash
# Setup
./setup.sh

# Start dev stack (canonical)
./start.sh
# hoặc npm run dev

# Stop ports nhanh
npm run fix:ports

# Guard root wrappers trước khi push
npm run scripts:guard-wrappers
```

### Deployment

```bash
# Deploy chuẩn qua npm scripts
npm run deploy:prep
npm run deploy:vercel

# Hoặc wrapper
./quick-deploy.sh "Commit message"
```

---

## 📖 TÀI LIỆU

| File                                                         | Mô tả                                    |
| ------------------------------------------------------------ | ---------------------------------------- |
| [SCRIPTS_GUIDE.md](./SCRIPTS_GUIDE.md)                       | 📚 Hướng dẫn canonical scripts đang dùng |
| [SCRIPTS_ANALYSIS.md](./SCRIPTS_ANALYSIS.md)                 | 🔍 Phân tích hiện trạng + legacy cần dọn |
| [SCRIPTS_RESTRUCTURE_PLAN.md](./SCRIPTS_RESTRUCTURE_PLAN.md) | 📁 Kế hoạch chuẩn hóa tiếp theo          |
| [SHELL_SCRIPT_STANDARDS.md](./SHELL_SCRIPT_STANDARDS.md)     | ✅ Chuẩn root wrapper + CI guard         |

---

## 🎯 SCRIPTS QUAN TRỌNG NHẤT

### ⭐ Setup

- `./setup.sh` - Setup toàn bộ hệ thống

### ⭐ Start/Stop (khuyến nghị)

- `./start.sh` - canonical root wrapper để chạy stack chính
- `npm run dev` - chạy frontend + backend + ai-service bằng npm
- `npm run fix:ports` - dọn nhanh port 3000/3001/8000

### ⭐ Deployment (khuyến nghị)

- `npm run deploy:prep` - chuẩn bị build/validate trước deploy
- `npm run deploy:vercel` - deploy Vercel
- `./quick-deploy.sh` - wrapper legacy-compatible

### ⭐ Troubleshooting

- `npm run check:ports` - check ports listeners
- `npm run check:backend` - check backend health endpoint
- `npm run scripts:guard-wrappers` - guard root wrappers theo chuẩn

---

## 📋 PHÂN LOẠI SCRIPTS

### 1. Setup Scripts

Xem: [SCRIPTS_GUIDE.md#1-setup-scripts](./SCRIPTS_GUIDE.md#1-setup-scripts)

### 2. Start/Stop Scripts

Xem: [SCRIPTS_GUIDE.md#2-startstop-scripts](./SCRIPTS_GUIDE.md#2-startstop-scripts)

### 3. Deployment Scripts

Xem: [SCRIPTS_GUIDE.md#3-deployment-scripts](./SCRIPTS_GUIDE.md#3-deployment-scripts)

### 4. Fix/Troubleshooting Scripts

Xem: [SCRIPTS_GUIDE.md#4-fixtroubleshooting-scripts](./SCRIPTS_GUIDE.md#4-fixtroubleshooting-scripts)

### 5. Utility Scripts

Xem: [SCRIPTS_GUIDE.md#5-utility-scripts](./SCRIPTS_GUIDE.md#5-utility-scripts)

### 6. Git Scripts

Xem: [SCRIPTS_GUIDE.md#6-git-scripts](./SCRIPTS_GUIDE.md#6-git-scripts)

### 7. Sub-projects Scripts

Xem: [SCRIPTS_GUIDE.md#7-sub-projects-scripts](./SCRIPTS_GUIDE.md#7-sub-projects-scripts)

---

## ⚠️ LƯU Ý

1. **Hầu hết scripts chạy từ Root directory**
2. **Kiểm tra permissions**: `chmod +x script-name.sh`
3. **Chuẩn root wrappers**: xem `SHELL_SCRIPT_STANDARDS.md`
4. **Kiểm tra wrapper drift**: `npm run scripts:guard-wrappers`

---

**Last Updated**: 2026-03-18
