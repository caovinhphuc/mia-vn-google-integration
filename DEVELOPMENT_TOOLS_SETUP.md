# 🛠️ Development Tools Setup - Complete

## ✅ Đã Cài Đặt

### 1. Linting Tools

```json
{
  "devDependencies": {
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-jsx-a11y": "^6.9.0",
    "eslint-plugin-import": "^2.29.1",
    "@typescript-eslint/parser": "^7.2.0",
    "@typescript-eslint/eslint-plugin": "^7.2.0"
  }
}
```

### 2. Formatting Tools

```json
{
  "devDependencies": {
    "prettier": "^3.2.5"
  }
}
```

**Configuration**: `.prettierrc.json` và `.prettierignore`

### 3. Git Hooks (Pre-commit)

```json
{
  "devDependencies": {
    "husky": "^9.0.11",
    "lint-staged": "^15.2.2"
  }
}
```

**Configuration**: `.lintstagedrc.json`

### 4. Type Definitions

```json
{
  "devDependencies": {
    "@types/node": "^20.11.30"
  }
}
```

## 📋 Scripts Mới

### Linting

```bash
npm run lint          # Lint code
npm run lint:check    # Lint check (strict, fails on warnings)
npm run lint:fix      # Auto-fix linting issues
```

### Formatting

```bash
npm run format        # Format code
npm run format:check  # Check formatting
```

### Type Checking

```bash
npm run type:check    # TypeScript type check
npm run type:watch    # TypeScript watch mode
```

### Validation & Quality

```bash
npm run validate      # Run lint, format check, and tests
npm run validate:full # Full validation including build
npm run pre-commit    # Run lint-staged (auto on git commit)
```

### Combined Scripts

```bash
npm run analyze:all   # Run all analysis tools
npm run check:tools   # Check all development tools
```

## 🎯 Workflow

### Pre-commit Hook (Automatic)

Khi commit code, Husky sẽ tự động:

1. Chạy ESLint và auto-fix
2. Format code với Prettier
3. Chỉ commit files đã được lint và format

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

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### `.lintstagedrc.json`

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,scss,md}": ["prettier --write"]
}
```

### `.eslintrc.json`

Đã có sẵn với `eslint-config-react-app`

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

- name: Build
  run: npm run build
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

| Command                 | Description                 |
| ----------------------- | --------------------------- |
| `npm run lint`          | Lint all code               |
| `npm run lint:fix`      | Auto-fix linting issues     |
| `npm run format`        | Format all code             |
| `npm run format:check`  | Check formatting            |
| `npm run type:check`    | TypeScript type check       |
| `npm run validate`      | Run lint, format, and tests |
| `npm run validate:full` | Full validation + build     |
| `npm run pre-commit`    | Run lint-staged manually    |
| `npm run check:tools`   | Check all dev tools         |

## 🧩 VS Code / Cursor Extensions

Được cài đặt tự động qua `scripts/setup/ide-setup.sh`:

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
- [x] Type definitions added
- [x] Scripts added to package.json
- [x] Configuration files created
- [x] Pre-commit hook tested (run after first commit)
- [x] VS Code / Cursor extensions documented
- [x] Python automation libraries documented

---

**Date**: December 25, 2025
**Updated**: March 17, 2026
**Status**: ✅ **Complete**
**Tools**: ESLint, Prettier, Husky, lint-staged, TypeScript, VS Code Extensions, Python (FastAPI / Google APIs)
