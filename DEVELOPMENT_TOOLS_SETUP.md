# 🛠️ Development Tools Setup - Complete

## ✅ Đã cài đặt (đồng bộ `package.json`)

**Phiên bản cụ thể:** xem trực tiếp trong `package.json` / chạy `npm ls eslint prettier husky lint-staged typescript`.

### Linting

- **ESLint** thực tế đến từ chuỗi **Create React App** (`eslint-config-react-app`, `react-scripts`) — kiểm tra: `npm ls eslint` / `npx eslint -v`.
- Trường **`eslintDependencies`** trong `package.json` chỉ là **ghi chú nội bộ** (npm **không** cài gói từ key này).

### Formatting

- **Prettier** (`devDependencies`, ~3.8.x tại thời điểm cập nhật tài liệu).
- File: `.prettierrc.json`, `.prettierignore`.

### Git hooks

- **Husky** + **lint-staged** (`devDependencies`).
- `npm install` / `npm run prepare` → **`husky`** (Husky 9+ — `husky install` đã deprecated).
- Cấu hình staged files: `.lintstagedrc.json`.

### TypeScript

- Gói **`typescript`** trong `devDependencies` (4.9.x) — `npm run type:check` / `type:watch` dùng `tsconfig.json`.
- **Không** có `@types/node` khai báo riêng ở root `package.json` (có thể vẫn có qua dependency gián tiếp).

## 📋 Scripts Mới

> **Zsh / copy-paste:** Đừng copy cả phần `# ...` **cùng dòng** với lệnh (vd. `eslint ... # Lint`). Nếu shell không bật `setopt interactivecomments`, ký tự `#` có thể bị coi là đối số → lỗi ESLint _pattern "#"_ hoặc _unknown file attribute_.  
> An toàn: chỉ copy lệnh, hoặc dùng khối bên dưới (ghi chú ở **dòng riêng**).

### Linting

```bash
# Lint code
npm run lint
# Strict: fail nếu có warning
npm run lint:check
# Auto-fix
npm run lint:fix
```

### Formatting

```bash
# Format
npm run format
# Kiểm tra không ghi file
npm run format:check
```

### Type Checking

```bash
npm run type:check
npm run type:watch
```

### Validation & Quality

```bash
# lint:check + format:check + type:check + test:ci
npm run validate
# Thêm build production
npm run validate:full
# Giống hook commit (lint-staged)
npm run pre-commit
```

### Combined Scripts

```bash
npm run analyze:all
npm run check:tools
```

## 🎯 Workflow

### Pre-commit Hook (Automatic)

Khi **commit**, Husky chạy **lint-staged** trên file **đang staged** (`git add`):

1. **`.husky/pre-commit`** gọi `npx lint-staged` (giống `npm run pre-commit`).
2. ESLint `--fix` + `npx prettier --write` theo `.lintstagedrc.json`.
3. Bỏ qua khi cần: `git commit -n` hoặc `HUSKY=0 git commit ...`
4. Thử tay: `git add <file>` rồi `npm run pre-commit`

### Manual Workflow

```bash
# 1. Format code
npm run format

# 2. Fix linting issues
npm run lint:fix

# 3. Run type check (if using TypeScript)
npm run type:check

# 4. Run tests
npm run test:ci

# 5. Full validation
npm run validate:full
```

## 📝 Configuration Files

### `.prettierrc.json`

Các key chính: `semi`, `trailingComma`, `singleQuote`, `printWidth: 100`, `tabWidth: 2`, `endOfLine`, `bracketSpacing`, `proseWrap`, … — **đầy đủ xem file trong repo** (đã mở rộng so với bản rút gọn cũ).

### `.lintstagedrc.json`

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "npx prettier --write"],
  "*.{json,css,scss,md}": ["npx prettier --write"]
}
```

### `.eslintrc.json`

- `extends`: `react-app`, `react-app/jest`, `plugin:prettier/recommended`
- `plugins`: `prettier`
- Rule tùy chỉnh: cảnh báo **`import *` từ `@ant-design/icons`** (tree-shaking); `prettier/prettier` với `endOfLine: "auto"`; override cho `*.ts` / `*.tsx`

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Lint
  run: npm run lint:check

- name: Format Check
  run: npm run format:check

- name: Type Check
  run: npm run type:check

- name: Test
  run: npm run test:ci

- name: Build (production, no sourcemap mặc định)
  run: npm run build:prod
```

## 📊 Quality Checks

### Before Commit

1. ✅ Code is formatted (Prettier)
2. ✅ No linting errors (ESLint)
3. ✅ Type checks pass (TypeScript - if applicable)
4. ✅ Tests pass (Jest)

### Before Push

1. ✅ All quality checks pass
2. ✅ Build succeeds
3. ✅ No security vulnerabilities

## 🔧 Setup Commands

### Initial Setup (One-time)

```bash
# Install dependencies
npm install

# Setup Husky (runs automatically on npm install)
npm run prepare

# Verify setup
npm run check:tools
npm run lint:check
npm run format:check
```

### Daily Development

```bash
# Start development
npm start

# Before committing
npm run format
npm run lint:fix
npm run test:ci

# Full validation
npm run validate:full
```

