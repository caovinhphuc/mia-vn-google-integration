# 📚 Scripts Directory - React OAS Integration v4.0

> **Cấu trúc scripts đã được tổ chức lại**  
> **Ngày cập nhật**: 2025-01-27

---

## 📁 CẤU TRÚC THƯ MỤC

```
scripts/
├── setup/              # Setup scripts
├── start-stop/         # Start/Stop scripts
├── deploy/             # Deployment scripts
├── fix/                # Fix/Troubleshooting
├── utils/              # Utility scripts
└── git/                # Git operations
```

---

## 🚀 QUICK START

### Development

```bash
# Start all services
./start.sh
# hoặc
./scripts/start-stop/start-all.sh

# Stop all services
./stop.sh
# hoặc
./scripts/start-stop/stop-all.sh
```

### Deployment

```bash
# Main deploy (Netlify + Render)
./deploy.sh "Commit message"
# hoặc
./scripts/deploy/deploy-main.sh "Commit message"

# Quick deploy (Vercel + Railway)
./quick-deploy.sh "Commit message"
# hoặc
./scripts/deploy/quick-deploy.sh "Commit message"
```

### CI/CD workflow (local)

```bash
./test_workflow.sh
```

- Bước 1: validate `.github/workflows/ci-cd.yml` — ưu tiên **PyYAML**; nếu chưa cài thì dùng **Ruby** (thường có trên macOS). Tuỳ chọn: `pip install -r scripts/requirements-workflow.txt`
- Bước 3: Python **≥ 3.11** (khớp biến `PYTHON_VERSION` trên GitHub Actions)
- Bước 9: Docker **CLI** có mặt là đủ; daemon tắt → `[ℹ]` (không fail), vì CI build trên runner GitHub

**Backup `package.json`:** script `upgrade-phase1` ghi vào `backups/package-json/package.json.backup.<timestamp>`. File cũ ở root: `./scripts/utils/organize-reports.sh` (cùng bước gom backup).

**Lighthouse HTML / log-analysis:** `organize-reports.sh` gom ở root → `lighthouse-reports/`: `lighthouse-report*.html` và `*.report.html` (vd. `your-app.vercel.app_….report.html`). `log-analysis-*.json` → `reports/log-analysis/`. `run-lighthouse.sh` và `log-analyzer.js` ghi thẳng đúng chỗ mới. **`.gitignore`** bỏ qua `**/lighthouse-reports/**` và `build-stats/*.json`, v.v. — không commit (xem `Document/DEV_SCRIPTS_NOTES.md`).

---

## 📖 TÀI LIỆU CHI TIẾT

Xem [SCRIPTS_GUIDE.md](../SCRIPTS_GUIDE.md) để biết hướng dẫn chi tiết về từng script.

---

## ⚠️ LƯU Ý

- Tất cả scripts được thiết kế để chạy từ **root directory**
- Scripts tự động detect project root
- Sử dụng wrapper scripts ở root level để dễ dàng hơn

---

**Last Updated**: 2026-03-20
