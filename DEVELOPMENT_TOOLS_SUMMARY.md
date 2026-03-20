# 🛠️ Development Tools - Setup Summary

## ✅ Đã Cài Đặt và Cấu Hình

### 1. Linting & Formatting

**Stack (phiên bản cụ thể: `package.json` + `npm ls`)**:

- ✅ **ESLint** — thực tế qua **Create React App** / `eslint-config-react-app` (`react-scripts`)
- ✅ **Prettier** — `devDependencies` (~3.8.x tại thời điểm cập nhật doc)
- ✅ **eslint-config-prettier**, **eslint-plugin-prettier** — tích hợp với `.eslintrc.json` (`plugin:prettier/recommended`)
- ℹ️ Khối **`eslintDependencies`** trong `package.json` chỉ là ghi chú — npm **không** cài từ key đó

**Configuration Files**:

- ✅ `.eslintrc.json` — extends `react-app`, `react-app/jest`, Prettier; rule cảnh báo `import *` `@ant-design/icons`
- ✅ `.prettierrc.json` — `printWidth: 100`, v.v. (đầy đủ xem file trong repo)
- ✅ `.prettierignore`

### 2. Git Hooks (Pre-commit)

**Dependencies** (`devDependencies` — xem version trong `package.json`):

- ✅ **Husky** — `npm run prepare` → `husky` (v9+, không dùng `husky install`)
- ✅ **lint-staged** — chỉ chạy trên file **đã `git add`**

**Configuration Files**:

- ✅ `.lintstagedrc.json` — `eslint --fix` + `npx prettier --write`

### 3. TypeScript

**Dependencies**:

- ✅ `typescript` (devDependencies) — `npm run type:check` / `tsconfig.json`
- ℹ️ Root `package.json` **không** khai báo `@types/node` trực tiếp (có thể transitive)

## 📋 Scripts Mới Đã Thêm

> **Zsh:** Tránh copy `lệnh  # ghi chú` một dòng — xem [DEVELOPMENT_TOOLS_SETUP.md](./DEVELOPMENT_TOOLS_SETUP.md) (mục Scripts).  
> **Prettier:** `npx prettier` không đối số → chỉ hiện help (đúng CLI). Dùng `npm run prettier` (= `format`) hoặc `npx prettier --write <file>`.

### Linting

```bash
npm run lint
npm run lint:check
npm run lint:fix
```

### Formatting

```bash
npm run format
npm run format:check
```

### Type Checking

```bash
npm run type:check
npm run type:watch
```

### Validation

```bash
npm run validate
npm run validate:full
npm run pre-commit
```

## 🚀 Usage

### Daily Development

```bash
# Format code
npm run format

# Fix linting issues
npm run lint:fix

# Check everything before commit
npm run validate

# Full validation (including build)
npm run validate:full
```

### Pre-commit Hook

Khi **commit**, Husky chạy **lint-staged** trên file **staged** (`git add`):

1. **`.husky/pre-commit`** → `npx lint-staged`
2. `eslint --fix` + `npx prettier --write` (theo `.lintstagedrc.json`)
3. `npm run pre-commit` thủ công: chưa `git add` → _No staged files_
4. Bỏ qua hook: `git commit -n` hoặc `HUSKY=0 git commit ...`

**Setup Husky** (already completed):

```bash
# Husky (thường chạy qua npm postinstall / prepare)
npm run prepare
```

**Verify Hook hoạt động**:

```bash
# Test pre-commit hook
git add .
git commit -m "Test commit"
# Hook sẽ tự động chạy lint-staged
```

## 📝 Configuration

### `.prettierrc.json`

Đồng bộ với file trong repo (`bracketSpacing`, `proseWrap`, …). Không nhân bản JSON ở đây để tránh lệch — xem [DEVELOPMENT_TOOLS_SETUP.md](./DEVELOPMENT_TOOLS_SETUP.md) hoặc mở `.prettierrc.json`.

### `.lintstagedrc.json`

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "npx prettier --write"],
  "*.{json,css,scss,md}": ["npx prettier --write"]
}
```

**Note**: Sử dụng `npx prettier` thay vì `prettier` để tránh lỗi EACCES permission.

### `.prettierignore`

```
node_modules
build
coverage
dist
.next
*.log
package-lock.json
```

## ✅ Status

- [x] ESLint configured
- [x] Prettier configured
- [x] Husky installed and configured
- [x] lint-staged configured with npx prettier
- [x] TypeScript (`type:check` / `tsconfig.json`)
- [x] Scripts added to package.json
- [x] Configuration files created
- [x] Husky pre-commit hook tested and verified
- [x] Git remote origin configured
- [x] Remote `origin` (tuỳ máy — xem mục Troubleshooting nếu thiếu)

## 📚 Quick Reference

| Command                                           | Mô tả                                                    |
| ------------------------------------------------- | -------------------------------------------------------- |
| `npm run lint`                                    | ESLint `src` (`.js`, `.jsx`)                             |
| `npm run lint:check`                              | Giống trên, `--max-warnings 0` (strict)                  |
| `npm run lint:fix`                                | ESLint + auto-fix                                        |
| `npm run format` / `npm run prettier`             | Prettier ghi `src/**/*.{js,jsx,json,css,md}`             |
| `npm run format:check` / `npm run prettier:check` | Prettier chỉ kiểm tra, không sửa file                    |
| `npm run type:check`                              | `tsc --noEmit`                                           |
| `npm run type:watch`                              | `tsc --noEmit --watch`                                   |
| `npm run validate`                                | `lint:check` + `format:check` + `type:check` + `test:ci` |
| `npm run validate:full`                           | `validate` + `build:prod`                                |
| `npm run pre-commit`                              | `lint-staged` (cần `git add` trước)                      |
| `npm run check:tools` / `npm run tools:check`     | Kiểm tra Node, npm, Python, git, …                       |
| `npm run scripts:guard-wrappers`                  | Guard script root chỉ là wrapper ngắn                    |

**Môi trường & cài đặt đầy đủ:** [ENV_SETUP.md](./ENV_SETUP.md) · **Chi tiết công cụ:** [DEVELOPMENT_TOOLS_SETUP.md](./DEVELOPMENT_TOOLS_SETUP.md)

## 🔧 Troubleshooting

### Issue: `npx prettier` chỉ in Usage / help

**Problem**: Chạy `npx prettier` không kèm path → CLI không biết format file nào.

**Solution**: `npm run prettier` hoặc `npm run format` (glob chuẩn repo). Một file: `npx prettier --write src/App.jsx`.

### Issue: Prettier EACCES Error

**Problem**: `prettier --write failed without output (EACCES)`

**Solution**: Cập nhật `.lintstagedrc.json` để sử dụng `npx prettier` thay vì `prettier`

### Issue: Git Remote Not Found

**Problem**: `fatal: 'origin' does not appear to be a git repository`

**Solution**:

```bash
git remote add origin https://github.com/caovinhphuc/React-OAS-Integration-v4.0.git
git remote -v  # Verify
```

### Issue: Non-Fast-Forward Push

**Problem**: `Updates were rejected because the tip of your current branch is behind`

**Solution**:

```bash
git pull origin main --no-rebase
# Resolve conflicts if any
git add .
git commit -m "Merge: Resolve conflicts"
git push origin main
```

---

**Date**: January 21, 2026  
**Updated**: March 20, 2026 — Quick Reference (prettier alias, Husky 9, pre-commit), Troubleshooting `npx prettier`  
**Status**: ✅ **Complete**  
**Chi tiết:** [DEVELOPMENT_TOOLS_SETUP.md](./DEVELOPMENT_TOOLS_SETUP.md)
