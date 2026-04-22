# Biến môi trường Production (Vercel + Railway)

> Cập nhật: 2026-03-23 — đồng bộ với `react-oas-integration-v4-0` + Railway backend.

## URL cố định

| Thành phần        | URL                                                               |
| ----------------- | ----------------------------------------------------------------- |
| Frontend (Vercel) | `https://react-oas-integration-v4-0.vercel.app`                   |
| Backend (Railway) | `https://react-oas-integration-backend-production.up.railway.app` |

---

## 1. Vercel — Project `react-oas-integration-v4-0`

**Settings → Environment Variables** — bật **Production** và **Preview** (cùng giá trị để preview không gọi nhầm localhost).

| Biến                                     | Giá trị (production)                                                  | Ghi chú                                                                                                |
| ---------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `REACT_APP_API_URL`                      | `https://react-oas-integration-backend-production.up.railway.app`     | Không có `/api` cuối                                                                                   |
| `REACT_APP_API_BASE_URL`                 | `https://react-oas-integration-backend-production.up.railway.app/api` | Sheets/Drive proxy                                                                                     |
| `REACT_APP_WS_URL`                       | `https://react-oas-integration-backend-production.up.railway.app`     | Socket.IO = host REST                                                                                  |
| `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID` | `<spreadsheet-id>`                                                    | Trùng spreadsheet backend dùng                                                                         |
| `REACT_APP_GOOGLE_DRIVE_FOLDER_ID`       | `<folder-id>`                                                         | Tuỳ chọn                                                                                               |
| `REACT_APP_AI_SERVICE_URL`               | `https://<ai-public-url>` hoặc bỏ                                     | Chỉ khi AI deploy public; **không** `localhost` — chi tiết: [AI_SERVICE_GUIDE.md](AI_SERVICE_GUIDE.md) |

**CLI (đồng bộ hàng loạt):**

```bash
cd /path/to/oas-integration
bash scripts/update_vercel_env.sh react-oas-integration-v4-0 all
```

(`all` = ghi cả **Production** + **Preview**.)

Sau khi đổi env: **Deployments → Redeploy**.

---

## 2. Railway — Service backend Node

**Variables** (tối thiểu; bổ sung secret thật trên Dashboard, không commit):

| Biến                                                                         | Mô tả                                                                                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PORT`                                                                       | Railway inject (vd. `8080`). Trong code: `PORT \|\| BACKEND_PORT \|\| 3001`. **Local monorepo + CRA:** dùng `BACKEND_PORT=3001`, tránh `PORT=` ở `.env` gốc. |
| `NODE_ENV`                                                                   | `production`                                                                                                                                                 |
| `GOOGLE_SHEETS_SPREADSHEET_ID` hoặc `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID` | ID sheet mặc định                                                                                                                                            |
| `GOOGLE_APPLICATION_CREDENTIALS` / `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`         | JSON service account (hoặc paste JSON tuỳ cách deploy)                                                                                                       |
| `JWT_SECRET`                                                                 | Chuỗi dài, ngẫu nhiên                                                                                                                                        |
| `CORS_ORIGIN`                                                                | `https://react-oas-integration-v4-0.vercel.app` — nếu sau này siết origin (hiện `cors()` mở)                                                                 |

File mẫu chi tiết: [`backend/railway.env.example`](../backend/railway.env.example).

---

## 3. Local / build máy

| File                                                                    | Mục đích                                                              |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`.env.development`](../.env.development)                               | `REACT_APP_*` + `BACKEND_PORT`; CRA mặc định **:3000**, API **:3001** |
| [`.env.production`](../.env.production)                                 | Giá trị production khi `npm run build` local (đã trỏ Railway)         |
| `npx vercel env pull .env.production.local --environment production -y` | Lấy env từ Vercel trước khi `vercel build --prod`                     |

---

## Liên kết

- [`DEPLOYMENT_LINKS.md`](../DEPLOYMENT_LINKS.md)
- [`DEV_SCRIPTS_NOTES.md`](./DEV_SCRIPTS_NOTES.md) (Vercel CLI, husky, prebuilt)
