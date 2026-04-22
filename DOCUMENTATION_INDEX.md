# 📚 Documentation Index

> **Cập nhật:** 2026-04-22 — [`AUTOMATION_SETUP.md`](./AUTOMATION_SETUP.md) đã có lại (mục lục automation). Một số dòng “không còn” dưới đây là lịch sử index cũ — kiểm tra bằng `ls` nếu nghi ngờ.

---

## 🎯 Bắt đầu từ đây

| Ưu tiên | File                                         | Ghi chú                                                                        |
| ------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| 1       | [`README.md`](./README.md)                   | Tổng quan, quick start, bảng link tài liệu                                     |
| 2       | [`ENV_SETUP.md`](./ENV_SETUP.md)             | Node 20, `.env`, backend load root `.env`, Google env                          |
| 3       | [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) | Hub lệnh nhanh → `DEVELOPMENT_TOOLS_SUMMARY`, `QUICK_SCRIPTS_REFERENCE`, ports |
| 4       | [`READ_THIS_FIRST.md`](./READ_THIS_FIRST.md) | Hướng dẫn đọc (một số link trong file có thể cần chỉnh tay nếu lỗi thời)       |
| —       | [`FIX_SUMMARY.txt`](./FIX_SUMMARY.txt)       | Tóm tắt text (legacy)                                                          |

---

## 📖 Theo chủ đề

### 🚀 Getting started & môi trường

| File                                                                     | Mục đích                                           |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| [`README.md`](./README.md)                                               | Entry chính                                        |
| [`ENV_SETUP.md`](./ENV_SETUP.md)                                         | Cài đặt, `.env`, `GOOGLE_SHEETS_SPREADSHEET_ID`, … |
| [`docs/GOOGLE_CREDENTIALS_SETUP.md`](./docs/GOOGLE_CREDENTIALS_SETUP.md) | Service account, Drive/Sheets                      |
| [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)                             | Link nhanh                                         |
| [`QUICK_SCRIPTS_REFERENCE.md`](./QUICK_SCRIPTS_REFERENCE.md)             | npm scripts, port, test                            |

**Không còn trong repo:** `START_HERE.md` → dùng **README + ENV_SETUP**. `SETUP_CHECKLIST.md` → **ENV_SETUP + verify**.

### 🛠️ Dev tools (ESLint, Prettier, Husky)

| File                                                             | Mục đích        |
| ---------------------------------------------------------------- | --------------- |
| [`DEVELOPMENT_TOOLS_SETUP.md`](./DEVELOPMENT_TOOLS_SETUP.md)     | Chi tiết        |
| [`DEVELOPMENT_TOOLS_SUMMARY.md`](./DEVELOPMENT_TOOLS_SUMMARY.md) | Bảng lệnh nhanh |

### 🗺️ Cấu trúc repo & script

| File                                                               | Mục đích                                       |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| [`Document/REPO_LAYOUT.md`](./Document/REPO_LAYOUT.md)             | Root vs `backend/`, depcheck                   |
| [`Document/DEV_SCRIPTS_NOTES.md`](./Document/DEV_SCRIPTS_NOTES.md) | `fix-missing-files`, https, artefact gitignore |
| [`SHELL_SCRIPT_STANDARDS.md`](./SHELL_SCRIPT_STANDARDS.md)         | Quy dinh vi tri + naming shell scripts         |
| [`SCRIPTS_INDEX.md`](./SCRIPTS_INDEX.md)                           | Hub scripts (refresh 2026-03)                  |
| [`SCRIPTS_GUIDE.md`](./SCRIPTS_GUIDE.md)                           | Scripts tổng quan                              |
| [`SCRIPTS_ANALYSIS.md`](./SCRIPTS_ANALYSIS.md)                     | Current snapshot + legacy notes                |
| [`SCRIPTS_RESTRUCTURE_PLAN.md`](./SCRIPTS_RESTRUCTURE_PLAN.md)     | Kế hoạch chuẩn hóa scripts                     |
| [`SCRIPTS_MIGRATION_COMPLETE.md`](./SCRIPTS_MIGRATION_COMPLETE.md) | Báo cáo phase migration + trạng thái hybrid    |
| [`SCRIPTS_TEST_REPORT.md`](./SCRIPTS_TEST_REPORT.md)               | Historical test snapshot scripts               |
| [`scripts/README.md`](./scripts/README.md)                         | Thư mục `scripts/`                             |

### 📦 Bundle optimization docs