## 📚 Useful Commands Reference

| Command                               | Description                                      |
| ------------------------------------- | ------------------------------------------------ |
| `npm run lint`                        | Lint all code                                    |
| `npm run lint:fix`                    | Auto-fix linting issues                          |
| `npm run format`                      | Format all code                                  |
| `npm run format:check`                | Check formatting                                 |
| `npm run type:check`                  | TypeScript type check                            |
| `npm run validate`                    | lint:check + format:check + type:check + test:ci |
| `npm run validate:full`               | Full validation + build                          |
| `npm run pre-commit`                  | Run lint-staged manually                         |
| `npm run check:tools` / `tools:check` | Kiểm tra Node, npm, Python, git, …               |

## 🧩 VS Code / Cursor Extensions

`scripts/setup/ide-setup.sh` **cài extension qua CLI `code`** khi máy có **VS Code**. **Cursor** không được script gọi `cursor --install-extension` — mở Extensions trong Cursor và cài theo danh sách dưới (hoặc dùng recommendations trong workspace).

| Extension ID                                 | Mô tả                                  |
| -------------------------------------------- | -------------------------------------- |
| `esbenp.prettier-vscode`                     | Prettier – Code formatter              |
| `dbaeumer.vscode-eslint`                     | ESLint – Linting JavaScript/TypeScript |
| `eamodio.gitlens`                            | GitLens – Git supercharged             |
| `ms-vscode.vscode-typescript-next`           | TypeScript Nightly                     |
| `bradlc.vscode-tailwindcss`                  | Tailwind CSS IntelliSense              |
| `ms-python.python`                           | Python language support                |
| `ms-toolsai.jupyter`                         | Jupyter Notebook                       |
| `Prisma.prisma`                              | Prisma ORM support                     |
| `GraphQL.vscode-graphql`                     | GraphQL language support               |
| `pkief.material-icon-theme`                  | Material Icon Theme                    |
| `styled-components.vscode-styled-components` | Styled Components syntax highlighting  |
| `csstools.postcss`                           | PostCSS language support               |
| `formulahendry.code-runner`                  | Code Runner                            |
| `ms-python.black-formatter`                  | Black – Python formatter               |
| `ms-python.flake8`                           | Flake8 – Python linter                 |
| `ms-python.isort`                            | isort – Python import sorter           |

### Cài đặt extensions (tự động)

```bash
bash scripts/setup/ide-setup.sh
```

### Cài đặt thủ công (ví dụ với VS Code)

```bash
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension eamodio.gitlens
# ... (xem danh sách đầy đủ bên trên)
```

---

## 🐍 Python Libraries (Automation)

Được cài đặt vào virtual environment `one_automation_system/venv/` qua `scripts/setup/ide-setup.sh`:

### Core packages

| Package                | Mô tả                          |
| ---------------------- | ------------------------------ |
| `uvicorn`              | ASGI server cho FastAPI        |
| `fastapi`              | Web framework hiệu năng cao    |
| `python-dotenv`        | Đọc biến môi trường từ `.env`  |
| `gspread`              | Google Sheets API client       |
| `google-auth`          | Google authentication          |
| `google-auth-oauthlib` | OAuth2 flow cho Google APIs    |
| `google-auth-httplib2` | HTTP transport cho Google auth |
| `pandas`               | Xử lý và phân tích dữ liệu     |
| `numpy`                | Tính toán số học               |
| `openpyxl`             | Đọc/ghi file Excel (.xlsx)     |

### Khởi tạo môi trường Python thủ công

```bash
cd one_automation_system
python3 -m venv venv
source venv/bin/activate

# Nếu có file requirements-minimal.txt
pip install -r requirements-minimal.txt

# Hoặc cài thủ công
pip install uvicorn fastapi python-dotenv gspread \
    google-auth google-auth-oauthlib google-auth-httplib2 \
    pandas numpy openpyxl
```

### Python formatter / linter (VS Code extensions)

| Tool   | Extension                   | Chức năng                  |
| ------ | --------------------------- | -------------------------- |
| Black  | `ms-python.black-formatter` | Format code Python tự động |
| Flake8 | `ms-python.flake8`          | Kiểm tra style PEP8        |
| isort  | `ms-python.isort`           | Sắp xếp thứ tự import      |

---

## ✅ Checklist

- [x] ESLint configured
- [x] Prettier configured
- [x] Husky installed
- [x] lint-staged configured
- [x] TypeScript (`tsc`) cho type-check
- [x] Scripts added to package.json
- [x] Configuration files created
- [x] Pre-commit hook tested (run after first commit)
- [x] VS Code / Cursor extensions documented
- [x] Python automation libraries documented

---

**Date**: December 25, 2025  
**Updated**: March 18, 2026 — đồng bộ `package.json`, `.lintstagedrc.json`, `.eslintrc.json`, Husky/lint-staged, VS Code vs Cursor  
**Status**: ✅ **Complete**  
**Tools**: ESLint (CRA + Prettier), Prettier, Husky, lint-staged, TypeScript, VS Code Extensions, Python (`one_automation_system/venv`)  
**Môi trường tổng quát:** [ENV_SETUP.md](./ENV_SETUP.md)
