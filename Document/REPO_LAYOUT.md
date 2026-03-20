# Bản đồ repo — root là gì, “thiếu dep” là sao?

## Root (`react-oas-inntegration-x/`) = **frontend chính** + tooling

| Thành phần | Vai trò |
|------------|---------|
| **`package.json` ở root** | App **React (CRA)**: `src/`, `npm start` → port **3000**, `npm run build` → `build/`. Đây là **project frontend chính** bạn hay làm việc. |
| **`scripts/`** | Node scripts (bundle stats, perf, test…) — chạy từ **root**, dùng `package.json` root. |
| **`backend/`** | **Backend riêng**: có **`backend/package.json`** — `cd backend && npm start` (vd. port 3001). **Không** gộp dependency với root. |
| **`ai-service/`** | Python (FastAPI), không có `package.json` ở đây. |
| **`one_automation_system/`** | Python automation — `requirements.txt`. |
| **`google-sheets-project/`** | Package npm phụ (nếu dùng). |
| **`shared-services/`**, `server/` | Code dùng chung / script; **depcheck ở root** có thể báo “missing” vì file `.js` tham chiếu package **chưa khai báo ở root** — có thể cố ý (chạy từ chỗ khác) hoặc nên thêm vào `package.json` / chuyển sang `backend/`. |

**Tóm lại:** Khi nói “dự án React / dashboard Mia” → **làm việc ở root**, `npm install` **một lần ở root** cho frontend. Backend cài thêm trong `backend/`.

---

## “Thiếu dependency” khi chạy `npx depcheck`

- **depcheck** chỉ nhìn **`package.json` root** + import trong code nó quét được.
- Báo **Unused**: có thể đúng (đã xóa chart.js…) hoặc sai (dynamic import).
- Báo **Missing** (webpack, `@sendgrid/mail`, …): thường là file **`webpack.config.js`**, **`shared-services/`**, **`server/`** — **không phải** bundle CRA chính; CRA dùng config nội bộ, không cần `webpack` trong `dependencies` root trừ khi bạn tự chạy webpack đó.

**Không bắt buộc** cài hết “missing” vào root — chỉ thêm nếu bạn **thực sự** chạy script đó từ root.

---

## Lệnh phân tích bundle (đúng chỗ)

Chạy từ **root** sau `npm run build`:

```bash
npm run bundle:stats      # hoặc perf:bundle
npm run analyze           # webpack-bundle-analyzer
npm run build:maps && npm run explore:chunk   # source-map-explorer (1 chunk lớn)
```

Tránh: `npx source-map-explorer build/static/js/*.js` (glob + map + glob@10 dễ lỗi) — dùng `npm run explore:chunk`.

---

**Cập nhật:** 2026-03-20
