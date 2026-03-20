# ✅ Development Tools — Tham chiếu nhanh

> **Tài liệu đầy đủ & cập nhật:** [`DEVELOPMENT_TOOLS_SETUP.md`](./DEVELOPMENT_TOOLS_SETUP.md) · Tóm tắt: [`DEVELOPMENT_TOOLS_SUMMARY.md`](./DEVELOPMENT_TOOLS_SUMMARY.md)

## Hiện trạng repo (2026-03)

| Hạng mục        | Ghi chú                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ |
| **Husky**       | `package.json` → `"prepare": "husky"` (Husky 9+)                                           |
| **Pre-commit**  | `.husky/pre-commit` chạy `npx lint-staged` (cần `git add` trước)                           |
| **Bỏ qua hook** | `git commit -n` hoặc `HUSKY=0 git commit ...`                                              |
| **Prettier**    | `npm run format` ≡ `npm run prettier`; check: `format:check` / `prettier:check`            |
| **lint-staged** | `.lintstagedrc.json` — `eslint --fix` + `npx prettier --write`                             |
| **ESLint**      | Chủ yếu qua CRA + `.eslintrc.json`; `eslintDependencies` trong package.json chỉ là ghi chú |

## Lệnh thường dùng

```bash
npm run prepare          # husky (sau clone / đổi máy)
npm run format           # hoặc: npm run prettier
npm run lint:fix
npm run validate
```

---

_File này tránh trùng lặp chi tiết — mọi cập nhật dài hạn ghi ở DEVELOPMENT_TOOLS_SETUP.md._
