# 📝 Documentation Update Report

> **Ngày cập nhật**: 2026-03-20  
> **Người thực hiện**: AI Assistant  
> **Mục tiêu**: Đồng bộ tài liệu với trạng thái code + scripts hiện tại (Node 20, Husky 9, env, docs scripts, reports gitignore).

---

## ✅ Đã cập nhật trong đợt này

### 1) Core docs

- `DOCUMENTATION_INDEX.md`
  - Viết lại theo **file có thật** trong repo.
  - Gỡ các tham chiếu cũ không còn tồn tại (`START_HERE.md`, `AUTOMATION_SETUP.md`, `SYSTEM_DIAGRAM.md`, ...).
  - Bổ sung lộ trình đọc mới + search tips.

- `README.md`
  - Bổ sung link `DOCUMENTATION_INDEX.md` trong bảng Documentation.
  - Đồng bộ mục guidelines với workflow hiện tại.

### 2) Environment / Google config docs

- `ENV_SETUP.md`
  - Chốt Node theo `.nvmrc` = **20**.
  - Làm rõ backend đọc `.env` tại **root**.
  - Đồng bộ naming biến spreadsheet backend: `GOOGLE_SHEETS_SPREADSHEET_ID`.

- `docs/GOOGLE_CREDENTIALS_SETUP.md`
  - Cập nhật block env theo naming mới (`GOOGLE_SHEETS_SPREADSHEET_ID`, `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID`).
  - Ghi chú legacy vars để tương thích script cũ.

### 3) Development tools docs

- `DEVELOPMENT_TOOLS_SETUP.md`
- `DEVELOPMENT_TOOLS_SUMMARY.md`

Nội dung đã đồng bộ:

- Husky 9: `prepare` dùng `husky` (không còn `husky install`).
- `.husky/pre-commit` chạy `npx lint-staged`.
- Prettier alias: `npm run prettier`, `npm run prettier:check`.
- Giải thích rõ `No staged files found` là hành vi bình thường.
- Giải thích `npx prettier` không đối số chỉ in usage.

### 4) Deployment / script docs

- `DEPLOYMENT_GUIDE.md`
- `DEPLOY_INSTRUCTIONS.md`
- `scripts/README.md`
- `REPORTS_BACKUPS_GUIDE.md`
- `reports/README.md`
- `Document/DEV_SCRIPTS_NOTES.md`
- `BUNDLE_STATS_UPGRADE.md`

Nội dung chính:

- Đồng bộ hành vi pre-commit/husky.
- Đồng bộ reports/perf artifacts là output tự sinh.
- Nhấn mạnh các artifact nặng đã đưa vào `.gitignore`.

### 5) HTML docs workflow

- `package.json`
  - Thêm script:
    - `docs:generate`
    - `docs:watch`

- `DOCUMENTATION_HTML_GUIDE.md`
  - Cập nhật cách chạy generate/watch.
  - Bổ sung yêu cầu `fswatch` cho watch mode trên macOS.

---

## ✅ Trạng thái hiện tại

- `npm run docs:generate` chạy thành công và tạo `docs.html`.
- Pre-commit đã bật lại (`.husky/pre-commit` không còn `exit 0`).
- `.gitignore` đã cấu hình bỏ track artifacts nặng:
  - `**/lighthouse-reports/**`
  - `build-stats/*.json`
  - `bundle-report.json`
  - `performance-budget-report.json`
  - `health-report-*.json` (root)

---

## ⚠️ Ghi chú quan trọng

- `package.json` hiện vẫn để version `3.0.0` (intentional/legacy). Không đổi tự động nếu chưa chốt release plan.
- Một số tài liệu legacy vẫn có thể chứa reference cũ; ưu tiên tra theo:
  1. `DOCUMENTATION_INDEX.md`
  2. `README.md` (mục Documentation)
  3. `ENV_SETUP.md` + `DEVELOPMENT_TOOLS_SETUP.md`

---

## 🚀 Next step gợi ý

1. Khi rảnh: rà thêm các file `*SUMMARY*`/`*REPORT*` cũ để giảm trùng lặp.
2. Nếu muốn phát hành v4 chính thức: chốt policy version rồi update đồng bộ `package.json` + badge/docs.
3. Giữ `DOCUMENTATION_INDEX.md` là "single source of truth" cho điều hướng docs.

---

**Last Updated**: 2026-03-20  
**Status**: ✅ Synced with current repository state
