# 📚 HTML Documentation Guide

> **React OAS Integration v4.0**  
> **Ngày cập nhật**: 2026-03-20

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Tạo HTML Documentation ✅

- ✅ File `docs.html` - Complete documentation HTML
- ✅ Tự động generate từ markdown files
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Sidebar navigation

### 2. Scripts tự động ✅

- ✅ `scripts/utils/generate-complete-docs.js` - Generate HTML từ markdown
- ✅ `scripts/utils/auto-update-docs.sh` - Auto update script

### 3. NPM Scripts ✅

- ✅ `npm run docs:generate` — ghi `docs.html` (root)
- ✅ `npm run docs:watch` — gọi `auto-update-docs.sh true` (cần **`fswatch`** trên macOS: `brew install fswatch`)

---

## 🚀 CÁCH SỬ DỤNG

### Generate Documentation

```bash
# Generate một lần
npm run docs:generate
# hoặc
node scripts/utils/generate-complete-docs.js

# Watch mode — xem mục "Auto (watch)" bên dưới
npm run docs:watch
# hoặc
./scripts/utils/auto-update-docs.sh true
```

### Auto (watch) — cần làm gì?

1. **`package.json` có script** (đoạn `"docs:watch": "bash scripts/utils/auto-update-docs.sh true"`). Nếu `npm run docs:watch` báo _Missing script_ → file chưa lưu / chưa pull đúng branch, hoặc không đứng ở **root repo** (nơi có `package.json`).

2. **Công cụ `fswatch`** (script dùng lệnh này để theo dõi file `*.md`):
   - **macOS:** `brew install fswatch`
   - Chưa cài → vòng lặp watch sẽ lỗi _command not found_ sau lần generate đầu tiên.

3. **Cách chạy:** mở một terminal, từ root:

   ```bash
   npm run docs:watch
   ```

   Giữ terminal đó; mỗi khi lưu file `.md` trong repo, `docs.html` được generate lại. Dừng: `Ctrl+C`.

4. **Không dùng watch:** sau mỗi lần sửa markdown, chạy một lần:
   ```bash
   npm run docs:generate
   ```

### Xem Documentation

```bash
# Mở trong browser
open docs.html
# hoặc
xdg-open docs.html  # Linux
start docs.html     # Windows
```

---

## 📁 CẤU TRÚC

### File HTML

- `docs.html` - Complete documentation HTML (auto-generated)

### Scripts

- `scripts/utils/generate-complete-docs.js` - Generator script
- `scripts/utils/auto-update-docs.sh` - Auto-update script

### Source Files (Markdown)

Documentation được generate từ các file markdown:

- `README.md` - Overview
- `ARCHITECTURE.md` - Architecture
- `DEPLOYMENT_GUIDE.md` - Setup & Deployment
- `SCRIPTS_GUIDE.md` - Scripts Guide
- `PYTHON_FILES_GUIDE.md` - Python Files
- `JAVASCRIPT_FILES_GUIDE.md` - JavaScript Files
- `REPORTS_BACKUPS_GUIDE.md` - Reports & Backups
- `GOOGLE_SHEETS_SETUP_GUIDE.md` - Google Sheets
- `WEBSOCKET_SETUP_GUIDE.md` - WebSocket
- `UI_COMPONENTS_GUIDE.md` - UI Components

---

## 🎨 TÍNH NĂNG

### 1. Dark Mode ✅

- Toggle dark/light mode
- Lưu preference trong localStorage
- Auto-detect system preference

### 2. Responsive Design ✅

- Mobile-friendly
- Sidebar navigation
- Touch-friendly controls

### 3. Navigation ✅

- Sidebar với tất cả sections
- Active link highlighting
- Smooth scrolling

### 4. Auto-Update ✅

- Generate từ markdown: `npm run docs:generate`
- Watch: `npm run docs:watch` + **`fswatch`** (xem mục **Auto (watch)** ở trên)
- Timestamp hiển thị last updated

---

## 📋 SECTIONS

Documentation bao gồm các sections:

1. **📋 Tổng Quan** - Overview từ README.md
2. **🏗️ Kiến Trúc** - Architecture từ ARCHITECTURE.md
3. **⚙️ Setup & Deployment** - Setup guide
4. **🔧 Scripts Guide** - Scripts documentation
5. **🐍 Python Files** - Python files organization
6. **📦 JavaScript Files** - JavaScript files organization
7. **📊 Reports & Backups** - Reports management
8. **📊 Google Sheets** - Google Sheets setup
9. **🔌 WebSocket** - WebSocket setup
10. **🎨 UI Components** - UI Components guide

---

## 🔄 AUTO-UPDATE

### Watch Mode

```bash
npm run docs:watch
```

Script sẽ:

- ✅ Watch tất cả file .md
- ✅ Tự động regenerate khi có thay đổi
- ✅ Hiển thị notification khi update

### Manual Update

```bash
npm run docs:generate
```

---

## 📝 LƯU Ý

### Markdown Files

- Documentation được generate từ markdown files
- Nếu markdown file không tồn tại, section sẽ hiển thị "Content đang được cập nhật..."
- Mỗi section giới hạn ~10KB để tránh file quá lớn

### Customization

Để thêm/sửa sections, edit `scripts/utils/generate-complete-docs.js`:

```javascript
const SECTIONS = [
  {
    id: "new-section",
    title: "📝 New Section",
    icon: "📝",
    file: "NEW_GUIDE.md",
    description: "Description",
  },
  // ...
];
```

---

## ✅ CHECKLIST

- [x] Tạo HTML template
- [x] Tạo generator script
- [x] Tạo auto-update script
- [x] Thêm NPM scripts
- [x] Test generation
- [x] Test dark mode
- [x] Test responsive
- [x] Documentation

---

## 📊 KẾT QUẢ

- **File generated**: `docs.html`
- **Sections**: 10 sections
- **Source files**: 10 markdown files
- **Features**: Dark mode, Responsive, Auto-update

---

**Status**: ✅ Complete  
**Last Updated**: 2025-01-27
