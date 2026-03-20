# 📊 Reports Directory

> **Quản lý tất cả các reports và test results**

---

## 📁 Cấu trúc

```
reports/
├── email/          # Email test reports
├── telegram/       # Telegram test reports
├── health/         # Health check reports
├── test-runs/      # Báo cáo `npm run test:complete` / `test-all.js` (test-report-<timestamp>.json)
├── build/          # Build reports (bundle, setup, etc.)
├── performance/    # Performance reports
├── log-analysis/   # Output `scripts/log-analyzer.js` (log-analysis-YYYY-MM-DD.json)
└── lighthouse/     # Lighthouse JSON (sau organize; file gốc có thể từ nhiều thư mục con)
```

**Lighthouse HTML** (báo cáo mở trên trình duyệt) nằm ở `lighthouse-reports/`: `lighthouse-report-*.html`, `lighthouse-*.report.html`, hoặc `<hostname>_YYYY-MM-DD_….report.html` (mặc định CLI khi audit URL). `organize-reports.sh` gom các file này từ **root** vào đây.

---

## 📋 Loại Reports

### Email Reports

- `email-test-report-YYYY-MM-DD.json` - Kết quả test email service

### Telegram Reports

- `telegram-test-report-YYYY-MM-DD.json` - Kết quả test Telegram bot

### Health Reports

- `health-report-YYYY-MM-DD.json` - Health check results từ các services

### Build Reports

- `build-report.json` - Build summary
- `bundle-report.json` - Bundle analysis
- `setup-report.json` - Setup process results

### Performance Reports

- `performance-budget-report.json` - Performance budget analysis

### Lighthouse Reports

- `lighthouse-YYYY-MM-DDTHH-MM-SS-sssZ.report.json` - Lighthouse audit results (JSON, thường vào `reports/lighthouse/` sau `organize-reports.sh`)
- HTML: thư mục `lighthouse-reports/` ở root repo

### Log analysis (`log-analysis/`)

- `log-analysis-YYYY-MM-DD.json` — tổng hợp từ `node scripts/log-analyzer.js` (đọc thư mục `logs/`)

---

## 🧹 Cleanup

### Tự động cleanup reports cũ

```bash
# Cleanup reports cũ hơn 30 ngày (dry run)
./scripts/utils/cleanup-old-reports.sh 30 true

# Cleanup reports cũ hơn 30 ngày (thực sự xóa)
./scripts/utils/cleanup-old-reports.sh 30 false

# Cleanup reports cũ hơn 7 ngày
./scripts/utils/cleanup-old-reports.sh 7 false
```

### Tổ chức lại reports

```bash
# Tự động tổ chức tất cả reports vào đúng thư mục
./scripts/utils/organize-reports.sh
```

---

## ⚙️ Tự động tổ chức

Scripts tự động sẽ:

- ✅ Di chuyển reports vào đúng thư mục
- ✅ Tổ chức theo loại và ngày tháng
- ✅ Giữ lại cấu trúc thư mục

---

## 📝 Lưu ý

- Reports được ignore trong `.gitignore` để tránh commit vào repo
- Chỉ giữ lại structure (`.gitkeep` files)
- Reports cũ sẽ được cleanup tự động
- Có thể xem reports trong local để debug

---

**Last Updated**: 2026-03-19