| File                                                                               | Mục đích                                 |
| ---------------------------------------------------------------------------------- | ---------------------------------------- |
| [`BUNDLE_OPTIMIZATION_GUIDE.md`](./BUNDLE_OPTIMIZATION_GUIDE.md)                   | Guide chính để phân tích/tối ưu bundle   |
| [`BUNDLE_OPTIMIZATION_REPORT.md`](./BUNDLE_OPTIMIZATION_REPORT.md)                 | Snapshot report theo từng lần đo         |
| [`BUNDLE_OPTIMIZATION_ROADMAP.md`](./BUNDLE_OPTIMIZATION_ROADMAP.md)               | Roadmap triển khai tối ưu theo phase     |
| [`BUNDLE_OPTIMIZATION_SESSION_UPDATE.md`](./BUNDLE_OPTIMIZATION_SESSION_UPDATE.md) | Session snapshot lịch sử                 |
| [`BUNDLE_STATS_UPGRADE.md`](./BUNDLE_STATS_UPGRADE.md)                             | Technical note cho script bundle stats   |
| [`BUNDLE_STATS_AUTO_FIX.md`](./BUNDLE_STATS_AUTO_FIX.md)                           | Ghi chú auto-check/auto-fix dependencies |

### 📐 Kiến trúc

| File                                                         | Mục đích                      |
| ------------------------------------------------------------ | ----------------------------- |
| [`ARCHITECTURE_GUIDE.md`](./ARCHITECTURE_GUIDE.md)           | Hướng dẫn kiến trúc (ưu tiên) |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md)                       | Bổ sung / legacy              |
| [`PROJECT_STRUCTURE_FINAL.md`](./PROJECT_STRUCTURE_FINAL.md) | Cấu trúc thư mục              |

**Không còn:** `SYSTEM_DIAGRAM.md` → xem **ARCHITECTURE_GUIDE**, sơ đồ trong **README**.

### 📊 Google Sheets / Automation

| File                                                                                   | Mục đích                                                |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`AUTOMATION_SETUP.md`](./AUTOMATION_SETUP.md)                                         | **Entry** — port, venv, link tới `automation/` + Sheets |
| [`GOOGLE_SHEETS_SETUP_GUIDE.md`](./GOOGLE_SHEETS_SETUP_GUIDE.md)                       | Setup Sheets (root)                                     |
| [`automation/GOOGLE_SHEETS_SETUP_GUIDE.md`](./automation/GOOGLE_SHEETS_SETUP_GUIDE.md) | Góc nhìn automation                                     |
| [`automation/INTEGRATIONS_SETUP.md`](./automation/INTEGRATIONS_SETUP.md)               | Sheets, Drive, Telegram, Email                          |

### 🚢 Deploy

| File                                                                         | Mục đích                                                    |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`DEPLOY_INSTRUCTIONS.md`](./DEPLOY_INSTRUCTIONS.md)                         | Deploy tổng quan, Vercel                                    |
| [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)                               | Workflow, env, hook                                         |
| [`VERCEL_DEPLOYMENT_GUIDE.md`](./VERCEL_DEPLOYMENT_GUIDE.md)                 | Chi tiết Vercel                                             |
| [`docs/VERCEL_GOOGLE_ARCHITECTURE.md`](./docs/VERCEL_GOOGLE_ARCHITECTURE.md) | Luồng Vercel → backend → Google Sheet/Drive, env production |
| [`DEPLOYMENT_LINKS.md`](./DEPLOYMENT_LINKS.md)                               | Domain production / preview, GitHub Website, Vercel project |
| [`Document/DEPLOYMENT_SUMMARY.md`](./Document/DEPLOYMENT_SUMMARY.md)         | Tóm tắt                                                     |

### 📚 HTML docs & checklist

| File                                                             | Mục đích                                         |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| [`DOCUMENTATION_HTML_GUIDE.md`](./DOCUMENTATION_HTML_GUIDE.md)   | `npm run docs:generate`, `docs:watch`, `fswatch` |
| [`DOCUMENTATION_CHECKLIST.md`](./DOCUMENTATION_CHECKLIST.md)     | Checklist chất lượng doc                         |
| [`DOCUMENTATION_FIX_SUMMARY.md`](./DOCUMENTATION_FIX_SUMMARY.md) | Lịch sử chỉnh doc (legacy session)               |
| `docs.html`                                                      | Output sau `npm run docs:generate`               |

### 🔧 Fix / port (legacy nhưng vẫn hữu ích)

| File                                               | Mục đích                                       |
| -------------------------------------------------- | ---------------------------------------------- |
| [`PORT_CLARIFICATION.md`](./PORT_CLARIFICATION.md) | Port 3000 / 3001 / 8000 / 8001                 |
| [`FINAL_FIX_REPORT.md`](./FINAL_FIX_REPORT.md)     | Báo cáo fix cũ                                 |
| [`verify_port_config.sh`](./verify_port_config.sh) | Kiểm tra port (nếu script còn khớp môi trường) |

**Không còn:** `BACKEND_IMPROVEMENTS.md`, `CORS_FIX.md`, `IMPROVEMENT_SUMMARY.md`, `IMPROVED_SCRIPTS_GUIDE.md` — tra **DEPLOYMENT_GUIDE**, **ARCHITECTURE_GUIDE**, **SCRIPTS_GUIDE**.

### 🧪 Testing

| File                                                   | Mục đích       |
| ------------------------------------------------------ | -------------- |
| [`TEST_SCRIPTS_GUIDE.md`](./TEST_SCRIPTS_GUIDE.md)     | Hướng dẫn test |
| [`scripts/tests/README.md`](./scripts/tests/README.md) | Test scripts   |

