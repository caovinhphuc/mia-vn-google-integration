# Ghi chú script dev (chắc cú để tra)

## Cổng chuẩn (local)

| Dịch vụ      | Port | Ghi chú                         |
| ------------ | ---- | ------------------------------- |
| Frontend     | 3000 | CRA / Vite                      |
| Backend      | 3001 | API chính                       |
| AI (FastAPI) | 8000 | `ai-service`                    |
| Automation   | 8001 | `automation-service` (tùy chọn) |

## `scripts/fix/fix-missing-files.sh`

**Mục đích:** So sánh **một danh sách file cố định** trên branch hiện tại với branch nguồn (`main` hoặc branch bạn truyền), rồi **tùy chọn** lấy lại bản từ nguồn nếu file **thiếu** hoặc **khác nội dung**.

**Không phải** công cụ “tìm mọi file thiếu trong repo” — chỉ xử lý đúng các path trong mảng `FILES` trong script (hiện tại):

| File                                                |
| --------------------------------------------------- |
| `src/components/automation/AutomationDashboard.jsx` |
| `src/components/automation/AutomationDashboard.css` |

**Cách chạy:**

```bash
# Từ root repo, đã có git
bash scripts/fix/fix-missing-files.sh           # so với main (hoặc origin/main)
bash scripts/fix/fix-missing-files.sh develop   # so với develop
```

**Luồng hoạt động:**

1. Resolve ref: `main` → `origin/main` nếu cần.
2. Với mỗi file: không có trên source / MISSING / DIFFERENT / OK (so hash với `git show`).
3. Hỏi **y/n** có `git checkout <source> -- <file>` + `git add` không.
4. Hỏi tiếp có **commit + push** không (cẩn thận: có thể ghi đè chỉnh sửa local).

**Lưu ý:** Chỉ dùng khi bạn **cố ý** đồng bộ 2 file automation với branch chuẩn; không chạy bừa nếu đang có thay đổi quan trọng chưa commit.

---

## `scripts/setup/https-setup.sh`

**Mục đích:** Tạo **SSL tự ký** (OpenSSL) trong `certs/` — `key.pem` + `cert.pem`, CN `localhost`, **365 ngày**.

**Dùng cho:** HTTPS **local dev** (Node `https.createServer`, v.v.). Trình duyệt sẽ cảnh báo không tin cậy — bình thường.

**Không dùng** thay chứng chỉ production (cần CA / Let’s Encrypt).

```bash
bash scripts/setup/https-setup.sh
```

---

## Bản đồ repo (frontend vs backend)

Xem thêm: [`REPO_LAYOUT.md`](./REPO_LAYOUT.md) — root = React chính, `backend/` = API riêng.

---

## Báo cáo tự sinh (không commit — `.gitignore`)

Các file sau **không** đưa vào git (nặng, tạo lại được):

| Pattern / path                                           | Nguồn gần đúng                                      |
| -------------------------------------------------------- | --------------------------------------------------- |
| `**/lighthouse-reports/**`                               | `npm run perf:lighthouse`, LHCI                     |
| `/build-stats/*.json`                                    | `npm run bundle:stats` / `generate-bundle-stats.js` |
| `/bundle-report.json`, `/performance-budget-report.json` | script phân tích bundle / budget                    |
| `/health-report-*.json`                                  | health check scripts (root)                         |

---

---

## Vercel: `husky: command not found` (npm install exit 127)

- **Nguyên nhân:** script `prepare` gọi `husky` trong khi build cloud không có binary / hoặc thiếu devDependencies.
- **Đã xử lý:** `prepare` bỏ qua khi `VERCEL` hoặc `CI`; `vercel.json` dùng `npm install --include=dev`.

---

## npm: cảnh báo `ajv` / `ajv-keywords` (ERESOLVE)

- **Không phải thiếu package** nếu `Compiled successfully` — chỉ là peer dependency tree của webpack/CRA.
- Trước đây `devDependencies` có `ajv@^8` **không dùng trong source** → kéo xung đột với `schema-utils` / `ajv-keywords@3` (cần ajv 6). Đã **gỡ `ajv` khỏi devDependencies**; chạy lại `npm install`.
- **Không** thêm `overrides` `ajv-keywords@5` bừa với CRA 5 — dễ lỗi `Unknown keyword formatMinimum` lúc build.

`npm audit` (27+ issues) là chuyện khác; **không** chạy `npm audit fix --force` trên CRA nếu chưa test kỹ.

---

## `REACT_APP_WS_URL` (Socket.IO vs WebSocket thuần)

| Biến                      | Dùng cho                                                         | Giá trị production (Railway)                                                             |
| ------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `REACT_APP_WS_URL`        | **Socket.IO** (`websocketService.js`, LiveDashboard)             | Cùng `REACT_APP_API_URL`: `https://…up.railway.app` (**không** dùng `wss://` cho `io()`) |
| `REACT_APP_NATIVE_WS_URL` | **WebSocket** trình duyệt (`utils/websocket.js`, `useWebSocket`) | Chỉ khi có server `ws:`/`wss:` (vd. `backend/ws-server.js` public) — vd. `wss://host/ws` |

Nếu không set `REACT_APP_WS_URL`, Socket.IO vẫn dùng `REACT_APP_API_URL`. Script `scripts/update_vercel_env.sh` mặc định gán `REACT_APP_WS_URL` = API URL.

---

## Vercel CLI: cảnh báo & `Unexpected error`

### Cảnh báo `Did you mean to deploy the subdirectory "build"?`

- Luôn chạy CLI từ **root repo** (thư mục có `package.json` + `vercel.json`), **không** `cd build`.
- Nếu lỡ gõ kiểu `vercel build` khi cwd sai hoặc alias `vc` trỏ nhầm path, CLI có thể hiểu nhầm tên thư mục `build`.

### `Build not running on Vercel. System environment variables will not be available`

- `vercel build --prod` chạy **trên máy bạn** → **không** inject biến Production từ Dashboard vào CRA.
- Bundle có thể thiếu `REACT_APP_*` đúng nếu chỉ dựa vào Vercel cloud.
- **Cách ổn:** trước khi build local, kéo env production (hoặc dùng file local đã đúng):

```bash
cd /path/to/oas-integration
npx vercel@latest env pull .env.production.local --environment production -y
npm run build   # hoặc: npx vercel@latest build --prod
```

(Hoặc để Vercel **build trên cloud** khi push Git — env Production áp dụng tự động.)

### `Error: Unexpected error. Please try again later. ()`

Sau khi in **Inspect** + URL ~5–8s — kể cả `deploy --prebuilt --prod --yes` **đúng** vẫn có thể báo lỗi; deployment **có thể vẫn Ready** (bước cuối CLI / API Vercel).

1. Mở link **Inspect** → xem **Ready** hay **Error**.
2. **Prebuilt + preview vs production:** `.vercel/output` phải khớp target — `vercel build --prod` → bắt buộc `vercel deploy --prebuilt --prod`. Nếu chỉ `deploy --prebuilt` (preview) sẽ lỗi _prebuilt-environment-mismatch_; khi đó `rm -rf .vercel/output && vercel build && vercel deploy --prebuilt`.

3. **Prebuilt preview + Promote:** chỉ khi build **không** `--prod`:

```bash
cd /path/to/oas-integration
npx vercel@latest build
npx vercel@latest deploy --prebuilt --yes
```

1. Hoặc **Git push** → build trên Vercel (env đúng, ít lỗi CLI).
2. `vercel logs`: nếu cảnh báo subdirectory (`logs`, `build`), xem **Dashboard → Deployments**.

---

_Cập nhật: 2026-03-23_
