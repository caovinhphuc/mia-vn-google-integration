# 📊📦 Hướng Dẫn Quản Lý Reports & Backups

> **React OAS Integration v4.0**
> **Ngày cập nhật**: 2025-01-27

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Cấu trúc thư mục mới ✅

```
reports/
├── email/          # Email test reports
├── telegram/       # Telegram test reports
├── health/         # Health check reports
├── test-runs/      # test-all.js JSON
├── log-analysis/   # scripts/log-analyzer.js → log-analysis-YYYY-MM-DD.json
├── build/          # Build reports
├── performance/    # Performance reports
└── lighthouse/     # Lighthouse JSON (sau organize-reports)

`lighthouse-reports/` (ở **root** repo): HTML Lighthouse (`run-lighthouse.sh`, v.v.)

backups/
├── scripts/        # Script backups
├── automation/     # Automation backups
├── backend/        # Backend backups
├── ai-service/     # AI service backups
├── package-json/   # package.json.backup.* (scripts upgrade-phase1)
└── venv/           # Python venv backups
```

### 2. Scripts tự động ✅

- ✅ `scripts/utils/organize-reports.sh` - Tự động tổ chức reports
- ✅ `scripts/utils/cleanup-old-reports.sh` - Cleanup reports cũ

### 3. Documentation ✅

- ✅ `reports/README.md` - Hướng dẫn reports
- ✅ `backups/README.md` - Hướng dẫn backups
- ✅ Cập nhật `.gitignore` - Ignore reports/backups

---

## 🚀 CÁCH SỬ DỤNG

### Tổ chức lại reports

```bash
# Tự động tổ chức tất cả reports vào đúng thư mục
./scripts/utils/organize-reports.sh
```

Script sẽ:

- ✅ Tìm tất cả reports trong project
- ✅ Di chuyển vào đúng thư mục theo loại
- ✅ Tổ chức lighthouse reports theo thư mục gốc
- ✅ Hiển thị summary

### Cleanup reports cũ

```bash
# Dry run - xem sẽ xóa gì (không xóa thật)
./scripts/utils/cleanup-old-reports.sh 30 true

# Xóa reports cũ hơn 30 ngày
./scripts/utils/cleanup-old-reports.sh 30 false

# Xóa reports cũ hơn 7 ngày
./scripts/utils/cleanup-old-reports.sh 7 false
```

---

## 📋 LOẠI REPORTS

### Email Reports (`reports/email/`)

- `email-test-report-YYYY-MM-DD.json`
- Kết quả test email service
- Tự động tạo khi chạy email tests

### Telegram Reports (`reports/telegram/`)

- `telegram-test-report-YYYY-MM-DD.json`
- Kết quả test Telegram bot
- Tự động tạo khi chạy Telegram tests

### Health Reports (`reports/health/`)

- `health-report-YYYY-MM-DD.json`
- Health check results từ các services
- Tự động tạo khi chạy health checks

### Test-all suite (`reports/test-runs/`)

- `test-report-<timestamp>.json` — kết quả `scripts/test-all.js` (vd. `npm run test:complete`)
- Bản cũ ở root: chạy `./scripts/utils/organize-reports.sh` để gom vào đây

### Build Reports (`reports/build/`)

- `build-report.json`
- `bundle-report.json`
- `setup-report.json`
- Build và bundle analysis results

### Performance Reports (`reports/performance/`)

- `performance-budget-report.json`
- Performance budget analysis

### Lighthouse Reports (`reports/lighthouse/`)

- `lighthouse-YYYY-MM-DDTHH-MM-SS-sssZ.report.json`
- Lighthouse audit results
- Tổ chức theo thư mục gốc (root, automation, backend, etc.)

---

## 💾 BACKUPS

### Venv Backups (`backups/venv/`)

- `venv.backup.YYYYMMDD_HHMMSS/`
- Python virtual environment backups
- Tự động tạo khi có thay đổi lớn

### Service Backups

- Scripts, automation, backend, ai-service backups
- Lưu trữ trước khi update

---

## 🧹 CLEANUP POLICY

### Mặc định

- **Reports**: Giữ 30 ngày
- **Backups**: Giữ 30 ngày
- **Lighthouse**: Giữ 30 ngày

### Tùy chỉnh

```bash
# Giữ 7 ngày
./scripts/utils/cleanup-old-reports.sh 7 false

# Giữ 60 ngày
./scripts/utils/cleanup-old-reports.sh 60 false
```

---

## ⚙️ TỰ ĐỘNG HÓA

### Cron Job (tùy chọn)

Thêm vào crontab để tự động cleanup:

```bash
# Cleanup reports cũ hơn 30 ngày mỗi tuần
0 2 * * 0 cd /path/to/project && ./scripts/utils/cleanup-old-reports.sh 30 false

# Tổ chức lại reports mỗi ngày
0 3 * * * cd /path/to/project && ./scripts/utils/organize-reports.sh
```

---

## 📝 LƯU Ý

### Git

- ✅ Reports và backups được ignore trong `.gitignore`
- ✅ Chỉ giữ lại structure (`.gitkeep` files)
- ✅ Không commit reports/backups vào repo

### Dung lượng

- Reports thường nhỏ (< 10KB mỗi file)
- Backups có thể lớn (venv backups)
- Cleanup định kỳ để tiết kiệm dung lượng

### Restore

```bash
# Restore venv backup
cp -r backups/venv/venv.backup.YYYYMMDD_HHMMSS ./venv

# Xem report
cat reports/email/email-test-report-2025-12-25.json | jq
```

---

## 📊 STATISTICS

Sau khi tổ chức:

- **Email reports**: 9 files
- **Telegram reports**: 9 files
- **Health reports**: 9 files
- **Build reports**: 3 files
- **Performance reports**: 1 file
- **Lighthouse reports**: 21 files
- **Venv backups**: 3557 items

---

## 🔄 WORKFLOW

### Khi có report mới

1. Report được tạo ở bất kỳ đâu trong project
2. Chạy `./scripts/utils/organize-reports.sh`
3. Report được di chuyển vào đúng thư mục

### Cleanup định kỳ

1. Chạy `./scripts/utils/cleanup-old-reports.sh 30 false`
2. Reports cũ hơn 30 ngày sẽ bị xóa
3. Tiết kiệm dung lượng

---

## ✅ CHECKLIST

- [x] Tạo cấu trúc thư mục
- [x] Di chuyển reports vào đúng vị trí
- [x] Di chuyển backups vào đúng vị trí
- [x] Tạo scripts tự động
- [x] Cập nhật .gitignore
- [x] Tạo documentation
- [x] Test scripts

---

**Status**: ✅ Hoàn thành
**Last Updated**: 2025-01-27