---

## 🗺️ Lộ trình đọc gợi ý

### Nhanh (~15 phút)

1. `README.md`
2. `ENV_SETUP.md`
3. `QUICK_REFERENCE.md`
4. Chạy: `npm install` → `npm run dev` hoặc `./start.sh`

### Full-stack + deploy (~45 phút)

1. `README.md` → `ARCHITECTURE_GUIDE.md`
2. `ENV_SETUP.md` → `docs/GOOGLE_CREDENTIALS_SETUP.md`
3. `DEVELOPMENT_TOOLS_SETUP.md`
4. `DEPLOYMENT_GUIDE.md` hoặc `DEPLOY_INSTRUCTIONS.md`

### Chỉ doc HTML

1. `DOCUMENTATION_HTML_GUIDE.md`
2. `npm run docs:generate` → mở `docs.html`

---

## 📁 Một phần cây tài liệu (root)

```
├── README.md
├── ENV_SETUP.md
├── QUICK_REFERENCE.md
├── QUICK_SCRIPTS_REFERENCE.md
├── DEVELOPMENT_TOOLS_SETUP.md
├── DEVELOPMENT_TOOLS_SUMMARY.md
├── DOCUMENTATION_INDEX.md          ← file này
├── DOCUMENTATION_HTML_GUIDE.md
├── DOCUMENTATION_CHECKLIST.md
├── DOCUMENTATION_FIX_SUMMARY.md
├── DEPLOYMENT_GUIDE.md
├── DEPLOY_INSTRUCTIONS.md
├── PORT_CLARIFICATION.md
├── ARCHITECTURE.md
├── ARCHITECTURE_GUIDE.md
├── SCRIPTS_INDEX.md
├── SCRIPTS_GUIDE.md
├── SCRIPTS_ANALYSIS.md
├── SCRIPTS_RESTRUCTURE_PLAN.md
├── SCRIPTS_MIGRATION_COMPLETE.md
├── SCRIPTS_TEST_REPORT.md
├── BUNDLE_OPTIMIZATION_GUIDE.md
├── BUNDLE_OPTIMIZATION_REPORT.md
├── BUNDLE_OPTIMIZATION_ROADMAP.md
├── BUNDLE_OPTIMIZATION_SESSION_UPDATE.md
├── BUNDLE_STATS_UPGRADE.md
├── BUNDLE_STATS_AUTO_FIX.md
├── PROJECT_STRUCTURE_FINAL.md
├── FINAL_FIX_REPORT.md
├── READ_THIS_FIRST.md
├── FIX_SUMMARY.txt
├── docs/
│   └── GOOGLE_CREDENTIALS_SETUP.md
├── Document/
│   ├── REPO_LAYOUT.md
│   ├── DEV_SCRIPTS_NOTES.md
│   └── DEPLOYMENT_SUMMARY.md
├── scripts/README.md
├── start_dev_servers.sh
└── verify_port_config.sh
```

---

## 🎯 Theo tình huống

| Nhu cầu                                         | Xem                                                 |
| ----------------------------------------------- | --------------------------------------------------- |
| Mới vào project                                 | `README.md` → `ENV_SETUP.md` → `QUICK_REFERENCE.md` |
| Lint / format / commit hook                     | `DEVELOPMENT_TOOLS_SUMMARY.md`                      |
| `.env` & Google                                 | `ENV_SETUP.md`, `docs/GOOGLE_CREDENTIALS_SETUP.md`  |
| Port                                            | `QUICK_REFERENCE.md`, `PORT_CLARIFICATION.md`       |
| Deploy                                          | `DEPLOY_INSTRUCTIONS.md`, `DEPLOYMENT_GUIDE.md`     |
| Cấu trúc repo                                   | `Document/REPO_LAYOUT.md`                           |
| Artefact không commit (Lighthouse, build-stats) | `Document/DEV_SCRIPTS_NOTES.md`                     |
| Cập nhật `docs.html`                            | `DOCUMENTATION_HTML_GUIDE.md`                       |

---

## 🔍 Gợi ý lệnh tìm nhanh

**Port:**

```bash
grep -ri "port" QUICK_REFERENCE.md PORT_CLARIFICATION.md
```

**Service / stack:**

```bash
grep -ri "service" README.md DEPLOYMENT_GUIDE.md
```

**Lệnh bash trong quick ref:**

```bash
grep "bash" QUICK_REFERENCE.md QUICK_SCRIPTS_REFERENCE.md
```

**Test connection (automation port — kiểm tra path trong repo):**

```bash
node scripts/tests/frontend_connection_test.js
```

---

## ✅ Checklist bảo trì index

- [x] Không liệt kê file đã xóa như đang tồn tại
- [x] Trỏ tới `DEVELOPMENT_TOOLS_*`, `ENV_SETUP`, `Document/*`
- [x] Ghi chú `docs:generate` / `docs:watch`
- [ ] Định kỳ: `ls *.md` và so khớp bảng trên

---

**Phiên bản index:** 2.0  
**Trạng thái:** Đồng bộ repo 2026-03-20
