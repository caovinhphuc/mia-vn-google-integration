# Kiến trúc deploy Vercel + Google Sheets / Drive

Tài liệu ngắn: **Vercel chỉ host frontend**; Sheet/Drive hiển thị khi **backend + env production** khớp.

**URL ví dụ:** `https://react-oas-integration-v4-0.vercel.app`

---

## Luồng dữ liệu (80/20)

```
Người dùng
  → trình duyệt tải SPA từ Vercel (HTML/JS/CSS build sẵn)
  → React gọi API HTTPS (URL đã “đóng gói” lúc build từ REACT_APP_*)
  → Backend Node (Render/Railway/VPS/…) xử lý /api/sheets/*, /api/drive/* …
  → Backend dùng credential Google (service account / OAuth) gọi Google APIs
  → Trả JSON → UI render bảng, metadata Drive, v.v.
```

**Ý chính:** Trình duyệt **không** gọi trực tiếp Google với secret; secret nằm **server**. Frontend chỉ biết **base URL API** và (tuỳ màn) **spreadsheet ID / folder ID** công khai hoặc id sheet không phải bí mật tuyệt đối — quyền thật do backend + chia sẻ file Google quyết định.

---

## Vercel đang làm gì

| Thành phần                        | Vai trò                                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `vercel-build` → thư mục `build/` | CRA embed `process.env.REACT_APP_*` vào bundle tại **thời điểm build**                                                               |
| `vercel.json`                     | Static + SPA fallback; nên có `handle: filesystem` trước rule `→ index.html` để `/manifest.json` và asset gốc không bị trả nhầm HTML |

Đổi env trên Vercel **chưa ảnh hưởng** site đang chạy cho đến khi **trigger build/deploy mới**.

---

## Biến môi trường frontend (tối thiểu liên quan Sheet/Drive)

Đặt trong **Vercel → Project → Settings → Environment Variables** (Production), rồi **Redeploy**.

| Biến                                                                   | Ý nghĩa                                                                                                                    |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `REACT_APP_API_BASE_URL`                                               | Base API có suffix **`/api`** (ví dụ `https://your-backend.com/api`). Code `getGoogleProxyApiBase()` gom trùng `/api/api`. |
| `REACT_APP_API_URL`                                                    | Host API gốc (nhiều service dùng, ví dụ `https://your-backend.com`) — **không** dùng `localhost` trên production           |
| `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID` / `REACT_APP_GOOGLE_SHEET_ID` | ID spreadsheet mặc định (tuỳ component)                                                                                    |
| `REACT_APP_GOOGLE_DRIVE_FOLDER_ID`                                     | Folder Drive mặc định (nếu màn Drive dùng)                                                                                 |

**AI / realtime (không bắt buộc cho Sheet/Drive):**

| Biến                       | Ý nghĩa                                             |
| -------------------------- | --------------------------------------------------- |
| `REACT_APP_AI_SERVICE_URL` | Base URL ai-service (HTTPS), không `localhost`      |
| `REACT_APP_WS_URL`         | WebSocket (`wss://...`) nếu dùng dashboard realtime |

Backend cần **CORS** cho origin `https://<project>.vercel.app` (hoặc domain custom).

---

## Khi “đã deploy thành công và thấy Sheet/Drive”

Điều đó có nghĩa là:

1. Build trên Vercel chạy xong, asset serve đúng (kể cả manifest nếu đã cấu hình route).
2. `REACT_APP_API_BASE_URL` / `REACT_APP_API_URL` trỏ tới backend **đang online**.
3. Backend có route proxy Sheets/Drive và Google credentials hợp lệ; spreadsheet/folder đã share đúng quyền cho service account (nếu dùng SA).

---

## Troubleshooting nhanh

| Hiện tượng                                | Hướng xử lý                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Console vẫn gọi `localhost:3001` / `8000` | Env production chưa set hoặc chưa redeploy sau khi sửa env                                                    |
| `.../api/api/...` 404                     | Đã có helper gom `/api/api` trong `src/utils/apiBase.js` — kiểm tra env không tự chèn thừa `/api` ở tool khác |
| Manifest / SW lỗi MIME HTML               | Kiểm tra `vercel.json`: `filesystem` trước SPA fallback; hoặc PWA bỏ qua SW nếu không có file JS thật         |

---

## Liên quan trong repo

- Deploy tổng quan: `DEPLOYMENT_READY.md`
- Hướng dẫn Vercel chi tiết: `VERCEL_DEPLOYMENT_GUIDE.md` (nếu có trong repo)
- Chuẩn hóa base API Sheets/Drive: `src/utils/apiBase.js` (`getGoogleProxyApiBase`)

---

_Cập nhật: tháng 3/2026 — phù hợp CRA + Vercel static build._
